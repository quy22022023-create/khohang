import { MAX_BATCH_DELETE_FILES } from "../core/config.js";
import { GitHubError } from "../core/errors.js";
import { normalizeRelativePath } from "../core/paths.js";

// Plan against a complete, pinned Git tree. Contents API directory lists can be
// capped at 1,000 items, so they must never be used to enumerate a deletion.
export function planDeletion(
  snapshot,
  selected,
  limit = MAX_BATCH_DELETE_FILES,
) {
  if (
    !snapshot ||
    snapshot.truncated !== false ||
    !Array.isArray(snapshot.tree)
  )
    throw new GitHubError(
      "GitHub không trả đủ cây file của kho. Chưa xoá gì; hãy thực hiện lần xoá này bằng GitHub hoặc Git.",
    );
  if (!Array.isArray(selected) || !selected.length)
    throw new GitHubError("Chọn ít nhất một file hoặc thư mục cần xoá.");
  const entries = new Map();
  for (const entry of snapshot.tree) {
    normalizeRelativePath(entry.path);
    const modes = {
      blob: ["100644", "100755", "120000"],
      tree: ["040000"],
      commit: ["160000"],
    };
    if (
      entries.has(entry.path) ||
      !modes[entry.type]?.includes(entry.mode) ||
      typeof entry.sha !== "string" ||
      !entry.sha
    )
      throw new GitHubError(
        "Cây file GitHub không đầy đủ hoặc không hợp lệ. Chưa xoá gì.",
      );
    entries.set(entry.path, entry);
  }
  const targets = new Map();
  for (const item of selected) {
    const path = normalizeRelativePath(item.path);
    const current = entries.get(path);
    if (
      !current ||
      current.sha !== item.sha ||
      (item.type === "dir"
        ? current.type !== "tree"
        : item.type !== "file" || current.type !== "blob")
    )
      throw new GitHubError(
        `“${path}” đã thay đổi. Hãy làm mới danh sách rồi chọn lại.`,
        409,
      );
    targets.set(path, { ...item, path });
  }
  // Collapse overlapping selections so no file is deleted twice.
  const roots = [...targets.values()].filter(
    (item) =>
      ![...targets.values()].some(
        (parent) =>
          parent.type === "dir" && item.path.startsWith(parent.path + "/"),
      ),
  );
  const files = [...entries.values()]
    .filter(
      (entry) =>
        entry.type !== "tree" &&
        roots.some(
          (root) =>
            entry.path === root.path ||
            (root.type === "dir" && entry.path.startsWith(root.path + "/")),
        ),
    )
    .sort((a, b) => a.path.localeCompare(b.path));
  if (!files.length)
    throw new GitHubError("Không có file nào để xoá trong các mục đã chọn.");
  if (files.length > limit)
    throw new GitHubError(
      `Mỗi lần xoá tối đa ${limit.toLocaleString("vi")} file. Chưa xoá gì; hãy chia nhỏ lựa chọn.`,
    );
  return { roots, files };
}
