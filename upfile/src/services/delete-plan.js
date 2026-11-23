import { MAX_BATCH_DELETE_FILES } from "../core/config.js";
import { GitHubError } from "../core/errors.js";
import { selectGitEntries } from "./git-tree.js";

export function planDeletion(
  snapshot,
  selected,
  limit = MAX_BATCH_DELETE_FILES,
) {
  const { roots, entries } = selectGitEntries(snapshot, selected);
  const files = entries.filter((entry) => entry.type !== "tree");
  if (!files.length)
    throw new GitHubError("Không có file nào để xoá trong các mục đã chọn.");
  if (files.length > limit)
    throw new GitHubError(
      `Mỗi lần xoá tối đa ${limit.toLocaleString("vi")} file. Chưa xoá gì; hãy chia nhỏ lựa chọn.`,
    );
  return { roots, files };
}
