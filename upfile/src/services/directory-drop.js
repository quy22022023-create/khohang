import { MAX_DROP_ENTRIES, MAX_DROP_DEPTH } from "../core/config.js";
import { normalizeRelativePath, uploadRelativePath } from "../core/paths.js";

export async function collectDirectoryDrop(dataTransfer) {
  if (!dataTransfer) throw new Error("Không đọc được dữ liệu kéo thả.");
  // Capture entries while the drop event still owns its data store.
  const items = Array.from(dataTransfer.items || []).filter(
    (item) => item.kind === "file",
  );
  const fallback = Array.from(dataTransfer.files || []);
  let roots;
  try {
    roots = items.map((item) => {
      const getEntry = item.webkitGetAsEntry || item.getAsEntry;
      return getEntry ? getEntry.call(item) : null;
    });
  } catch {
    throw new Error(
      "Trình duyệt không cho đọc thư mục kéo thả. Hãy dùng nút Chọn thư mục.",
    );
  }
  const result = { files: [], emptyDirectories: [] };
  const visited = new WeakSet();
  let total = 0;
  const unsupported = () =>
    new Error(
      "Không đọc được toàn bộ thư mục kéo thả trên trình duyệt này. Hãy dùng nút Chọn thư mục.",
    );
  async function addFallback(file) {
    if (
      !file ||
      typeof file.arrayBuffer !== "function" ||
      !Number.isFinite(file.size)
    )
      throw unsupported();
    if (++total > MAX_DROP_ENTRIES)
      throw new Error(
        "Mỗi lần chọn tối đa 5.000 file và thư mục. Hãy chia thành các lần nhỏ hơn.",
      );
    // Some browsers expose a dropped directory as an unreadable zero-byte File.
    if (file.size === 0 && !file.type) {
      try {
        await file.arrayBuffer();
      } catch {
        throw unsupported();
      }
    }
    result.files.push({ file, relativePath: uploadRelativePath(file) });
  }
  async function visit(entry, parent = "", depth = 0) {
    if (!entry || typeof entry !== "object") throw unsupported();
    if (depth > MAX_DROP_DEPTH)
      throw new Error("Thư mục quá sâu. Mỗi lần tải tối đa 64 cấp thư mục.");
    if (visited.has(entry))
      throw new Error("Cấu trúc thư mục bị lặp. Hãy chọn lại thư mục.");
    visited.add(entry);
    if (++total > MAX_DROP_ENTRIES)
      throw new Error(
        "Mỗi lần chọn tối đa 5.000 file và thư mục. Hãy chia thành các lần nhỏ hơn.",
      );
    if (typeof entry.name !== "string" || entry.name.includes("/"))
      throw unsupported();
    const relativePath = normalizeRelativePath(
      parent ? `${parent}/${entry.name}` : entry.name,
    );
    if (entry.isFile && !entry.isDirectory) {
      const file = await new Promise((resolve, reject) => {
        try {
          entry.file(resolve, () =>
            reject(
              new Error(
                `Không đọc được file ${relativePath}. Hãy chọn lại thư mục.`,
              ),
            ),
          );
        } catch {
          reject(
            new Error(
              `Không đọc được file ${relativePath}. Hãy chọn lại thư mục.`,
            ),
          );
        }
      });
      if (
        !file ||
        typeof file.arrayBuffer !== "function" ||
        !Number.isFinite(file.size)
      )
        throw unsupported();
      result.files.push({ file, relativePath });
    } else if (entry.isDirectory && !entry.isFile) {
      let reader;
      try {
        reader = entry.createReader();
      } catch {
        throw unsupported();
      }
      let children = 0;
      while (true) {
        const batch = await new Promise((resolve, reject) => {
          try {
            reader.readEntries(resolve, () =>
              reject(
                new Error(
                  `Không đọc được thư mục ${relativePath}. Hãy chọn lại.`,
                ),
              ),
            );
          } catch {
            reject(
              new Error(
                `Không đọc được thư mục ${relativePath}. Hãy chọn lại.`,
              ),
            );
          }
        });
        if (!Array.isArray(batch)) throw unsupported();
        if (!batch.length) break;
        children += batch.length;
        for (const child of batch) await visit(child, relativePath, depth + 1);
      }
      if (!children) result.emptyDirectories.push(relativePath);
    } else throw unsupported();
  }
  if (items.length) {
    for (let index = 0; index < items.length; index++) {
      if (roots[index]) await visit(roots[index]);
      else {
        let file;
        try {
          file = items[index].getAsFile?.() || fallback[index];
        } catch {
          throw unsupported();
        }
        await addFallback(file);
      }
    }
  } else {
    for (const file of fallback) await addFallback(file);
    if (!fallback.length) throw unsupported();
  }
  return result;
}
