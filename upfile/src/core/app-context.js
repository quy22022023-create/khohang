import { $, element } from "../components/dom.js";
import { createConnectionStore } from "../services/connection-store.js";

export function createAppContext() {
  const state = {
    client: null,
    user: null,
    repos: [],
    repo: null,
    branch: "",
    path: "",
    contents: [],
    selectedPaths: new Set(),
    queue: [],
    busy: false,
    stale: false,
    emptyRepo: false,
    rememberConnection: false,
  };
  const connectionStore = createConnectionStore();

  function notice(message, type = "success") {
    $("notice").textContent = message;
    $("notice").className = `notice ${type}`;
  }

  function clearNotice() {
    $("notice").className = "notice hidden";
  }

  function canWrite() {
    return !!(
      state.client &&
      state.repo &&
      state.branch &&
      !state.stale &&
      !state.repo.archived &&
      !state.repo.disabled &&
      state.repo.permissions?.push !== false
    );
  }

  function assertWritable() {
    if (canWrite()) return;
    throw new Error(
      state.stale
        ? "Danh sách chưa được xác nhận. Bấm làm mới và kiểm tra kết quả trước khi thay đổi file."
        : "Kho hoặc nhánh này hiện không cho phép thay đổi file.",
    );
  }

  function directoryNote() {
    if (!state.repo) return "File của bạn được lưu trong kho GitHub.";
    if (state.stale)
      return "Danh sách cũ. Bấm làm mới và kiểm tra kết quả trước khi thay đổi file.";
    if (
      state.repo.archived ||
      state.repo.disabled ||
      state.repo.permissions?.push === false
    )
      return "Kho chỉ xem: không thể tải lên, tạo thư mục hoặc xoá file.";
    if (state.emptyRepo) return "Kho mới: lần tải đầu sẽ tạo nhánh mặc định.";
    if (state.contents.length >= 1000)
      return "GitHub chỉ trả tối đa 1.000 mục/thư mục.";
    return "Chọn nhiều mục để xoá · Xoá thư mục gồm toàn bộ file và thư mục con.";
  }

  function updateControls() {
    const connected = !!state.client;
    const ready = !!(connected && state.repo && state.branch);
    const writable = canWrite();
    const saved = connectionStore.read();
    $("connect").classList.toggle("hidden", connected);
    $("disconnect").classList.toggle("hidden", !connected && !saved);
    $("disconnect").textContent = saved ? "Ngắt & quên mã" : "Ngắt kết nối";
    $("connection-status").classList.toggle("live", connected);
    $("connection-status").replaceChildren(
      element("i"),
      document.createTextNode(
        connected
          ? state.user.login
          : saved
            ? "Đã nhớ kết nối"
            : "Chưa kết nối",
      ),
    );
    for (const id of ["repository", "manual-repo"])
      $(id).disabled = !connected || state.busy;
    for (const id of ["connect", "disconnect", "help-open"])
      $(id).disabled = state.busy;
    $("branch").disabled = !state.repo || state.busy;
    for (const id of ["refresh", "search"])
      $(id).disabled = !ready || state.busy;
    for (const id of [
      "file-picker",
      "folder-picker",
      "create-folder",
      "target-folder",
      "commit-message",
      "folder-submit",
    ])
      $(id).disabled = !writable || state.busy;
    $("repo-form").querySelector("[type=submit]").disabled = state.busy;
    $("drop-zone").classList.toggle("disabled", !writable || state.busy);
    $("folder-pick-label").classList.toggle(
      "disabled",
      !writable || state.busy,
    );
    $("upload").disabled =
      !writable ||
      state.busy ||
      !state.queue.some((item) => item.status === "ready");
    const count = state.queue.filter((item) => item.status === "ready").length;
    $("upload-label").textContent = state.busy
      ? "Đang xử lý…"
      : count
        ? `Tải ${count} file lên GitHub`
        : "Tải file lên GitHub";
    for (const button of document.querySelectorAll(
      ".file-folder,.breadcrumbs button,.remove-file",
    ))
      button.disabled = state.busy;
    for (const button of document.querySelectorAll(".delete-file"))
      button.disabled = state.busy || !writable;
    const checks = [...document.querySelectorAll(".file-select")];
    let visibleSelected = 0;
    for (const checkbox of checks) {
      checkbox.checked = state.selectedPaths.has(checkbox.dataset.path);
      checkbox.disabled = state.busy || !writable;
      checkbox
        .closest(".file-row")
        .classList.toggle("selected", checkbox.checked);
      if (checkbox.checked) visibleSelected++;
    }
    const selected = state.selectedPaths.size;
    $("select-all").disabled = state.busy || !writable || !checks.length;
    $("select-all").checked =
      checks.length > 0 && visibleSelected === checks.length;
    $("select-all").indeterminate =
      visibleSelected > 0 && visibleSelected < checks.length;
    $("selection-count").textContent = selected
      ? `Đã chọn ${selected} mục${selected > visibleSelected ? ` · ${selected - visibleSelected} mục đang ẩn` : ""}`
      : "Chưa chọn mục nào";
    $("delete-selected").disabled = state.busy || !writable || !selected;
    $("delete-selected-label").textContent = selected
      ? `Xoá đã chọn (${selected})`
      : "Xoá đã chọn";
    $("clear-selection").disabled = state.busy || !selected;
    $("queue-clear").disabled = state.busy || !state.queue.length;
    for (const button of document.querySelectorAll(".remove-group"))
      button.disabled = state.busy;
    $("directory-note").textContent = directoryNote();
  }

  function handleError(error) {
    if (error.uncertain || [409, 422].includes(error.status))
      state.stale = true;
    notice(error.message || "Có lỗi xảy ra. Vui lòng thử lại.", "error");
    updateControls();
  }

  async function busy(fn) {
    if (state.busy) return;
    state.busy = true;
    updateControls();
    try {
      return await fn();
    } catch (error) {
      handleError(error);
    } finally {
      state.busy = false;
      updateControls();
    }
  }

  function cacheSelection() {
    // A connection used without remembering must never modify an older saved token.
    if (!state.rememberConnection) return;
    const saved = connectionStore.read();
    if (!saved) return;
    if (
      !connectionStore.save({
        ...saved,
        repo: state.repo?.full_name || "",
        branch: state.branch,
        path: state.path,
      })
    )
      notice(
        "Trình duyệt không lưu được vị trí vừa mở. Kết nối hiện tại vẫn dùng được.",
        "info",
      );
  }

  return {
    state,
    connectionStore,
    notice,
    clearNotice,
    canWrite,
    assertWritable,
    updateControls,
    handleError,
    busy,
    cacheSelection,
  };
}
