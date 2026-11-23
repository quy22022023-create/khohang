import { GitHubError } from "../core/errors.js";
import { normalizeRelativePath } from "../core/paths.js";

function hasAncestor(path, directories) {
  let index = path.lastIndexOf("/");
  while (index !== -1) {
    if (directories.has(path.slice(0, index))) return true;
    index = path.lastIndexOf("/", index - 1);
  }
  return false;
}

// Download and deletion use a complete tree pinned to a commit; Contents API
// listings can omit entries beyond the first 1,000 files in a directory.
export function selectGitEntries(snapshot, selected) {
  if (
    !snapshot ||
    snapshot.truncated !== false ||
    !Array.isArray(snapshot.tree)
  )
    throw new GitHubError(
      "GitHub không trả đủ cây file của kho. Hãy thực hiện thao tác này bằng GitHub hoặc Git.",
    );
  if (!Array.isArray(selected) || !selected.length)
    throw new GitHubError("Chọn ít nhất một file hoặc thư mục.");
  const modes = {
    blob: ["100644", "100755", "120000"],
    tree: ["040000"],
    commit: ["160000"],
  };
  const entries = new Map();
  for (const entry of snapshot.tree) {
    normalizeRelativePath(entry?.path);
    if (
      entries.has(entry.path) ||
      !modes[entry.type]?.includes(entry.mode) ||
      typeof entry.sha !== "string" ||
      !entry.sha
    )
      throw new GitHubError("Cây file GitHub không đầy đủ hoặc không hợp lệ.");
    entries.set(entry.path, entry);
  }
  const targets = new Map();
  for (const item of selected) {
    const path = normalizeRelativePath(item.path),
      current = entries.get(path);
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
  const directories = new Set(
    [...targets.values()]
      .filter((item) => item.type === "dir")
      .map((item) => item.path),
  );
  const roots = [...targets.values()].filter(
    (item) => !hasAncestor(item.path, directories),
  );
  const scope = [...entries.values()]
    .filter(
      (entry) =>
        targets.has(entry.path) || hasAncestor(entry.path, directories),
    )
    .sort((a, b) => a.path.localeCompare(b.path));
  return { roots, entries: scope };
}
