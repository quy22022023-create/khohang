import {
  MAX_DOWNLOAD_ENTRIES,
  MAX_DOWNLOAD_FILE_BYTES,
  MAX_DOWNLOAD_BYTES,
} from "../core/config.js";
import { GitHubError } from "../core/errors.js";
import { normalizeRelativePath } from "../core/paths.js";
import { selectGitEntries } from "./git-tree.js";
import { archiveName } from "./zip-store.js";

export function planDownload(snapshot, selected, basePath = "") {
  if (basePath) normalizeRelativePath(basePath);
  const { roots, entries } = selectGitEntries(snapshot, selected);
  if (entries.length > MAX_DOWNLOAD_ENTRIES)
    throw new GitHubError(
      `Mỗi ZIP tối đa ${MAX_DOWNLOAD_ENTRIES.toLocaleString("vi")} file và thư mục. Hãy chia nhỏ lựa chọn.`,
    );
  const prefix = basePath ? basePath + "/" : "";
  let totalBytes = 0;
  const files = [],
    directories = [];
  for (const entry of entries) {
    if (!entry.path.startsWith(prefix))
      throw new GitHubError("Mục đã chọn không thuộc thư mục đang mở.");
    const path = entry.path.slice(prefix.length);
    archiveName(path, entry.type === "tree");
    if (entry.type === "commit")
      throw new GitHubError(
        `“${entry.path}” là submodule. Hãy tải kho submodule riêng; ZIP chưa được tạo.`,
      );
    if (entry.type === "tree") {
      directories.push({ path, directory: true });
      continue;
    }
    if (!Number.isSafeInteger(entry.size) || entry.size < 0)
      throw new GitHubError(
        `Không xác định được kích thước file: ${entry.path}`,
      );
    if (entry.size > MAX_DOWNLOAD_FILE_BYTES)
      throw new GitHubError(
        `“${entry.path}” vượt giới hạn tải xuống 50 MB/file.`,
      );
    totalBytes += entry.size;
    if (totalBytes > MAX_DOWNLOAD_BYTES)
      throw new GitHubError(
        "Tổng nội dung tải xuống vượt 100 MB. Hãy chia thành các lần nhỏ hơn.",
      );
    files.push({ ...entry, archivePath: path });
  }
  return { roots, files, directories, totalBytes };
}
