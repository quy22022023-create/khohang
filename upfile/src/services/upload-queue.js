import { MAX_FILE_SIZE, MAX_QUEUE_FILES } from "../core/config.js";
import { normalizeRelativePath, uploadRelativePath } from "../core/paths.js";

export function pathsConflict(first, second) {
  return (
    first === second ||
    first.startsWith(second + "/") ||
    second.startsWith(first + "/")
  );
}

// Collecting several pickers/drops only appends to the queue. Conflicts are
// reported before any network write, with previously queued files preserved.
export function mergeUploadQueue(queue, entries) {
  const next = [...queue],
    errors = [];
  let added = 0;
  for (const entry of entries) {
    const file = entry?.file || entry;
    let path;
    try {
      path = entry?.relativePath
        ? normalizeRelativePath(entry.relativePath)
        : uploadRelativePath(file);
      if (
        !file ||
        !Number.isFinite(file.size) ||
        file.size < 0 ||
        typeof file.arrayBuffer !== "function"
      )
        throw new Error("Không đọc được file.");
      if (file.size > MAX_FILE_SIZE) throw new Error("Vượt 25 MB.");
      if (
        next.filter((item) => item.status !== "done").length >= MAX_QUEUE_FILES
      )
        throw new Error(
          `Danh sách chờ tối đa ${MAX_QUEUE_FILES.toLocaleString("vi")} file.`,
        );
      const conflict = next.find(
        (item) =>
          item.status !== "done" && pathsConflict(item.relativePath, path),
      );
      if (conflict)
        throw new Error(
          conflict.relativePath === path
            ? "Đã có trong danh sách chờ."
            : `Trùng đường dẫn file/thư mục với “${conflict.relativePath}”.`,
        );
      next.push({ file, relativePath: path, status: "ready", detail: "" });
      added++;
    } catch (error) {
      errors.push(`${path || file?.name || "File"}: ${error.message}`);
    }
  }
  return { queue: next, errors, added };
}

export function uploadGroups(queue) {
  const groups = new Map();
  for (const item of queue) {
    const folder = item.relativePath.includes("/")
      ? item.relativePath.split("/")[0]
      : "";
    if (!groups.has(folder)) groups.set(folder, []);
    groups.get(folder).push(item);
  }
  return [...groups].map(([folder, items]) => ({ folder, items }));
}
