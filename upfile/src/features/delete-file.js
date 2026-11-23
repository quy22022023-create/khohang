export function createDeleteFeature(app, { browser, confirm }) {
  const { state, busy, assertWritable, notice } = app;
  async function removeFile(file) {
    await busy(async () => {
      assertWritable();
      if (
        !(await confirm({
          title: "Xoá file này?",
          description: `Kho ${state.repo.full_name} · nhánh ${state.branch}`,
          items: [file.path],
          note: "File sẽ bị xoá khỏi nhánh này. Có thể khôi phục từ lịch sử commit trên GitHub.",
          yes: "Xoá file",
          danger: true,
        }))
      )
        return;
      await state.client.deleteFile(
        state.repo.owner.login,
        state.repo.name,
        file.path,
        state.branch,
        file.sha,
      );
      state.contents = state.contents.filter((item) => item.path !== file.path);
      browser.renderFiles();
      let refreshError = "";
      try {
        await browser.loadContents({ parentOnMissing: true });
      } catch (error) {
        refreshError = ` Chưa làm mới được danh sách: ${error.message}`;
      }
      notice(
        `Đã xoá ${file.path}.${refreshError}`,
        refreshError ? "info" : "success",
      );
    });
  }
  return { removeFile };
}
