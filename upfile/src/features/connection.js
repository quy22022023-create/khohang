import { $ } from "../components/dom.js";
import { icon } from "../components/icons.js";
import { parseRepo } from "../core/paths.js";
import { GitHubClient } from "../services/github-client.js";

export function createConnectionFeature(app, browser) {
  const { state, connectionStore, notice, updateControls } = app;

  function openConnect(showHelp = false) {
    if (state.busy) return;
    $("connect-error").textContent = "";
    $("connect-dialog").showModal();
    if (showHelp) $("connect-dialog").querySelector("details").open = true;
  }

  async function establishConnection(
    token,
    initial = "",
    { remember = true, preferred = {} } = {},
  ) {
    if (initial) parseRepo(initial);
    const client = new GitHubClient(token);
    const user = await client.getUser();
    let repos = [],
      listError = null;
    try {
      repos = await client.listRepositories();
    } catch (error) {
      if (error.status === 401) throw error;
      listError = error;
    }
    state.client = client;
    state.user = user;
    state.repos = repos;
    state.repo = null;
    state.branch = "";
    state.emptyRepo = false;
    state.rememberConnection = false;
    browser.resetFolder();
    browser.fillRepoSelect();
    $("branch").replaceChildren(new Option("Chưa chọn nhánh", ""));
    browser.renderFiles();
    const cacheOK = remember
      ? connectionStore.save({
          token,
          repo: initial ? parseRepo(initial).join("/") : "",
          branch: preferred.branch || "",
          path: preferred.path || "",
        })
      : connectionStore.clear();
    state.rememberConnection = remember && cacheOK;
    if ($("connect-dialog").open) $("connect-dialog").close();
    notice(
      `Đã kết nối tài khoản ${user.login}.${remember && cacheOK ? " Đã nhớ kết nối trên thiết bị này." : ""} ${initial ? "" : "Chọn kho lưu trữ để bắt đầu."}`,
    );
    if (initial) {
      try {
        await browser.selectRepo(initial, preferred);
      } catch (error) {
        if (error.status === 401) {
          connectionStore.clear();
          state.rememberConnection = false;
        }
        notice(`Đã kết nối nhưng chưa mở được kho. ${error.message}`, "error");
      }
    } else if (listError)
      notice(
        `Đã kết nối, nhưng không tải được danh sách kho. Dùng “Mở bằng link”. ${listError.message}`,
        "info",
      );
    if (!cacheOK)
      notice(
        remember
          ? "Trình duyệt đang chặn lưu mã. Bạn vẫn dùng được lần này; lần sau cần nhập lại."
          : "Không thể xoá mã đã nhớ. Hãy xoá dữ liệu của trang trong cài đặt trình duyệt nếu cần quên mã.",
        "info",
      );
  }

  for (const id of ["connect", "empty-connect"])
    $(id).onclick = () => openConnect();
  $("help-open").onclick = () => openConnect(true);
  $("connect-dialog").addEventListener("close", () => {
    $("token").value = "";
  });
  $("connect-form").onsubmit = async (event) => {
    event.preventDefault();
    if (state.busy) return;
    const token = $("token").value.trim(),
      initial = $("initial-repo").value.trim();
    const remember = $("remember-connection").checked;
    state.busy = true;
    updateControls();
    $("connect-error").textContent = "";
    $("connect-submit").disabled = true;
    $("connect-submit").textContent = "Đang kết nối…";
    try {
      await establishConnection(token, initial, { remember });
    } catch (error) {
      $("connect-error").textContent = error.message;
      if (!$("connect-dialog").open) notice(error.message, "error");
    } finally {
      state.busy = false;
      updateControls();
      $("token").value = "";
      $("connect-submit").disabled = false;
      $("connect-submit").replaceChildren(
        document.createTextNode("Kết nối "),
        icon("arrow"),
      );
    }
  };
  $("disconnect").onclick = () => {
    if (state.busy) return;
    const cleared = connectionStore.clear();
    state.client = null;
    state.user = null;
    state.repos = [];
    state.repo = null;
    state.branch = "";
    state.emptyRepo = false;
    state.rememberConnection = false;
    browser.resetFolder();
    browser.fillRepoSelect();
    $("branch").replaceChildren(new Option("Chưa chọn nhánh", ""));
    $("commit-message").value = "";
    browser.renderFiles();
    updateControls();
    notice(
      cleared
        ? "Đã ngắt kết nối và quên mã đã lưu trên thiết bị."
        : "Đã ngắt kết nối. Trình duyệt chặn xoá bộ nhớ; hãy xoá dữ liệu của trang trong cài đặt trình duyệt để quên mã.",
      cleared ? "success" : "info",
    );
  };

  async function restoreConnection() {
    const saved = connectionStore.read();
    if (!saved) return;
    state.busy = true;
    updateControls();
    notice("Đang khôi phục kết nối đã nhớ…", "info");
    try {
      await establishConnection(saved.token, saved.repo, {
        remember: true,
        preferred: saved,
      });
    } catch (error) {
      if (error.status === 401) {
        connectionStore.clear();
        notice(
          "Mã đã nhớ không hợp lệ hoặc đã hết hạn. Bấm “Kết nối GitHub” để nhập mã mới.",
          "error",
        );
      } else
        notice(
          `Chưa khôi phục được kết nối. Mã vẫn được giữ để thử lại lần sau. ${error.message}`,
          "error",
        );
    } finally {
      state.busy = false;
      updateControls();
    }
  }

  return { openConnect, restoreConnection };
}
