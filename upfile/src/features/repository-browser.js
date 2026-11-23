import { $, element, formatBytes } from "../components/dom.js";
import { icon } from "../components/icons.js";
import {
  normalizeRelativePath,
  parseRepo,
  safeGitHubUrl,
} from "../core/paths.js";

export function createRepositoryBrowser(
  app,
  { confirm, onConnect, onDelete, onQueueReset },
) {
  const { state, busy, updateControls, notice, clearNotice, cacheSelection } =
    app;

  function fillRepoSelect() {
    const select = $("repository");
    select.replaceChildren(
      new Option(
        state.client ? "Chọn kho lưu trữ…" : "Kết nối GitHub để chọn kho",
        "",
      ),
    );
    for (const repo of state.repos)
      select.add(
        new Option(
          `${repo.full_name}${repo.private ? " · Riêng tư" : ""}`,
          repo.full_name,
        ),
      );
    select.value = state.repo?.full_name || "";
  }

  function renderBreadcrumbs() {
    const nav = $("breadcrumbs");
    nav.replaceChildren(icon("home"));
    const root = element("button", null, "Thư mục gốc");
    root.type = "button";
    root.onclick = () => navigate("");
    nav.append(root);
    let path = "";
    for (const part of state.path.split("/").filter(Boolean)) {
      path = path ? `${path}/${part}` : part;
      const target = path;
      const button = element("button", null, part);
      button.type = "button";
      button.onclick = () => navigate(target);
      nav.append(element("span", null, "/"), button);
    }
    updateControls();
  }

  function emptyState(title, description, connect = false) {
    const node = element("div", "empty-state");
    const art = element("div", "empty-art");
    art.append(icon("folder"));
    node.append(
      art,
      element("h3", null, title),
      element("p", null, description),
    );
    if (connect) {
      const button = element("button", "button primary", "Kết nối GitHub");
      button.append(icon("arrow"));
      button.onclick = onConnect;
      node.append(button);
    }
    return node;
  }

  function renderFiles() {
    const box = $("files");
    box.replaceChildren();
    $("file-count").textContent = state.contents.length;
    renderBreadcrumbs();
    if (!state.repo) {
      box.append(
        emptyState(
          state.client
            ? "Chọn kho để bắt đầu"
            : "Bắt đầu với kho GitHub của bạn",
          state.client
            ? "Chọn một kho lưu trữ ở phía trên hoặc mở bằng link."
            : "Kết nối tài khoản để xem, tải lên và quản lý file tại đây.",
          !state.client,
        ),
      );
      updateControls();
      return;
    }
    const search = $("search").value.toLocaleLowerCase("vi");
    const items = state.contents
      .filter((file) => file.name.toLocaleLowerCase("vi").includes(search))
      .sort(
        (a, b) =>
          (a.type === "dir" ? 0 : 1) - (b.type === "dir" ? 0 : 1) ||
          a.name.localeCompare(b.name),
      );
    if (!items.length)
      box.append(
        emptyState(
          search ? "Không tìm thấy file" : "Thư mục chưa có file",
          search
            ? "Thử tên khác trong thư mục này."
            : "Chọn file ở mục Tải file lên để thêm file đầu tiên.",
        ),
      );
    for (const file of items) {
      const row = element("div", "file-row");
      const isDir = file.type === "dir";
      const selectable = isDir || file.type === "file";
      if (selectable) {
        const label = element("label", "file-select-label");
        const checkbox = element("input", "file-select");
        checkbox.type = "checkbox";
        checkbox.dataset.path = file.path;
        checkbox.setAttribute(
          "aria-label",
          `Chọn ${isDir ? "thư mục" : "file"} ${file.name}`,
        );
        checkbox.onchange = () => {
          if (state.busy || !app.canWrite()) return;
          if (checkbox.checked) state.selectedPaths.add(file.path);
          else state.selectedPaths.delete(file.path);
          updateControls();
        };
        label.append(checkbox);
        row.append(label);
      } else row.append(element("span"));
      let name;
      if (isDir) {
        name = element("button", "file-name file-folder");
        name.onclick = () => navigate(file.path);
      } else {
        const url = safeGitHubUrl(file.html_url);
        name = element(url ? "a" : "span", "file-name");
        if (url) {
          name.href = url;
          name.target = "_blank";
          name.rel = "noopener noreferrer";
        }
      }
      const mark = element("span", `file-symbol ${isDir ? "folder" : ""}`);
      mark.append(icon(isDir ? "folder" : "file"));
      name.append(mark, element("span", null, file.name));
      row.append(
        name,
        element(
          "span",
          "file-size",
          isDir ? "Thư mục" : formatBytes(file.size || 0),
        ),
      );
      if (selectable) {
        const button = element("button", "delete-file");
        button.setAttribute(
          "aria-label",
          `Xoá ${isDir ? "thư mục " : ""}${file.name}`,
        );
        button.title = `Xoá ${isDir ? "thư mục " : ""}${file.name}`;
        button.append(icon("trash"));
        button.onclick = () => onDelete(file);
        row.append(button);
      } else row.append(element("span"));
      box.append(row);
    }
    updateControls();
  }

  async function readContents(repo, branch, path, emptyRepo = false) {
    try {
      return {
        contents: await state.client.listContents(
          repo.owner.login,
          repo.name,
          path,
          branch,
        ),
        emptyRepo: false,
      };
    } catch (error) {
      // An empty repository may have been populated in another tab since it was opened.
      // Only treat 404 as empty after checking that there are still no branches.
      if (error.status === 404 && emptyRepo && !path) {
        const branches = await state.client.listBranches(
          repo.owner.login,
          repo.name,
        );
        if (!branches.length) return { contents: [], emptyRepo: true };
      }
      throw error;
    }
  }

  function showLoading() {
    $("files").replaceChildren(
      element("div", "loading-state", "Đang đọc file từ GitHub…"),
    );
    $("files").setAttribute("aria-busy", "true");
  }

  async function loadContents({ parentOnMissing = false } = {}) {
    if (!state.repo) return;
    showLoading();
    let path = state.path;
    try {
      let snapshot;
      while (true) {
        try {
          snapshot = await readContents(
            state.repo,
            state.branch,
            path,
            state.emptyRepo,
          );
          break;
        } catch (error) {
          if (parentOnMissing && error.status === 404 && path) {
            path = path.split("/").slice(0, -1).join("/");
          } else throw error;
        }
      }
      state.path = path;
      state.contents = snapshot.contents;
      state.selectedPaths.clear();
      state.emptyRepo = snapshot.emptyRepo;
      state.stale = false;
      if (!state.emptyRepo && $("branch").options.length === 1)
        $("branch").options[0].textContent = state.branch;
      renderFiles();
      cacheSelection();
    } catch (error) {
      state.stale = true;
      renderFiles();
      if (!state.contents.length)
        $("files").replaceChildren(
          emptyState(
            "Chưa đọc được danh sách file",
            "Kiểm tra kết nối và bấm nút làm mới để thử lại.",
          ),
        );
      throw error;
    } finally {
      $("files").removeAttribute("aria-busy");
    }
  }

  function resetFolder() {
    state.path = "";
    state.contents = [];
    state.selectedPaths.clear();
    state.queue = [];
    state.stale = false;
    $("search").value = "";
    $("target-folder").value = "";
    $("progress").classList.add("hidden");
    onQueueReset();
  }

  async function confirmDiscardQueue() {
    const pending = state.queue.filter((item) => item.status !== "done");
    if (!pending.length) return true;
    return confirm({
      title: "Bỏ danh sách file đang chờ?",
      description: "Chuyển kho hoặc nhánh sẽ xoá danh sách chờ hiện tại.",
      items: pending.map((item) => item.relativePath),
      note: "Các file chưa tải sẽ không được gửi lên GitHub.",
      yes: "Bỏ danh sách và chuyển",
    });
  }

  async function selectRepo(fullName, preferred = {}) {
    const [owner, name] = parseRepo(fullName);
    // Read first, then commit the complete selection. Failed requests leave the old
    // repository, branch, files and pending upload queue together.
    const repo = await state.client.getRepository(owner, name);
    const branches = await state.client.listBranches(owner, name);
    const branch =
      branches.find((item) => item.name === preferred.branch)?.name ||
      branches.find((item) => item.name === repo.default_branch)?.name ||
      branches[0]?.name ||
      repo.default_branch ||
      "main";
    let path =
      preferred.path && (!preferred.branch || preferred.branch === branch)
        ? normalizeRelativePath(preferred.path)
        : "";
    let snapshot;
    while (true) {
      try {
        snapshot = await readContents(
          repo,
          branch,
          path,
          branches.length === 0,
        );
        break;
      } catch (error) {
        if (preferred.path && error.status === 404 && path)
          path = path.split("/").slice(0, -1).join("/");
        else throw error;
      }
    }
    resetFolder();
    state.repo = repo;
    state.branch = branch;
    state.path = path;
    state.contents = snapshot.contents;
    state.emptyRepo = snapshot.emptyRepo;
    if (!state.repos.some((item) => item.full_name === repo.full_name))
      state.repos.unshift(repo);
    fillRepoSelect();
    $("branch").replaceChildren(
      ...(branches.length
        ? branches.map((item) => new Option(item.name, item.name))
        : [new Option(`${branch} (nhánh mới)`, branch)]),
    );
    $("branch").value = branch;
    renderFiles();
    cacheSelection();
    if (preferred.branch && preferred.branch !== branch)
      notice(
        `Nhánh đã nhớ “${preferred.branch}” không còn. Đã mở nhánh “${branch}”; kiểm tra nhánh trước khi tải.`,
        "info",
      );
    if (repo.archived || repo.disabled || repo.permissions?.push === false)
      notice(
        "Kho này hiện chỉ cho phép xem file. Các thao tác thay đổi đã được tắt.",
        "info",
      );
  }

  async function navigate(path) {
    await busy(async () => {
      clearNotice();
      try {
        const snapshot = await readContents(
          state.repo,
          state.branch,
          path,
          state.emptyRepo,
        );
        state.path = path;
        state.contents = snapshot.contents;
        state.selectedPaths.clear();
        state.emptyRepo = snapshot.emptyRepo;
        state.stale = false;
        $("search").value = "";
        renderFiles();
        cacheSelection();
      } catch (error) {
        state.stale = true;
        renderFiles();
        throw error;
      }
    });
  }

  $("repository").onchange = () =>
    busy(async () => {
      const selected = $("repository").value;
      try {
        if (
          selected &&
          selected !== state.repo?.full_name &&
          (await confirmDiscardQueue())
        ) {
          clearNotice();
          await selectRepo(selected);
        }
      } finally {
        fillRepoSelect();
      }
    });
  $("branch").onchange = () =>
    busy(async () => {
      const selected = $("branch").value;
      try {
        if (selected === state.branch || !(await confirmDiscardQueue())) return;
        clearNotice();
        const snapshot = await readContents(state.repo, selected, "", false);
        resetFolder();
        state.branch = selected;
        state.contents = snapshot.contents;
        state.emptyRepo = snapshot.emptyRepo;
        renderFiles();
        cacheSelection();
      } finally {
        $("branch").value = state.branch;
      }
    });
  $("refresh").onclick = () =>
    busy(async () => {
      clearNotice();
      await loadContents();
      notice("Đã làm mới danh sách file.");
    });
  $("search").oninput = renderFiles;
  $("select-all").onchange = () => {
    if (state.busy || !app.canWrite()) return;
    for (const checkbox of document.querySelectorAll(".file-select")) {
      if ($("select-all").checked)
        state.selectedPaths.add(checkbox.dataset.path);
      else state.selectedPaths.delete(checkbox.dataset.path);
    }
    updateControls();
  };
  $("clear-selection").onclick = () => {
    if (state.busy) return;
    state.selectedPaths.clear();
    updateControls();
  };
  $("manual-repo").onclick = () => {
    if (state.busy) return;
    $("repo-error").textContent = "";
    $("repo-dialog").showModal();
  };
  $("repo-form").onsubmit = (event) => {
    event.preventDefault();
    busy(async () => {
      $("repo-error").textContent = "";
      try {
        if (!(await confirmDiscardQueue())) return;
        clearNotice();
        await selectRepo($("repo-url").value);
        $("repo-dialog").close();
      } catch (error) {
        $("repo-error").textContent = error.message;
        if (!$("repo-dialog").open) throw error;
      }
    });
  };

  return { fillRepoSelect, renderFiles, resetFolder, selectRepo, loadContents };
}
