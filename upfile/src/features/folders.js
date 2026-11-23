import { $ } from "../components/dom.js";
import { normalizeRelativePath } from "../core/paths.js";

export function initFolderFeature(app, browser) {
  const { state, busy, assertWritable, notice, handleError } = app;
  $("create-folder").onclick = () => {
    if (state.busy || !app.canWrite()) return;
    $("folder-location").textContent =
      `${state.repo.full_name} · ${state.branch} / ${state.path || "(thư mục gốc)"}`;
    $("folder-name").value = "";
    $("folder-error").textContent = "";
    $("folder-dialog").showModal();
  };
  $("folder-form").onsubmit = (event) => {
    event.preventDefault();
    busy(async () => {
      $("folder-error").textContent = "";
      try {
        assertWritable();
        const name = normalizeRelativePath($("folder-name").value.trim());
        const path = normalizeRelativePath(
          [state.path, name].filter(Boolean).join("/"),
        );
        normalizeRelativePath(`${path}/.gitkeep`);
        if (!state.emptyRepo) {
          let exists = false;
          try {
            await state.client.listContents(
              state.repo.owner.login,
              state.repo.name,
              path,
              state.branch,
            );
            exists = true;
          } catch (error) {
            if (error.status !== 404) throw error;
          }
          if (exists)
            throw new Error(
              "Thư mục này đã tồn tại. Hãy chọn tên khác hoặc mở thư mục trong danh sách.",
            );
        }
        await state.client.uploadFile(
          state.repo.owner.login,
          state.repo.name,
          `${path}/.gitkeep`,
          state.branch,
          new Blob([""], { type: "text/plain" }),
          { message: `Create folder ${path} via GitPocket` },
        );
        state.emptyRepo = false;
        $("folder-dialog").close();
        let refreshError = "";
        try {
          await browser.loadContents();
        } catch (error) {
          refreshError = ` Chưa làm mới được danh sách: ${error.message}`;
        }
        notice(
          `Đã tạo thư mục ${path}.${refreshError}`,
          refreshError ? "info" : "success",
        );
      } catch (error) {
        $("folder-error").textContent = error.message;
        handleError(error);
      }
    });
  };
}
