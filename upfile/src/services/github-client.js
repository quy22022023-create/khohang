import {
  API_ORIGIN,
  MAX_FILE_SIZE,
  READ_TIMEOUT_MS,
  WRITE_TIMEOUT_MS,
  MAX_DOWNLOAD_FILE_BYTES,
} from "../core/config.js";
import {
  GitHubError,
  responseError,
  assertObject,
  uncertainWriteError,
} from "../core/errors.js";
import { repoPath, filePath, branchName, segment } from "../core/paths.js";
import { planDeletion } from "./delete-plan.js";
import { planDownload } from "./download-plan.js";

export async function toBase64(blob) {
  if (
    !blob ||
    typeof blob.arrayBuffer !== "function" ||
    !Number.isFinite(blob.size)
  )
    throw new GitHubError("Vui lòng chọn một file hợp lệ.");
  if (blob.size > MAX_FILE_SIZE)
    throw new GitHubError("Mỗi file được tải lên tối đa 25 MB trên trang này.");
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(
      ...bytes.subarray(offset, offset + chunkSize),
    );
  }
  return btoa(binary);
}

export class GitHubClient {
  #token;
  #fetch;
  #readTimeout;
  #writeTimeout;
  constructor(
    token,
    {
      fetchImpl = globalThis.fetch,
      readTimeout = READ_TIMEOUT_MS,
      writeTimeout = WRITE_TIMEOUT_MS,
    } = {},
  ) {
    if (
      typeof token !== "string" ||
      !token.trim() ||
      /[\x00-\x20\x7f]/.test(token.trim())
    ) {
      throw new GitHubError("Vui lòng nhập GitHub token hợp lệ.");
    }
    this.#token = token.trim();
    // Browser fetch must keep its Window receiver when stored on a client instance.
    this.#fetch = fetchImpl.bind(globalThis);
    this.#readTimeout = readTimeout;
    this.#writeTimeout = writeTimeout;
  }

  async #request(path, { method = "GET", body, signal } = {}) {
    if (signal?.aborted)
      throw new DOMException("Đã huỷ tải xuống.", "AbortError");
    const writing = method !== "GET";
    const controller = new AbortController();
    const cancel = () => controller.abort();
    signal?.addEventListener("abort", cancel, { once: true });
    let timedOut = false;
    const timer = setTimeout(
      () => {
        timedOut = true;
        controller.abort();
      },
      writing ? this.#writeTimeout : this.#readTimeout,
    );
    try {
      let response;
      try {
        response = await this.#fetch(`${API_ORIGIN}${path}`, {
          method,
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${this.#token}`,
            "X-GitHub-Api-Version": "2022-11-28",
            ...(body !== undefined
              ? { "Content-Type": "application/json" }
              : {}),
          },
          ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
          credentials: "omit",
          cache: "no-store",
          redirect: "error",
          referrerPolicy: "no-referrer",
          signal: controller.signal,
        });
      } catch {
        if (signal?.aborted)
          throw new DOMException("Đã huỷ tải xuống.", "AbortError");
        if (writing)
          throw uncertainWriteError(
            "Mất kết nối hoặc hết thời gian chờ. Kết quả thay đổi chưa xác định; hãy làm mới và kiểm tra GitHub trước khi thao tác tiếp.",
          );
        throw new GitHubError(
          timedOut
            ? "GitHub phản hồi quá lâu. Hãy kiểm tra mạng và bấm làm mới."
            : "Không kết nối được GitHub. Kiểm tra mạng rồi thử lại.",
        );
      }
      let data;
      try {
        data = await response.json();
      } catch {
        if (signal?.aborted)
          throw new DOMException("Đã huỷ tải xuống.", "AbortError");
        if (writing && (response.ok || response.status >= 500))
          throw uncertainWriteError(
            "Không đọc được xác nhận thay đổi từ GitHub. Hãy làm mới và kiểm tra kết quả trước khi thao tác tiếp.",
            response.status,
          );
        if (!response.ok)
          throw responseError(response.status, response.headers);
        throw new GitHubError(
          "Không đọc được phản hồi GitHub. Hãy tải lại danh sách để kiểm tra kết quả.",
        );
      }
      if (!response.ok) {
        const error = responseError(response.status, response.headers, data);
        if (writing && response.status >= 500) {
          error.uncertain = true;
          error.message =
            "GitHub gặp lỗi khi xác nhận thay đổi. Kết quả chưa xác định; hãy làm mới và kiểm tra GitHub trước khi thao tác tiếp.";
        }
        throw error;
      }
      return data;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", cancel);
    }
  }

  async #list(path, maxPages = 5) {
    const items = [];
    for (let page = 1; page <= maxPages; page++) {
      const separator = path.includes("?") ? "&" : "?";
      const data = await this.#request(
        `${path}${separator}per_page=100&page=${page}`,
      );
      if (!Array.isArray(data))
        throw new GitHubError("Danh sách từ GitHub không hợp lệ.");
      items.push(...data);
      if (data.length < 100) break;
    }
    return items;
  }

  async getUser() {
    const user = assertObject(await this.#request("/user"), "tài khoản");
    if (typeof user.login !== "string")
      throw new GitHubError("Không xác định được tài khoản GitHub.");
    return user;
  }

  async listRepositories() {
    // GitHub supports this endpoint for classic and fine-grained personal tokens.
    return this.#list(
      "/user/repos?sort=pushed&direction=desc&affiliation=owner,collaborator,organization_member",
    );
  }

  async getRepository(owner, repo) {
    const data = assertObject(
      await this.#request(repoPath(owner, repo)),
      "kho",
    );
    if (typeof data.name !== "string" || !data.owner?.login)
      throw new GitHubError("Không đọc được thông tin kho GitHub.");
    return data;
  }

  async listBranches(owner, repo) {
    return this.#list(`${repoPath(owner, repo)}/branches`);
  }

  async listContents(owner, repo, path = "", branch) {
    const encoded = filePath(path, false);
    const query = new URLSearchParams({ ref: branchName(branch) });
    const data = await this.#request(
      `${repoPath(owner, repo)}/contents${encoded ? `/${encoded}` : ""}?${query}`,
    );
    if (!Array.isArray(data))
      throw new GitHubError("Đường dẫn đang mở không phải thư mục.");
    return data;
  }

  async getFile(owner, repo, path, branch) {
    const query = new URLSearchParams({ ref: branchName(branch) });
    const file = assertObject(
      await this.#request(
        `${repoPath(owner, repo)}/contents/${filePath(path)}?${query}`,
      ),
      "file",
    );
    if (typeof file.sha !== "string" || file.type !== "file")
      throw new GitHubError("Đường dẫn này không phải file thông thường.");
    return file;
  }

  async getBranchHead(owner, repo, branch, { signal } = {}) {
    const data = await this.#request(
      `${repoPath(owner, repo)}/git/ref/heads/${filePath(branchName(branch))}`,
      { signal },
    );
    if (data?.object?.type !== "commit" || typeof data.object.sha !== "string")
      throw new GitHubError("Không đọc được phiên bản hiện tại của nhánh.");
    return data.object.sha;
  }

  async readTreeSnapshot(owner, repo, branch, { signal } = {}) {
    const head = await this.getBranchHead(owner, repo, branch, { signal });
    const commit = await this.#request(
      `${repoPath(owner, repo)}/git/commits/${segment(head, "Phiên bản nhánh")}`,
      { signal },
    );
    if (!commit?.tree?.sha)
      throw new GitHubError("Không đọc được cây file của nhánh.");
    const snapshot = await this.#request(
      `${repoPath(owner, repo)}/git/trees/${segment(commit.tree.sha, "Cây file")}?recursive=1`,
      { signal },
    );
    return { head, tree: commit.tree.sha, snapshot };
  }

  async prepareDeletion(owner, repo, branch, selected) {
    const { head, tree, snapshot } = await this.readTreeSnapshot(
      owner,
      repo,
      branch,
    );
    return {
      ...planDeletion(snapshot, selected),
      owner,
      repo,
      branch,
      head,
      tree,
    };
  }

  async prepareDownload(
    owner,
    repo,
    branch,
    selected,
    { basePath = "", signal } = {},
  ) {
    const { head, snapshot } = await this.readTreeSnapshot(
      owner,
      repo,
      branch,
      { signal },
    );
    return {
      ...planDownload(snapshot, selected, basePath),
      head,
      owner,
      repo,
      branch,
    };
  }

  async getBlob(
    owner,
    repo,
    sha,
    { signal, expectedSize, maxBytes = MAX_DOWNLOAD_FILE_BYTES } = {},
  ) {
    const data = await this.#request(
      `${repoPath(owner, repo)}/git/blobs/${segment(sha, "Phiên bản file")}`,
      { signal },
    );
    if (
      data?.sha !== sha ||
      data.encoding !== "base64" ||
      typeof data.content !== "string" ||
      !Number.isSafeInteger(data.size) ||
      data.size < 0 ||
      (expectedSize !== undefined && data.size !== expectedSize)
    )
      throw new GitHubError(
        "Nội dung file từ GitHub không khớp phiên bản hoặc kích thước đã chọn.",
      );
    if (data.size > maxBytes)
      throw new GitHubError("File vượt giới hạn tải xuống.");
    const encoded = data.content.replace(/\s/g, "");
    if (encoded.length > Math.ceil(maxBytes / 3) * 4)
      throw new GitHubError("Nội dung file tải xuống quá lớn.");
    let binary;
    try {
      binary = atob(encoded);
    } catch {
      throw new GitHubError("Không giải mã được nội dung file từ GitHub.");
    }
    if (binary.length !== data.size)
      throw new GitHubError(
        "File tải xuống không đủ dữ liệu; ZIP chưa được tạo.",
      );
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index++)
      bytes[index] = binary.charCodeAt(index);
    return bytes;
  }

  async deleteBatch(plan, onProgress = () => {}) {
    if (!plan?.files?.length) throw new GitHubError("Không có file để xoá.");
    const { owner, repo, branch, head, tree, files } = plan;
    const base = repoPath(owner, repo);
    onProgress("Đang kiểm tra phiên bản nhánh…");
    if ((await this.getBranchHead(owner, repo, branch)) !== head)
      throw new GitHubError(
        "Nhánh đã thay đổi trong lúc xác nhận. Chưa xoá gì; hãy làm mới danh sách rồi chọn lại.",
        409,
      );
    onProgress(`Đang chuẩn bị xoá ${files.length} file…`);
    const nextTree = await this.#request(`${base}/git/trees`, {
      method: "POST",
      body: {
        base_tree: tree,
        tree: files.map((file) => ({
          path: file.path,
          mode: file.mode,
          type: file.type,
          sha: null,
        })),
      },
    });
    if (!nextTree?.sha)
      throw new GitHubError(
        "Chưa chuẩn bị được thay đổi; nhánh chưa được cập nhật.",
      );
    const commit = await this.#request(`${base}/git/commits`, {
      method: "POST",
      body: {
        message: `Delete ${files.length} files via GitPocket`,
        tree: nextTree.sha,
        parents: [head],
      },
    });
    if (!commit?.sha)
      throw new GitHubError(
        "Chưa tạo được bản thay đổi; nhánh chưa được cập nhật.",
      );
    onProgress("Đang lưu thay đổi lên GitHub…");
    // Never force-update: a concurrent commit must prevent the whole batch
    // from being applied, instead of overwriting that commit or deleting partly.
    const result = await this.#request(
      `${base}/git/refs/heads/${filePath(branchName(branch))}`,
      {
        method: "PATCH",
        body: { sha: commit.sha, force: false },
      },
    );
    if (result?.object?.sha !== commit.sha)
      throw uncertainWriteError(
        "Chưa xác nhận được kết quả xoá. Hãy làm mới và kiểm tra GitHub trước khi thao tác tiếp.",
      );
    return { commit: commit.sha, count: files.length };
  }

  async uploadFile(owner, repo, path, branch, blob, { message, sha } = {}) {
    const endpoint = `${repoPath(owner, repo)}/contents/${filePath(path)}`;
    const targetBranch = branchName(branch);
    if (sha !== undefined && (typeof sha !== "string" || !sha))
      throw new GitHubError(
        "Thông tin file đã thay đổi. Hãy tải lại danh sách.",
      );
    const content = await toBase64(blob);
    const data = await this.#request(endpoint, {
      method: "PUT",
      body: {
        message:
          message?.trim() ||
          `${sha ? "Update" : "Upload"} ${path} via GitPocket`,
        content,
        branch: targetBranch,
        ...(sha ? { sha } : {}),
      },
    });
    if (!data?.commit?.sha)
      throw uncertainWriteError(
        "GitHub chưa xác nhận kết quả tải lên. Hãy tải lại danh sách để kiểm tra.",
      );
    return data;
  }

  async deleteFile(owner, repo, path, branch, sha, message) {
    if (typeof sha !== "string" || !sha)
      throw new GitHubError(
        "Thiếu thông tin phiên bản file. Hãy tải lại danh sách.",
      );
    const data = await this.#request(
      `${repoPath(owner, repo)}/contents/${filePath(path)}`,
      {
        method: "DELETE",
        body: {
          message: message?.trim() || `Delete ${path} via GitPocket`,
          sha,
          branch: branchName(branch),
        },
      },
    );
    if (!data?.commit?.sha)
      throw uncertainWriteError(
        "GitHub chưa xác nhận kết quả xoá. Hãy tải lại danh sách để kiểm tra.",
      );
    return data;
  }
}
