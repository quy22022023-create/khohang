import { GitHubError } from "../core/errors.js";
import { createZip } from "./zip-store.js";

const pause = () => new Promise((resolve) => setTimeout(resolve, 0));

export async function downloadArchive(
  client,
  plan,
  { signal, onProgress = () => {} } = {},
) {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal?.addEventListener("abort", cancel, { once: true });
  if (signal?.aborted) controller.abort();
  const check = () => {
    if (controller.signal.aborted)
      throw new DOMException("Đã huỷ tải xuống.", "AbortError");
  };
  const results = new Array(plan.files.length),
    blobs = new Map();
  let cursor = 0,
    completed = 0,
    bytes = 0,
    firstError;
  const progress = (phase, path = "") =>
    onProgress({
      phase,
      path,
      completed,
      total: plan.files.length,
      bytes,
      totalBytes: plan.totalBytes,
    });
  async function worker() {
    try {
      while (true) {
        check();
        const index = cursor++;
        if (index >= plan.files.length) return;
        const file = plan.files[index];
        if (!blobs.has(file.sha))
          blobs.set(
            file.sha,
            client.getBlob(plan.owner, plan.repo, file.sha, {
              signal: controller.signal,
              expectedSize: file.size,
            }),
          );
        const data = await blobs.get(file.sha);
        check();
        if (data.length !== file.size)
          throw new GitHubError(`Kích thước không khớp: ${file.path}`);
        const prefix = new TextDecoder().decode(data.subarray(0, 200));
        if (
          /^version https:\/\/git-lfs\.github\.com\/spec\/v1\r?\noid sha256:/.test(
            prefix,
          )
        )
          throw new GitHubError(
            `“${file.path}” dùng Git LFS. Hãy tải nội dung gốc bằng Git LFS; ZIP chưa được tạo.`,
          );
        // Symlinks are downloaded as regular files containing their target text;
        // never follow them or create extraction-time links outside the archive.
        results[index] = {
          path: file.archivePath,
          data,
          mode: file.mode === "100755" ? "100755" : "100644",
        };
        completed++;
        bytes += data.length;
        progress("files", file.path);
      }
    } catch (error) {
      firstError ??= error;
      controller.abort();
      throw error;
    }
  }
  try {
    check();
    progress("files");
    // Read-only requests can overlap safely. On failure, abort and settle every
    // worker before releasing the UI, so an old request cannot affect a new job.
    await Promise.allSettled(
      Array.from({ length: Math.min(3, plan.files.length) }, () => worker()),
    );
    if (firstError) throw firstError;
    check();
    progress("zip");
    await pause();
    check();
    const archive = createZip([...plan.directories, ...results]);
    await pause();
    check();
    return archive;
  } finally {
    signal?.removeEventListener("abort", cancel);
  }
}
