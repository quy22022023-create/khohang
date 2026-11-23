import { STORAGE_KEY } from "../core/config.js";
import { normalizeRelativePath } from "../core/paths.js";

function connectionValue(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const { token, repo = "", branch = "", path = "" } = value;
  if (
    typeof token !== "string" ||
    !token.trim() ||
    token.length > 4096 ||
    /[\x00-\x20\x7f]/.test(token.trim())
  )
    return null;
  if (
    typeof repo !== "string" ||
    repo.length > 512 ||
    (repo &&
      (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo) ||
        repo.split("/").some((part) => part === "." || part === "..")))
  )
    return null;
  if (
    typeof branch !== "string" ||
    branch.length > 1024 ||
    /[\x00-\x1f\x7f]/.test(branch)
  )
    return null;
  if (typeof path !== "string") return null;
  try {
    if (path) normalizeRelativePath(path);
  } catch {
    return null;
  }
  return { token: token.trim(), repo, branch, path };
}

export function createConnectionStore(
  getStorage = () => globalThis.localStorage,
) {
  function clear() {
    try {
      getStorage().removeItem(STORAGE_KEY);
      return true;
    } catch {
      return false;
    }
  }
  return {
    read() {
      try {
        const raw = getStorage().getItem(STORAGE_KEY);
        if (raw === null) return null;
        if (typeof raw !== "string" || raw.length > 16384) {
          clear();
          return null;
        }
        const parsed = JSON.parse(raw);
        const value = parsed?.version === 1 ? connectionValue(parsed) : null;
        if (!value) clear();
        return value;
      } catch {
        clear();
        return null;
      }
    },
    save(input) {
      const value = connectionValue(input);
      if (!value) return false;
      try {
        getStorage().setItem(
          STORAGE_KEY,
          JSON.stringify({ version: 1, ...value }),
        );
        return true;
      } catch {
        return false;
      }
    },
    clear,
  };
}
