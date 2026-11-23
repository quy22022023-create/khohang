import { $, formatBytes } from "../components/dom.js";
import { GitHubError } from "../core/errors.js";
import { downloadArchive } from "../services/download-archive.js";

const safeFilename = (value) =>
  value.replace(/[^\p{L}\p{N}._-]+/gu, "-").slice(0, 100) || "github";

export function createDownloadFeature(app) {
  const { state, busy, canRead, notice } = app;
  let active = null,
    objectUrl = null;

  function reset() {
    active?.abort();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = null;
    $("download-save").removeAttribute("href");
    $("download-save").removeAttribute("download");
    $("download-save").classList.add("hidden");
    $("download-progress").classList.add("hidden");
  }

  $("download-cancel").onclick = () => active?.abort();
  $("download-selected").onclick = () =>
    busy(async () => {
      if (!canRead())
        throw new GitHubError("Hãy làm mới và chọn các mục cần tải xuống.");
      const items = state.contents.filter((item) =>
        state.selectedPaths.has(item.path),
      );
      reset();
      const controller = new AbortController();
      active = controller;
      $("download-progress").classList.remove("hidden");
      $("download-cancel").classList.remove("hidden");
      $("download-progress-text").textContent =
        "Đang đọc danh sách file trong các thư mục đã chọn…";
      $("download-bar").removeAttribute("value");
      try {
        const plan = await state.client.prepareDownload(
          state.repo.owner.login,
          state.repo.name,
          state.branch,
          items,
          { basePath: state.path, signal: controller.signal },
        );
        const archive = await downloadArchive(state.client, plan, {
          signal: controller.signal,
          onProgress: (progress) => {
            $("download-bar").max = Math.max(1, progress.total);
            $("download-bar").value = progress.completed;
            $("download-progress-text").textContent =
              progress.phase === "zip"
                ? "Đang đóng gói ZIP…"
                : `Đã tải ${progress.completed}/${progress.total} file · ${formatBytes(progress.bytes)} / ${formatBytes(progress.totalBytes)}${progress.path ? ` · ${progress.path}` : ""}`;
          },
        });
        objectUrl = URL.createObjectURL(archive);
        const save = $("download-save");
        save.href = objectUrl;
        save.download = `${safeFilename(plan.repo)}-${safeFilename(plan.branch)}-${safeFilename(plan.head.slice(0, 7))}.zip`;
        save.classList.remove("hidden");
        $("download-bar").max = 1;
        $("download-bar").value = 1;
        $("download-progress-text").textContent =
          `ZIP sẵn sàng · ${plan.files.length} file · ${formatBytes(archive.size)}`;
        save.click();
        notice(
          `Đã tạo ZIP cho ${plan.roots.length} mục đã chọn. Nếu trình duyệt chưa lưu, bấm “Lưu ZIP”.`,
        );
      } catch (error) {
        $("download-bar").max = 1;
        $("download-bar").value = 0;
        if (error.name === "AbortError") {
          $("download-progress-text").textContent =
            "Đã huỷ tải xuống; chưa tạo ZIP.";
          notice("Đã huỷ tải xuống.", "info");
        } else {
          $("download-progress-text").textContent =
            "Tải xuống chưa hoàn tất; chưa tạo ZIP. Có thể thử lại sau khi kiểm tra lỗi.";
          throw error;
        }
      } finally {
        active = null;
        $("download-cancel").classList.add("hidden");
      }
    });
  return { reset };
}
