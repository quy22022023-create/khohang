export class GitHubError extends Error {
  constructor(message, status = 0, retryAfter = 0) {
    super(message);
    this.name = "GitHubError";
    this.status = status;
    this.retryAfter = retryAfter;
    this.uncertain = false;
  }
}

export function uncertainWriteError(message, status = 0) {
  const error = new GitHubError(message, status);
  error.uncertain = true;
  return error;
}

export function responseError(status, headers, body) {
  let retryAfter = Number(headers.get("retry-after")) || 0;
  const reset = Number(headers.get("x-ratelimit-reset"));
  const limited =
    status === 429 ||
    (status === 403 &&
      (headers.get("x-ratelimit-remaining") === "0" ||
        /rate limit|abuse detection/i.test(body?.message || "")));
  if (limited && !retryAfter && reset)
    retryAfter = Math.max(1, reset - Math.floor(Date.now() / 1000));
  let message;
  if (limited)
    message =
      "GitHub đang giới hạn số lần truy cập. Vui lòng chờ một lúc rồi thử lại.";
  else if (status === 401)
    message =
      "Token không hợp lệ hoặc đã hết hạn. Vui lòng kết nối lại bằng token mới.";
  else if (status === 403)
    message =
      "Token chưa có quyền thao tác. Kiểm tra kho đã chọn, quyền Contents: Read and write, hoặc quy định bảo vệ nhánh của GitHub.";
  else if (status === 404)
    message =
      "Không tìm thấy kho, nhánh hoặc file. Kiểm tra đường dẫn và quyền truy cập của token.";
  else if (status === 409)
    message =
      "File hoặc nhánh vừa thay đổi trên GitHub. Hãy tải lại danh sách rồi thử lại.";
  else if (status === 422)
    message =
      "GitHub từ chối thay đổi. Kiểm tra tên file, nội dung, quyền token và quy định của nhánh; sau đó tải lại danh sách.";
  else if (status >= 500)
    message = "GitHub đang gặp lỗi. Vui lòng thử lại sau.";
  else message = `Không thể hoàn tất yêu cầu với GitHub (mã ${status}).`;
  return new GitHubError(message, status, retryAfter);
}

export function assertObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new GitHubError(`Dữ liệu ${label} từ GitHub không hợp lệ.`);
  return value;
}
