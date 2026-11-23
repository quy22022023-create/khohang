import { $ } from "../components/dom.js";

export function createBatchDeleteFeature(app, { browser, confirm }) {
  const { state, busy, assertWritable, notice } = app;

  async function removeItems(items) {
    return busy(async () => {
      assertWritable();
      const progress = $("delete-progress");
      progress.classList.remove("hidden");
      progress.textContent = "Đang đọc đầy đủ nội dung các mục cần xoá…";
      try {
        const plan = await state.client.prepareDeletion(
          state.repo.owner.login,
          state.repo.name,
          state.branch,
          items,
        );
        progress.classList.add("hidden");
        const folders = plan.roots.filter((item) => item.type === "dir").length;
        const roots = plan.roots.map((item) => item.path).join(", ");
        if (
          !(await confirm({
            title: `Xoá ${plan.roots.length} mục đã chọn?`,
            description: `${state.repo.full_name} · ${state.branch}\n${roots}\n${plan.files.length} file sẽ bị xoá${folders ? `, gồm toàn bộ nội dung của ${folders} thư mục đã chọn` : ""}.`,
            items: plan.files.map((file) => file.path),
            note: "Thay đổi được lưu trong một commit. Bạn có thể khôi phục từ lịch sử commit trên GitHub.",
            yes: `Xoá ${plan.files.length} file`,
            danger: true,
          }))
        )
          return;
        progress.classList.remove("hidden");
        await state.client.deleteBatch(plan, (message) => {
          progress.textContent = message;
        });
        state.selectedPaths.clear();
        state.contents = state.contents.filter(
          (item) =>
            !plan.roots.some(
              (root) =>
                item.path === root.path ||
                item.path.startsWith(root.path + "/"),
            ),
        );
        browser.renderFiles();
        let refreshError = "";
        try {
          await browser.loadContents({ parentOnMissing: true });
        } catch (error) {
          refreshError = ` Chưa làm mới được danh sách: ${error.message}`;
        }
        notice(
          `Đã xoá ${plan.files.length} file trong ${plan.roots.length} mục bằng một commit.${refreshError}`,
          refreshError ? "info" : "success",
        );
      } finally {
        progress.classList.add("hidden");
      }
    });
  }

  $("delete-selected").onclick = () =>
    removeItems(
      state.contents.filter((item) => state.selectedPaths.has(item.path)),
    );
  return { removeItems };
}
