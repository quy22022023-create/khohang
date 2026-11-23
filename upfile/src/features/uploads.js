import { $, element, formatBytes } from "../components/dom.js";
import { icon } from "../components/icons.js";
import { normalizeRelativePath } from "../core/paths.js";
import { collectDirectoryDrop } from "../services/directory-drop.js";
import { mergeUploadQueue, uploadGroups } from "../services/upload-queue.js";

export function createUploadFeature(app, { browser, confirm }) {
  const {
    state,
    busy,
    notice,
    clearNotice,
    updateControls,
    canWrite,
    assertWritable,
  } = app;

  function renderQueue() {
    const queue = $("queue");
    queue.replaceChildren();
    const groups = uploadGroups(state.queue);
    const folders = groups.filter((group) => group.folder).length;
    const looseFiles = groups.find((group) => !group.folder)?.items.length || 0;
    $("queue-count").textContent = state.queue.length
      ? `${state.queue.length} file · ${folders} thư mục gốc${looseFiles ? ` · ${looseFiles} file lẻ` : ""}`
      : "Chưa có file chờ";
    if (state.queue.length) {
      const bytes = state.queue.reduce((sum, item) => sum + item.file.size, 0);
      queue.append(
        element(
          "p",
          "queue-summary",
          `${state.queue.length} file · ${formatBytes(bytes)}`,
        ),
      );
    }
    for (const group of groups) {
      const heading = element("div", "queue-group-heading");
      heading.append(
        icon(group.folder ? "folder" : "file"),
        element("strong", null, group.folder || "File lẻ"),
        element("span", null, `${group.items.length} file`),
      );
      const removeGroup = element(
        "button",
        "text-button remove-group",
        "Bỏ nhóm",
      );
      removeGroup.setAttribute(
        "aria-label",
        group.folder
          ? `Bỏ thư mục ${group.folder} khỏi danh sách tải lên`
          : "Bỏ nhóm file lẻ khỏi danh sách tải lên",
      );
      removeGroup.onclick = () => {
        if (state.busy) return;
        state.queue = state.queue.filter((item) => !group.items.includes(item));
        renderQueue();
      };
      heading.append(removeGroup);
      queue.append(heading);
      for (const item of group.items) {
        const row = element(
          "div",
          `queue-item ${item.status === "done" ? "done" : item.status === "failed" ? "failed" : ""}`,
        );
        row.append(icon(item.status === "done" ? "check" : "file"));
        const info = element("div", "queue-info", item.relativePath);
        info.append(
          element(
            "small",
            null,
            `${formatBytes(item.file.size)} · ${item.detail || "Sẵn sàng"}`,
          ),
        );
        row.append(info);
        const remove = element("button", "remove-file");
        remove.setAttribute(
          "aria-label",
          `Bỏ ${item.relativePath} khỏi danh sách tải lên`,
        );
        remove.append(icon("close"));
        remove.onclick = () => {
          if (state.busy) return;
          state.queue = state.queue.filter((entry) => entry !== item);
          renderQueue();
        };
        row.append(remove);
        queue.append(row);
      }
    }
    updateControls();
  }

  function addFiles(files, { whileBusy = false } = {}) {
    if ((state.busy && !whileBusy) || !canWrite()) return;
    const { queue, errors, added } = mergeUploadQueue(state.queue, files);
    state.queue = queue;
    renderQueue();
    if (errors.length) notice(errors.join("; "), "error");
    else if (added)
      notice(
        `Đã thêm ${added} file vào danh sách chờ. Bạn có thể thêm file hoặc thư mục khác trước khi bấm tải lên.`,
        "info",
      );
    else clearNotice();
  }

  $("file-picker").onchange = (event) => {
    addFiles([...event.target.files]);
    event.target.value = "";
  };
  $("folder-picker").onchange = (event) => {
    const files = [...event.target.files];
    addFiles(files);
    event.target.value = "";
    if (!files.length)
      notice(
        "Thư mục chưa có file hoặc chưa được trình duyệt chọn. Dùng “Tạo thư mục” nếu muốn thêm thư mục rỗng.",
        "info",
      );
    else if (!$("notice").classList.contains("error"))
      notice(
        "Đã thêm thư mục vào danh sách chờ, giữ nguyên cấu trúc. Bấm “Tải file lên GitHub” để bắt đầu. Thư mục rỗng không được hộp chọn gửi lên; bạn có thể tạo riêng bằng nút “Tạo thư mục”.",
        "info",
      );
  };
  if (!("webkitdirectory" in $("folder-picker")))
    $("folder-support").textContent =
      "Trình duyệt này có thể chưa hỗ trợ chọn thư mục. Hãy dùng trình duyệt có hỗ trợ hoặc chọn nhiều file.";
  $("queue-clear").onclick = () => {
    if (state.busy) return;
    state.queue = [];
    $("progress").classList.add("hidden");
    renderQueue();
  };
  for (const event of ["dragenter", "dragover"])
    $("drop-zone").addEventListener(event, (event) => {
      event.preventDefault();
      if (canWrite() && !state.busy) $("drop-zone").classList.add("dragging");
    });
  $("drop-zone").addEventListener("dragleave", (event) => {
    event.preventDefault();
    $("drop-zone").classList.remove("dragging");
  });
  $("drop-zone").addEventListener("drop", (event) => {
    event.preventDefault();
    $("drop-zone").classList.remove("dragging");
    if (state.busy || !canWrite()) return;
    // Capture browser entry handles synchronously within the drop event.
    const collecting = collectDirectoryDrop(event.dataTransfer);
    busy(async () => {
      notice("Đang đọc thư mục và các file bên trong…", "info");
      const { files, emptyDirectories } = await collecting;
      for (const path of emptyDirectories)
        files.push({
          file: new File([""], ".gitkeep", { type: "text/plain" }),
          relativePath: `${path}/.gitkeep`,
        });
      addFiles(files, { whileBusy: true });
      if (!files.length) notice("Không có file để tải lên.", "info");
    });
  });

  $("upload").onclick = () =>
    busy(async () => {
      assertWritable();
      clearNotice();
      const pending = state.queue.filter((item) => item.status === "ready");
      if (!pending.length) return;
      const target = $("target-folder").value.trim();
      const destination = [
        state.path,
        target ? normalizeRelativePath(target) : "",
      ]
        .filter(Boolean)
        .join("/");
      const owner = state.repo.owner.login,
        repo = state.repo.name,
        branch = state.branch;
      const overwrite = [];
      $("progress").classList.remove("hidden");
      $("upload-progress").max = pending.length;
      $("upload-progress").value = 0;
      try {
        for (const [index, item] of pending.entries()) {
          item.path = normalizeRelativePath(
            [destination, item.relativePath].filter(Boolean).join("/"),
          );
          item.sha = undefined;
          $("progress-text").textContent =
            `Đang kiểm tra ${index + 1}/${pending.length} · ${item.relativePath}`;
          if (!state.emptyRepo) {
            try {
              const file = await state.client.getFile(
                owner,
                repo,
                item.path,
                branch,
              );
              item.sha = file.sha;
              overwrite.push(item.path);
            } catch (error) {
              if (error.status !== 404) throw error;
            }
          }
        }
      } catch (error) {
        $("progress").classList.add("hidden");
        throw error;
      }
      if (
        overwrite.length &&
        !(await confirm({
          title: `Ghi đè ${overwrite.length} file?`,
          description: `Các file sau đã có trong ${state.repo.full_name} · nhánh ${branch}.`,
          items: overwrite,
          note: "Nội dung hiện tại sẽ được thay bằng file bạn đã chọn. Lịch sử cũ vẫn được GitHub lưu trong commit.",
          yes: "Ghi đè và tải lên",
        }))
      ) {
        $("progress").classList.add("hidden");
        return;
      }
      let done = 0,
        failed = false;
      for (const [index, item] of pending.entries()) {
        item.detail = "Đang tải…";
        renderQueue();
        $("progress-text").textContent =
          `${index + 1}/${pending.length} · ${item.relativePath}`;
        try {
          await state.client.uploadFile(
            owner,
            repo,
            item.path,
            branch,
            item.file,
            { message: $("commit-message").value, sha: item.sha },
          );
          item.status = "done";
          item.detail = "Đã tải lên";
          done++;
          state.emptyRepo = false;
          if ($("branch").options.length === 1)
            $("branch").options[0].textContent = branch;
        } catch (error) {
          item.status = "failed";
          item.detail = error.message;
          failed = true;
          renderQueue();
          $("progress-text").textContent =
            "Đã dừng. Kiểm tra kết quả trước khi thử lại.";
          break;
        }
        renderQueue();
        $("upload-progress").value = index + 1;
      }
      if (!failed)
        $("progress-text").textContent = `Hoàn tất · Đã tải ${done} file.`;
      let refreshError = "";
      try {
        await browser.loadContents();
      } catch (error) {
        refreshError = ` Không làm mới được danh sách: ${error.message}`;
      }
      // Never automatically send another write after a failed/ambiguous write.
      // An explicit refresh lets the user inspect the result before continuing.
      if (failed) state.stale = true;
      notice(
        failed
          ? `Đã tải ${done} file, 1 file gặp lỗi; các file còn lại chưa được tải. Xem lỗi dưới tên file. Hãy bấm làm mới và kiểm tra GitHub trước khi chọn lại file.${refreshError}`
          : `Đã tải ${done} file lên ${state.repo.full_name} · ${branch}${destination ? ` / ${destination}` : ""}.${refreshError}`,
        failed || refreshError ? "error" : "success",
      );
    });

  return { renderQueue };
}
