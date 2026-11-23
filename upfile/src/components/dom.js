export const $ = (id) => document.getElementById(id);

export function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1).replace(".0", "")} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".0", "")} MB`;
}
