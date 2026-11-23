import { GitHubError } from "./errors.js";
import { MAX_PATH_LENGTH } from "./config.js";

export function segment(value, label) {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    /[\x00-\x1f\x7f/\\]/.test(value) ||
    value === "." ||
    value === ".."
  ) {
    throw new GitHubError(`${label} không hợp lệ.`);
  }
  return encodeURIComponent(value);
}

export function repoPath(owner, repo) {
  return `/repos/${segment(owner, "Tên tài khoản")}/${segment(repo, "Tên kho")}`;
}

export function filePath(path, required = true) {
  if (
    typeof path !== "string" ||
    path.length > MAX_PATH_LENGTH ||
    (required && !path) ||
    path.startsWith("/") ||
    path.endsWith("/") ||
    /[\x00-\x1f\x7f\\]/.test(path)
  ) {
    if (path === "" && !required) return "";
    throw new GitHubError("Đường dẫn file không hợp lệ.");
  }
  if (!path) return "";
  return path
    .split("/")
    .map((part) => segment(part, "Đường dẫn file"))
    .join("/");
}

export function branchName(branch) {
  if (
    typeof branch !== "string" ||
    !branch.trim() ||
    /[\x00-\x1f\x7f]/.test(branch)
  ) {
    throw new GitHubError("Vui lòng chọn nhánh trước khi thao tác.");
  }
  return branch;
}

export function normalizeRelativePath(value) {
  if (
    typeof value !== "string" ||
    !value ||
    value.length > MAX_PATH_LENGTH ||
    value.startsWith("/") ||
    /[\\\x00-\x1f\x7f]/.test(value)
  ) {
    throw new Error(
      "Đường dẫn phải là đường dẫn tương đối, không có dấu \\ hoặc ký tự điều khiển.",
    );
  }
  // Preserve the actual filename, including Unicode, spaces and reserved URL characters.
  const parts = value.split("/");
  if (parts.some((part) => !part || part === "." || part === "..")) {
    throw new Error("Đường dẫn không được có đoạn trống, . hoặc ...");
  }
  return parts.join("/");
}

export function uploadRelativePath(file) {
  if (!file || typeof file.name !== "string")
    throw new Error("Không đọc được tên file đã chọn.");
  return normalizeRelativePath(file.webkitRelativePath || file.name);
}

export function parseRepo(value) {
  if (typeof value !== "string")
    throw new Error("Nhập link hoặc tên kho GitHub.");
  let v = value.trim().replace(/\/+$/, "");
  if (/^https?:\/\//i.test(v)) {
    let u;
    try {
      u = new URL(v);
    } catch {
      throw Error("Link GitHub không hợp lệ.");
    }
    if (
      u.protocol !== "https:" ||
      u.hostname !== "github.com" ||
      u.port ||
      u.username ||
      u.password ||
      u.search ||
      u.hash
    )
      throw Error("Hãy dùng link dạng https://github.com/tai-khoan/ten-kho.");
    v = u.pathname.replace(/^\//, "");
  }
  const parts = v.replace(/\.git$/, "").split("/");
  if (
    parts.length !== 2 ||
    parts.some(
      (p) => !p || p === "." || p === ".." || !/^[A-Za-z0-9_.-]+$/.test(p),
    )
  )
    throw Error("Nhập tên dạng tai-khoan/ten-kho hoặc link tới kho GitHub.");
  return parts;
}
export function safeGitHubUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" &&
      u.hostname === "github.com" &&
      !u.port &&
      !u.username &&
      !u.password
      ? u.href
      : null;
  } catch {
    return null;
  }
}
