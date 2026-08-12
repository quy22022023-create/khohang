"use strict";

/*
 * Kho Khuôn Bế 2.0.2
 * Frontend HTML/CSS/JavaScript thuần kết nối Supabase qua RPC.
 * Không đặt service-role/secret key trong frontend.
 */

const APP_VERSION = "2.0.2";
const CACHE_VERSION = `kho-khuon-be-cache-${APP_VERSION}-realtime-20260812`;
const DATA_FORMAT_VERSION = 5;

const STORAGE_KEYS = Object.freeze({
  theme: "kho_v2_theme",
  demoData: "kho_v2_demo_data",
  demoRole: "kho_v2_demo_role",
  demoAccount: "kho_v2_demo_account",
  authSession: "kho_v2_auth_session",
  rollback: "kho_v2_demo_rollback",
});

const SCREENS = Object.freeze({
  dashboard: "dashboard",
  inventory: "inventory",
  history: "history",
  manage: "manage",
});

const MANAGE_TABS = Object.freeze({
  accounts: "accounts",
  categories: "categories",
  access: "access",
  data: "data",
});

const TRANSACTION_TYPES = Object.freeze({
  initial: "initial",
  import: "import",
  export: "export",
  adjust: "adjust",
  reverse: "reverse",
});

const TRANSACTION_LABELS = Object.freeze({
  initial: "Khởi tạo",
  import: "Nhập kho",
  export: "Xuất kho",
  adjust: "Kiểm kê",
  reverse: "Đảo giao dịch",
});

const ACCOUNT_STATUSES = Object.freeze({
  active: "active",
  locked: "locked",
  disabled: "disabled",
});

const ACCOUNT_STATUS_LABELS = Object.freeze({
  [ACCOUNT_STATUSES.active]: "Hoạt động",
  [ACCOUNT_STATUSES.locked]: "Đã khóa",
  [ACCOUNT_STATUSES.disabled]: "Ngừng sử dụng",
});

const PERMISSIONS = Object.freeze({
  viewInventory: "view_inventory",
  viewQuantity: "view_quantity",
  viewDetail: "view_detail",
  viewHistory: "view_history",
  importInventory: "import_inventory",
  exportInventory: "export_inventory",
  countInventory: "count_inventory",
  reverseTransaction: "reverse_transaction",
  addProduct: "add_product",
  editProduct: "edit_product",
  archiveProduct: "archive_product",
  manageSchema: "manage_schema",
  manageAccounts: "manage_accounts",
  lockAccounts: "lock_accounts",
  resetAccountPassword: "reset_account_password",
  manageData: "manage_data",
});

const ROLE_LABELS = Object.freeze({
  viewer: "Chỉ xem",
  warehouse_staff: "Nhân viên kho",
  group_manager: "Quản lý nhóm",
  warehouse_manager: "Quản lý kho",
  auditor: "Kiểm kê / đối soát",
  admin: "Admin",
  superadmin: "Super Admin",
});

const ROLE_PRESETS = Object.freeze({
  viewer: [
    PERMISSIONS.viewInventory,
    PERMISSIONS.viewQuantity,
    PERMISSIONS.viewDetail,
  ],
  warehouse_staff: [
    PERMISSIONS.viewInventory,
    PERMISSIONS.viewQuantity,
    PERMISSIONS.viewDetail,
    PERMISSIONS.viewHistory,
    PERMISSIONS.importInventory,
    PERMISSIONS.exportInventory,
  ],
  group_manager: [
    PERMISSIONS.viewInventory,
    PERMISSIONS.viewQuantity,
    PERMISSIONS.viewDetail,
    PERMISSIONS.viewHistory,
    PERMISSIONS.importInventory,
    PERMISSIONS.exportInventory,
    PERMISSIONS.addProduct,
    PERMISSIONS.editProduct,
  ],
  warehouse_manager: [
    PERMISSIONS.viewInventory,
    PERMISSIONS.viewQuantity,
    PERMISSIONS.viewDetail,
    PERMISSIONS.viewHistory,
    PERMISSIONS.importInventory,
    PERMISSIONS.exportInventory,
    PERMISSIONS.countInventory,
    PERMISSIONS.reverseTransaction,
    PERMISSIONS.addProduct,
    PERMISSIONS.editProduct,
    PERMISSIONS.archiveProduct,
    PERMISSIONS.manageSchema,
  ],
  auditor: [
    PERMISSIONS.viewInventory,
    PERMISSIONS.viewQuantity,
    PERMISSIONS.viewDetail,
    PERMISSIONS.viewHistory,
    PERMISSIONS.countInventory,
  ],
  admin: [
    PERMISSIONS.viewInventory,
    PERMISSIONS.viewQuantity,
    PERMISSIONS.viewDetail,
    PERMISSIONS.viewHistory,
    PERMISSIONS.importInventory,
    PERMISSIONS.exportInventory,
    PERMISSIONS.countInventory,
    PERMISSIONS.reverseTransaction,
    PERMISSIONS.addProduct,
    PERMISSIONS.editProduct,
    PERMISSIONS.archiveProduct,
    PERMISSIONS.manageSchema,
    PERMISSIONS.manageData,
  ],
  superadmin: ["*"],
});

const PERMISSION_META = Object.freeze({
  [PERMISSIONS.viewInventory]: ["Xem kho", "Truy cập danh sách vật liệu."],
  [PERMISSIONS.viewQuantity]: ["Xem số lượng", "Xem tồn hiện tại và mức cảnh báo."],
  [PERMISSIONS.viewDetail]: ["Xem chi tiết", "Mở thông tin đầy đủ của vật liệu."],
  [PERMISSIONS.viewHistory]: ["Xem lịch sử", "Xem giao dịch nhập, xuất, kiểm kê và giao dịch đảo."],
  [PERMISSIONS.importInventory]: ["Nhập kho", "Tăng tồn bằng một giao dịch nhập kho."],
  [PERMISSIONS.exportInventory]: ["Xuất kho", "Giảm tồn nhưng không được làm tồn âm."],
  [PERMISSIONS.countInventory]: ["Kiểm kê", "Đặt lại tồn theo số thực tế và bắt buộc ghi lý do."],
  [PERMISSIONS.reverseTransaction]: ["Đảo giao dịch", "Đảo giao dịch mới nhất của vật liệu thay vì sửa hoặc xóa lịch sử."],
  [PERMISSIONS.addProduct]: ["Thêm vật liệu", "Tạo quy cách vật liệu mới."],
  [PERMISSIONS.editProduct]: ["Sửa vật liệu", "Sửa thông tin, không sửa trực tiếp số tồn."],
  [PERMISSIONS.archiveProduct]: ["Lưu trữ vật liệu", "Ẩn vật liệu nhưng giữ lịch sử."],
  [PERMISSIONS.manageSchema]: ["Quản lý danh mục", "Quản lý nhóm và thuộc tính nhận diện."],
  [PERMISSIONS.manageAccounts]: ["Quản lý tài khoản", "Tạo, sửa vai trò và phạm vi nhóm vật liệu."],
  [PERMISSIONS.lockAccounts]: ["Khóa tài khoản", "Khóa hoặc ngừng sử dụng tài khoản theo cấp quản trị."],
  [PERMISSIONS.resetAccountPassword]: ["Đặt lại mật khẩu", "Super Admin đặt mật khẩu mới cho tài khoản; không bắt buộc đổi ở lần đăng nhập đầu."],
  [PERMISSIONS.manageData]: ["Quản lý dữ liệu", "Quản lý sao lưu và dọn lịch sử kho."],
});

const CATEGORY_SCOPED_PERMISSIONS = Object.freeze([
  PERMISSIONS.viewInventory,
  PERMISSIONS.viewQuantity,
  PERMISSIONS.viewDetail,
  PERMISSIONS.viewHistory,
  PERMISSIONS.importInventory,
  PERMISSIONS.exportInventory,
  PERMISSIONS.countInventory,
  PERMISSIONS.reverseTransaction,
  PERMISSIONS.addProduct,
  PERMISSIONS.editProduct,
  PERMISSIONS.archiveProduct,
]);

const CATEGORY_SCOPED_PERMISSION_SET = new Set(CATEGORY_SCOPED_PERMISSIONS);

const ROLE_LEVELS = Object.freeze({
  viewer: 10,
  warehouse_staff: 20,
  auditor: 20,
  group_manager: 30,
  warehouse_manager: 40,
  admin: 80,
  superadmin: 100,
});

const DEFAULT_SCHEMA = Object.freeze({
  version: 1,
  categories: [
    {
      id: "dao",
      name: "Dao",
      icon: "╱",
      units: ["m", "cuộn"],
      defaultUnit: "m",
      warningDefault: 20,
      active: true,
      attributes: [
        { id: "dao-loai", name: "Loại dao", type: "select", options: ["Dao cắt", "Dao cấn", "Dao răng", "Dao đứt đoạn"], unit: "", required: true, identity: true, list: true, active: true },
        { id: "dao-chieu-cao", name: "Chiều cao", type: "number", options: [], unit: "mm", required: true, identity: true, list: true, active: true },
        { id: "dao-do-day", name: "Độ dày", type: "number", options: [], unit: "mm", required: true, identity: true, list: true, active: true },
        { id: "dao-kieu-luoi", name: "Kiểu lưỡi", type: "select", options: ["Lưỡi giữa", "Lưỡi lệch", "Một bên"], unit: "", required: false, identity: true, list: true, active: true },
      ],
    },
    {
      id: "van-bang",
      name: "Ván bằng",
      icon: "▭",
      units: ["tấm"],
      defaultUnit: "tấm",
      warningDefault: 3,
      active: true,
      attributes: [
        { id: "vb-chieu-dai", name: "Chiều dài", type: "number", options: [], unit: "mm", required: true, identity: true, list: true, active: true },
        { id: "vb-chieu-rong", name: "Chiều rộng", type: "number", options: [], unit: "mm", required: true, identity: true, list: true, active: true },
        { id: "vb-do-day", name: "Độ dày", type: "number", options: [], unit: "mm", required: true, identity: true, list: true, active: true },
        { id: "vb-loai", name: "Loại ván", type: "text", options: [], unit: "", required: false, identity: true, list: true, active: true },
      ],
    },
    {
      id: "van-tron",
      name: "Ván tròn",
      icon: "◯",
      units: ["bộ", "tấm"],
      defaultUnit: "bộ",
      warningDefault: 1,
      active: true,
      attributes: [
        { id: "vt-loai", name: "Loại hoặc máy", type: "text", options: [], unit: "", required: true, identity: true, list: true, active: true },
        { id: "vt-duong-kinh", name: "Đường kính", type: "number", options: [], unit: "mm", required: true, identity: true, list: true, active: true },
        { id: "vt-chieu-rong", name: "Chiều rộng", type: "number", options: [], unit: "mm", required: false, identity: true, list: true, active: true },
        { id: "vt-do-day", name: "Độ dày", type: "number", options: [], unit: "mm", required: false, identity: true, list: true, active: true },
      ],
    },
    {
      id: "phu-lieu",
      name: "Phụ liệu",
      icon: "◇",
      units: ["cái", "hộp", "m", "tấm"],
      defaultUnit: "cái",
      warningDefault: 5,
      active: true,
      attributes: [
        { id: "pl-ten", name: "Tên vật liệu", type: "text", options: [], unit: "", required: true, identity: true, list: true, active: true },
        { id: "pl-quy-cach", name: "Quy cách", type: "text", options: [], unit: "", required: false, identity: true, list: true, active: true },
      ],
    },
  ],
});

const DEFAULT_DEMO_PASSWORD = "Demo@1234";
const DEFAULT_DEMO_PASSWORD_RECORD = Object.freeze({
  passwordSalt: "a2hvLWtodW9uLWJlLXByZXZpZXc2",
  passwordHash: "9NmaTCPyGVjg9sBrfd7DEUZAhRxxSHgXx3jKgUmt73A=",
  passwordIterations: 120000,
  passwordUpdatedAt: "2026-07-22T00:00:00.000Z",
});

const DEFAULT_ACCOUNTS = Object.freeze([
  { id: "acc-superadmin", username: "superadmin-demo", displayName: "Super Admin thử nghiệm", role: "superadmin", status: ACCOUNT_STATUSES.active, active: true, scopeMode: "all", categoryPermissions: {}, ...DEFAULT_DEMO_PASSWORD_RECORD, createdAt: "2026-07-20T07:50:00.000Z", updatedAt: "2026-07-20T07:50:00.000Z" },
  { id: "acc-admin", username: "admin-demo", displayName: "Quản trị thử nghiệm", role: "admin", status: ACCOUNT_STATUSES.active, active: true, scopeMode: "all", categoryPermissions: {}, ...DEFAULT_DEMO_PASSWORD_RECORD, createdAt: "2026-07-20T08:00:00.000Z", updatedAt: "2026-07-20T08:00:00.000Z" },
  { id: "acc-warehouse", username: "kho-demo", displayName: "Nhân viên kho", role: "warehouse_staff", status: ACCOUNT_STATUSES.active, active: true, scopeMode: "all", categoryPermissions: {}, ...DEFAULT_DEMO_PASSWORD_RECORD, createdAt: "2026-07-20T08:10:00.000Z", updatedAt: "2026-07-20T08:10:00.000Z" },
  { id: "acc-auditor", username: "kiemke-demo", displayName: "Nhân viên kiểm kê", role: "auditor", status: ACCOUNT_STATUSES.active, active: true, scopeMode: "all", categoryPermissions: {}, ...DEFAULT_DEMO_PASSWORD_RECORD, createdAt: "2026-07-20T08:20:00.000Z", updatedAt: "2026-07-20T08:20:00.000Z" },
  { id: "acc-group", username: "nhom-dao-demo", displayName: "Quản lý nhóm Dao", role: "group_manager", status: ACCOUNT_STATUSES.active, active: true, scopeMode: "custom", categoryPermissions: { dao: [...ROLE_PRESETS.group_manager] }, ...DEFAULT_DEMO_PASSWORD_RECORD, createdAt: "2026-07-20T08:30:00.000Z", updatedAt: "2026-07-20T08:30:00.000Z" },
]);

const DEFAULT_PRODUCTS = Object.freeze([
  {
    id: "prd-dao-001",
    categoryId: "dao",
    name: "Dao cắt 23.8 × 0.71 mm · Lưỡi giữa",
    unit: "m",
    warningLevel: 20,
    quantity: 42,
    attributes: { "dao-loai": "Dao cắt", "dao-chieu-cao": 23.8, "dao-do-day": 0.71, "dao-kieu-luoi": "Lưỡi giữa" },
    signature: "dao|dao-loai=dao cat|dao-chieu-cao=23.8|dao-do-day=0.71|dao-kieu-luoi=luoi giua",
    note: "Cuộn đang sử dụng cho máy bế phẳng.",
    archived: false,
    createdAt: "2026-07-18T02:30:00.000Z",
    updatedAt: "2026-07-21T03:20:00.000Z",
  },
  {
    id: "prd-dao-002",
    categoryId: "dao",
    name: "Dao cấn 23.8 × 0.71 mm",
    unit: "m",
    warningLevel: 20,
    quantity: 12,
    attributes: { "dao-loai": "Dao cấn", "dao-chieu-cao": 23.8, "dao-do-day": 0.71, "dao-kieu-luoi": "" },
    signature: "dao|dao-loai=dao can|dao-chieu-cao=23.8|dao-do-day=0.71|dao-kieu-luoi=",
    note: "",
    archived: false,
    createdAt: "2026-07-18T02:35:00.000Z",
    updatedAt: "2026-07-21T02:00:00.000Z",
  },
  {
    id: "prd-vb-001",
    categoryId: "van-bang",
    name: "Ván bằng 1220 × 2440 × 18 mm · Birch",
    unit: "tấm",
    warningLevel: 3,
    quantity: 8,
    attributes: { "vb-chieu-dai": 1220, "vb-chieu-rong": 2440, "vb-do-day": 18, "vb-loai": "Birch" },
    signature: "van-bang|vb-chieu-dai=1220|vb-chieu-rong=2440|vb-do-day=18|vb-loai=birch",
    note: "",
    archived: false,
    createdAt: "2026-07-18T02:40:00.000Z",
    updatedAt: "2026-07-20T09:00:00.000Z",
  },
  {
    id: "prd-vt-001",
    categoryId: "van-tron",
    name: "Ván tròn Bobst · Ø 520 × 15 mm",
    unit: "bộ",
    warningLevel: 1,
    quantity: 1,
    attributes: { "vt-loai": "Bobst", "vt-duong-kinh": 520, "vt-chieu-rong": "", "vt-do-day": 15 },
    signature: "van-tron|vt-loai=bobst|vt-duong-kinh=520|vt-chieu-rong=|vt-do-day=15",
    note: "Cần kiểm tra trước khi giao sản xuất.",
    archived: false,
    createdAt: "2026-07-18T02:45:00.000Z",
    updatedAt: "2026-07-21T05:15:00.000Z",
  },
  {
    id: "prd-pl-001",
    categoryId: "phu-lieu",
    name: "Cao su đẩy giấy · 7 × 10 mm",
    unit: "m",
    warningLevel: 10,
    quantity: 0,
    attributes: { "pl-ten": "Cao su đẩy giấy", "pl-quy-cach": "7 × 10 mm" },
    signature: "phu-lieu|pl-ten=cao su day giay|pl-quy-cach=7 x 10 mm",
    note: "Đang chờ nhập thêm.",
    archived: false,
    createdAt: "2026-07-18T02:50:00.000Z",
    updatedAt: "2026-07-21T06:00:00.000Z",
  },
]);

const DEFAULT_TRANSACTIONS = Object.freeze([
  { id: "txn-005", productId: "prd-pl-001", productName: "Cao su đẩy giấy · 7 × 10 mm", categoryId: "phu-lieu", type: "export", amount: 6, beforeQuantity: 6, afterQuantity: 0, unit: "m", note: "Xuất cho lệnh sản xuất KB-0721", actor: "Nhân viên kho", createdAt: "2026-07-21T06:00:00.000Z" },
  { id: "txn-004", productId: "prd-vt-001", productName: "Ván tròn Bobst · Ø 520 × 15 mm", categoryId: "van-tron", type: "adjust", amount: 1, beforeQuantity: 2, afterQuantity: 1, unit: "bộ", note: "Kiểm kê thực tế cuối ca", actor: "Nhân viên kiểm kê", createdAt: "2026-07-21T05:15:00.000Z" },
  { id: "txn-003", productId: "prd-dao-001", productName: "Dao cắt 23.8 × 0.71 mm · Lưỡi giữa", categoryId: "dao", type: "import", amount: 30, beforeQuantity: 12, afterQuantity: 42, unit: "m", note: "Nhập từ nhà cung cấp", actor: "Nhân viên kho", createdAt: "2026-07-21T03:20:00.000Z" },
  { id: "txn-002", productId: "prd-dao-002", productName: "Dao cấn 23.8 × 0.71 mm", categoryId: "dao", type: "export", amount: 8, beforeQuantity: 20, afterQuantity: 12, unit: "m", note: "Xuất cho tổ khuôn", actor: "Nhân viên kho", createdAt: "2026-07-21T02:00:00.000Z" },
  { id: "txn-001", productId: "prd-vb-001", productName: "Ván bằng 1220 × 2440 × 18 mm · Birch", categoryId: "van-bang", type: "initial", amount: 8, beforeQuantity: 0, afterQuantity: 8, unit: "tấm", note: "Khởi tạo dữ liệu thử nghiệm", actor: "Quản trị thử nghiệm", createdAt: "2026-07-20T09:00:00.000Z" },
]);


const memoryStorage = new Map();
const safeStorage = Object.freeze({
  getItem(key) {
    try {
      return globalThis.localStorage?.getItem(key) ?? memoryStorage.get(key) ?? null;
    } catch {
      return memoryStorage.get(key) ?? null;
    }
  },
  setItem(key, value) {
    const stringValue = String(value);
    memoryStorage.set(key, stringValue);
    try {
      globalThis.localStorage?.setItem(key, stringValue);
    } catch {
      // Chế độ riêng tư hoặc file:// có thể chặn localStorage; dùng bộ nhớ tạm.
    }
  },
  removeItem(key) {
    memoryStorage.delete(key);
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      // Không cần xử lý thêm.
    }
  },
});

const appState = {
  auth: { status: "checking" },
  currentUser: null,
  screen: SCREENS.dashboard,
  manageTab: MANAGE_TABS.accounts,
  theme: safeStorage.getItem(STORAGE_KEYS.theme) === "dark" ? "dark" : "light",
  loading: {},
  actionLocks: new Set(),
  requestIds: {},
  cache: {
    schema: null,
    products: [],
    transactions: [],
    accounts: [],
    accountAudit: [],
    loaded: { bootstrap: false, transactions: false, accounts: false, accountAudit: false },
  },
  filters: {
    inventory: { search: "", category: "all", status: "all", quantityBelow: "" },
    history: { search: "", type: "all", from: "", to: "" },
  },
  ui: {
    modalName: null,
    modalBusy: false,
    modalLastFocus: null,
    categoryDraft: null,
    confirmCallbackId: null,
    bootstrapError: null,
    initialized: null,
  },
  realtime: {
    status: navigator.onLine ? "idle" : "offline",
    unsubscribe: null,
    refreshTimer: null,
    refreshInFlight: false,
    pendingScopes: new Set(),
    hasSubscribed: false,
    lastSyncedAt: null,
  },
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function on(root, eventName, selector, handler) {
  root.addEventListener(eventName, (event) => {
    const target = event.target.closest(selector);
    if (!target || !root.contains(target)) return;
    handler(event, target);
  });
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/×/g, "x")
    .replace(/\s+/g, " ");
}

function normalizeSearchText(value) {
  let normalized = normalizeText(value)
    .replace(/(\d),(\d)/g, "$1.$2")
    .replace(/(\d)\s*x\s*(?=\d)/g, "$1 ")
    .replace(/[·•∙⋅・‧‣◦▪●○◆◇|/\\;:_=+\-–—()[\]{}<>!?"'“”‘’]/g, " ")
    .replace(/,/g, " ");

  normalized = normalized.replace(/\./g, (character, offset, source) => {
    const previous = source[offset - 1] || "";
    const next = source[offset + 1] || "";
    return /\d/.test(previous) && /\d/.test(next) ? character : " ";
  });

  return normalized.replace(/\s+/g, " ").trim();
}

function searchTokens(value) {
  const normalized = normalizeSearchText(value);
  return normalized ? [...new Set(normalized.split(" ").filter(Boolean))] : [];
}

function productSearchText(product, category) {
  const parts = [product?.name, product?.customName, product?.note, category?.name];

  if (product?.categoryId && hasPermission(PERMISSIONS.viewDetail, product.categoryId)) {
    for (const attribute of orderedCategoryAttributes(category)) {
      const value = product?.attributes?.[attribute.id];
      if (value === "" || value === null || value === undefined) continue;
      parts.push(attribute.name, attributeDisplayValue(attribute, value));
    }
  }

  return normalizeSearchText(parts.filter(Boolean).join(" "));
}

function slugify(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `item-${Date.now()}`;
}

function makeId(prefix) {
  const randomPart = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${randomPart}`;
}

function bytesToBase64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(String(value || ""));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function validateUsername(value) {
  const username = normalizeText(value);
  if (/\s/.test(username) || !/^[a-z0-9._-]{3,32}$/.test(username)) {
    throw new Error("Tên đăng nhập phải dài 3–32 ký tự và chỉ gồm chữ không dấu, số, dấu chấm, gạch dưới hoặc gạch ngang.");
  }
  return username;
}

function validatePassword(value) {
  const password = String(value || "");
  if (password.length < 8 || password.length > 128) throw new Error("Mật khẩu phải dài từ 8 đến 128 ký tự.");
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) throw new Error("Mật khẩu phải có ít nhất một chữ cái và một chữ số.");
  return password;
}

async function derivePasswordHash(password, saltBase64, iterations = 120000) {
  if (!globalThis.crypto?.subtle) throw new Error("Trình duyệt không hỗ trợ mã hóa mật khẩu cho bản preview.");
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits({
    name: "PBKDF2",
    hash: "SHA-256",
    salt: base64ToBytes(saltBase64),
    iterations,
  }, keyMaterial, 256);
  return bytesToBase64(new Uint8Array(bits));
}

async function createPasswordRecord(password) {
  const normalized = validatePassword(password);
  const salt = crypto.getRandomValues(new Uint8Array(18));
  const passwordSalt = bytesToBase64(salt);
  const passwordIterations = 120000;
  const passwordHash = await derivePasswordHash(normalized, passwordSalt, passwordIterations);
  return { passwordSalt, passwordHash, passwordIterations, passwordUpdatedAt: new Date().toISOString() };
}

async function verifyPassword(password, account) {
  if (!account?.passwordSalt || !account?.passwordHash) return false;
  const actual = await derivePasswordHash(String(password || ""), account.passwordSalt, toNumber(account.passwordIterations, 120000));
  if (actual.length !== account.passwordHash.length) return false;
  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) difference |= actual.charCodeAt(index) ^ account.passwordHash.charCodeAt(index);
  return difference === 0;
}

function readAuthSession() {
  try {
    const raw = safeStorage.getItem(STORAGE_KEYS.authSession);
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session && typeof session.accountId === "string" ? session : null;
  } catch {
    return null;
  }
}

function saveAuthSession(accountId) {
  safeStorage.setItem(STORAGE_KEYS.authSession, JSON.stringify({ accountId, signedInAt: new Date().toISOString() }));
}

function clearAuthSession() {
  safeStorage.removeItem(STORAGE_KEYS.authSession);
  safeStorage.removeItem(STORAGE_KEYS.demoAccount);
  safeStorage.removeItem(STORAGE_KEYS.demoRole);
}

function toNumber(value, fallback = 0) {
  const normalized = String(value ?? "").replace(/\s/g, "").replace(/,/g, ".");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : fallback;
}

function toOptionalNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

const MAX_QUANTITY = 1_000_000_000_000;
const QUANTITY_DECIMALS = 6;

function normalizeQuantity(value, fallback = Number.NaN) {
  const number = toNumber(value, fallback);
  if (!Number.isFinite(number)) return fallback;
  const rounded = Number(number.toFixed(QUANTITY_DECIMALS));
  return Object.is(rounded, -0) ? 0 : rounded;
}

function quantitiesEqual(left, right) {
  return Math.abs(normalizeQuantity(left, 0) - normalizeQuantity(right, 0)) < 10 ** -QUANTITY_DECIMALS;
}

function formatQuantity(value) {
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 3 }).format(toNumber(value));
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(date);
}

function formatISODate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function debounce(fn, wait = 180) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), wait);
  };
}

function setText(selector, value, root = document) {
  const element = $(selector, root);
  if (element) element.textContent = String(value ?? "");
}

function setValue(selector, value, root = document) {
  const element = $(selector, root);
  if (element) element.value = String(value ?? "");
}

function setChecked(selector, checked, root = document) {
  const element = $(selector, root);
  if (element) element.checked = Boolean(checked);
}

function announce(message) {
  const liveRegion = $("#live-region");
  if (!liveRegion) return;
  liveRegion.textContent = "";
  window.setTimeout(() => { liveRegion.textContent = message; }, 20);
}

function icon(name) {
  const icons = {
    dashboard: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z" fill="currentColor"/></svg>',
    inventory: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 7 9-4 9 4-9 4-9-4Zm2 3.2 6 2.67v7.6l-6-2.67v-7.6Zm8 10.27v-7.6l6-2.67v7.6l-6 2.67Z" fill="currentColor"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" fill="currentColor"/></svg>',
    history: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4a8 8 0 1 1-7.45 5.08L2 8.5V3l5.3 1.2L5.7 5.8A10 10 0 1 0 12 2v2Zm-1 3h2v5.4l3.3 2-1 1.7-4.3-2.6V7Z" fill="currentColor"/></svg>',
    manage: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h10v2H4V5Zm0 6h16v2H4v-2Zm0 6h7v2H4v-2Zm13-13h3v4h-3V4Zm-3 12h6v4h-6v-4Z" fill="currentColor"/></svg>',
    moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.4 15.6A8 8 0 0 1 8.4 3.6 8.5 8.5 0 1 0 20.4 15.6Z" fill="currentColor"/></svg>',
    sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 1h2v3h-2V1Zm0 19h2v3h-2v-3ZM1 11h3v2H1v-2Zm19 0h3v2h-3v-2ZM4.22 2.8l2.12 2.12-1.42 1.42L2.8 4.22 4.22 2.8Zm12.44 12.86 2.12 2.12-1.42 1.42-2.12-2.12 1.42-1.42Zm.7-12.86 1.42 1.42-2.12 2.12-1.42-1.42 2.12-2.12ZM4.92 15.66l1.42 1.42-2.12 2.12-1.42-1.42 2.12-2.12ZM12 6a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z" fill="currentColor"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 4a6.5 6.5 0 1 0 3.96 11.65L19.8 21 21 19.8l-5.35-5.34A6.5 6.5 0 0 0 10.5 4Zm-4.8 6.5a4.8 4.8 0 1 1 9.6 0 4.8 4.8 0 0 1-9.6 0Z" fill="currentColor"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5Z" fill="currentColor"/></svg>',
    edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15.7 4.3 4 4L9 19H5v-4L15.7 4.3Zm0 2.8L7 15.8V17h1.2L17 8.3l-1.3-1.2Z" fill="currentColor"/></svg>',
    archive: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16l1 4H3l1-4Zm1 6h14v10H5V10Zm5 2v2h4v-2h-4Z" fill="currentColor"/></svg>',
    warning: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 1 21h22L12 2Zm-1 7h2v6h-2V9Zm0 8h2v2h-2v-2Z" fill="currentColor"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.2 16.2-4.4-4.4 1.4-1.4 3 3 8.6-8.6 1.4 1.4-10 10Z" fill="currentColor"/></svg>',
    info: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 10h2v8h-2v-8Zm0-4h2v2h-2V6Zm1-4a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" fill="currentColor"/></svg>',
    account: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8ZM4 21a8 8 0 0 1 16 0H4Z" fill="currentColor"/></svg>',
    category: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" fill="currentColor"/></svg>',
    shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Zm-1 14-3-3 1.4-1.4 1.6 1.6 4.6-4.6L17 10l-6 6Z" fill="currentColor"/></svg>',
    database: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c5 0 9 1.6 9 3.5S17 10 12 10 3 8.4 3 6.5 7 3 12 3Zm-9 7v4c0 1.9 4 3.5 9 3.5s9-1.6 9-3.5v-4c-2 1.5-5.5 2.2-9 2.2S5 11.5 3 10Zm0 7v.5C3 19.4 7 21 12 21s9-1.6 9-3.5V17c-2 1.5-5.5 2.2-9 2.2S5 18.5 3 17Z" fill="currentColor"/></svg>',
    download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 3h2v9l3-3 1.4 1.4L12 15.8l-5.4-5.4L8 9l3 3V3ZM4 18h16v3H4v-3Z" fill="currentColor"/></svg>',
    upload: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 21h2v-9l3 3 1.4-1.4L12 8.2l-5.4 5.4L8 15l3-3v9ZM4 3h16v3H4V3Z" fill="currentColor"/></svg>',
    trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4V2h8v2h5v2H3V4h5Zm-3 4h14l-1 14H6L5 8Zm4 3v7h2v-7H9Zm4 0v7h2v-7h-2Z" fill="currentColor"/></svg>',
    swap: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 4 4 4-4 4v-3H2V7h5V4Zm10 8v3h5v2h-5v3l-4-4 4-4Z" fill="currentColor"/></svg>',
    up: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 5 7 7-1.4 1.4-4.6-4.6V20h-2V8.8l-4.6 4.6L5 12l7-7Z" fill="currentColor"/></svg>',
    down: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 19-7-7 1.4-1.4 4.6 4.6V4h2v11.2l4.6-4.6L19 12l-7 7Z" fill="currentColor"/></svg>',
  };
  return icons[name] || icons.info;
}

function showToast(type, title, message = "") {
  const root = $("#toast-root");
  if (!root) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.dataset.type = type;
  toast.innerHTML = `${icon(type === "success" ? "check" : type === "error" ? "warning" : "info")}
    <div><div class="toast-title">${escapeHTML(title)}</div>${message ? `<div class="toast-message">${escapeHTML(message)}</div>` : ""}</div>`;
  root.append(toast);
  window.setTimeout(() => toast.remove(), 3600);
}

function applyTheme(theme) {
  const normalized = theme === "dark" ? "dark" : "light";
  appState.theme = normalized;
  document.documentElement.dataset.theme = normalized;
  safeStorage.setItem(STORAGE_KEYS.theme, normalized);
  const themeColor = normalized === "dark" ? "#0f1512" : "#f4f7f5";
  $("meta[name='theme-color']")?.setAttribute("content", themeColor);
}

function normalizeRoleCode(role) {
  const normalized = String(role || "").trim().toLowerCase().replace(/\s+/g, "_");
  if (["super_admin", "super-admin", "spadmin"].includes(normalized)) return "superadmin";
  return normalized;
}

function rolePermissions(role) {
  return ROLE_PRESETS[normalizeRoleCode(role)] || [];
}

function hasBasePermission(account, permission) {
  const permissions = rolePermissions(account?.role);
  return permissions.includes("*") || permissions.includes(permission);
}

function isCategoryScopedPermission(permission) {
  return CATEGORY_SCOPED_PERMISSION_SET.has(permission);
}

function currentAccount() {
  if (!appState.currentUser) return null;
  return appState.cache.accounts.find((account) => account.id === appState.currentUser.id) || appState.currentUser;
}

function normalizeCategoryPermissions(account, schema = appState.cache.schema) {
  const result = {};
  const categories = schema?.categories || [];
  const basePermissions = rolePermissions(account?.role);
  const allowed = new Set(basePermissions.includes("*") ? CATEGORY_SCOPED_PERMISSIONS : basePermissions.filter((permission) => isCategoryScopedPermission(permission)));
  for (const category of categories) {
    const source = Array.isArray(account?.categoryPermissions?.[category.id]) ? account.categoryPermissions[category.id] : [];
    result[category.id] = [...new Set(source.filter((permission) => allowed.has(permission)))];
  }
  return result;
}

function validateCategoryPermissionDependencies(categoryPermissions, schema) {
  const transactionPermissions = [
    PERMISSIONS.importInventory,
    PERMISSIONS.exportInventory,
    PERMISSIONS.countInventory,
    PERMISSIONS.reverseTransaction,
  ];
  const detailPermissions = [PERMISSIONS.editProduct, PERMISSIONS.archiveProduct];

  for (const category of schema?.categories || []) {
    const permissions = Array.isArray(categoryPermissions?.[category.id]) ? categoryPermissions[category.id] : [];
    if (!permissions.length) continue;
    if (!permissions.includes(PERMISSIONS.viewInventory)) {
      throw new Error(`Nhóm “${category.name}”: mọi quyền thao tác phải kèm quyền Xem kho.`);
    }
    if (transactionPermissions.some((permission) => permissions.includes(permission)) && !permissions.includes(PERMISSIONS.viewQuantity)) {
      throw new Error(`Nhóm “${category.name}”: quyền giao dịch phải kèm quyền Xem số lượng.`);
    }
    if (permissions.includes(PERMISSIONS.reverseTransaction) && !permissions.includes(PERMISSIONS.viewHistory)) {
      throw new Error(`Nhóm “${category.name}”: quyền Đảo giao dịch phải kèm quyền Xem lịch sử.`);
    }
    if (detailPermissions.some((permission) => permissions.includes(permission)) && !permissions.includes(PERMISSIONS.viewDetail)) {
      throw new Error(`Nhóm “${category.name}”: quyền sửa hoặc lưu trữ vật liệu phải kèm quyền Xem chi tiết.`);
    }
  }
}

function accountHasPermission(account, permission, categoryId = null, schema = appState.cache.schema) {
  if (!account || accountStatus(account) !== ACCOUNT_STATUSES.active) return false;
  if (normalizeRoleCode(account.role) === "superadmin") return true;
  if (!hasBasePermission(account, permission)) return false;
  if (!isCategoryScopedPermission(permission)) return true;
  if (account.scopeMode !== "custom") return true;
  const categoryPermissions = normalizeCategoryPermissions(account, schema);
  if (categoryId) return categoryPermissions[categoryId]?.includes(permission) || false;
  return Object.values(categoryPermissions).some((permissions) => permissions.includes(permission));
}

function hasPermission(permission, categoryId = null) {
  return accountHasPermission(currentAccount(), permission, categoryId, appState.cache.schema);
}

function storeActor(store) {
  if (!appState.currentUser) return null;
  return store.accounts.find((account) => account.id === appState.currentUser.id) || null;
}

function assertStorePermission(store, permission, categoryId = null) {
  const actor = storeActor(store);
  if (!accountHasPermission(actor, permission, categoryId, store.schema)) {
    throw new Error("Tài khoản hiện tại không còn quyền thực hiện thao tác này. Hãy tải lại dữ liệu.");
  }
  return actor;
}

function categoriesWithPermission(permission, { activeOnly = true } = {}) {
  return (appState.cache.schema?.categories || []).filter((category) => (!activeOnly || category.active !== false) && hasPermission(permission, category.id));
}

function canCreateAnyInventoryTransaction(categoryId = null) {
  return hasPermission(PERMISSIONS.importInventory, categoryId)
    || hasPermission(PERMISSIONS.exportInventory, categoryId)
    || hasPermission(PERMISSIONS.countInventory, categoryId);
}

function accountStatus(account) {
  if (Object.values(ACCOUNT_STATUSES).includes(account?.status)) return account.status;
  return account?.active === false ? ACCOUNT_STATUSES.disabled : ACCOUNT_STATUSES.active;
}

function accountStatusLabel(account) {
  return ACCOUNT_STATUS_LABELS[accountStatus(account)] || "Không xác định";
}

function roleLevel(role) {
  return ROLE_LEVELS[normalizeRoleCode(role)] || 0;
}

function canAccountManageTarget(actor, targetAccount = null) {
  if (!actor || normalizeRoleCode(actor.role) !== "superadmin" || !accountHasPermission(actor, PERMISSIONS.manageAccounts, null, appState.cache.schema)) return false;
  if (!targetAccount) return true;
  return true;
}

function canManageAccount(targetAccount = null) {
  return canAccountManageTarget(currentAccount(), targetAccount);
}

function assignableRolesForAccount(actor) {
  return normalizeRoleCode(actor?.role) === "superadmin" ? Object.keys(ROLE_PRESETS) : [];
}

function assignableRoles(targetAccount = null) {
  return assignableRolesForAccount(currentAccount(), targetAccount);
}

function setAuthenticatedAccount(account) {
  if (!account) {
    appState.currentUser = null;
    appState.auth.status = "signedOut";
    return;
  }
  const normalizedAccount = clone(account);
  normalizedAccount.role = normalizeRoleCode(normalizedAccount.role);
  if (normalizedAccount.role === "superadmin") {
    normalizedAccount.scopeMode = "all";
    normalizedAccount.categoryPermissions = {};
  }
  appState.currentUser = normalizedAccount;
  appState.auth.status = "signedIn";
}

function syncCurrentUserFromAccounts() {
  if (!appState.currentUser) return;
  const selected = appState.cache.accounts.find((account) => account.id === appState.currentUser.id);
  if (!selected || accountStatus(selected) !== ACCOUNT_STATUSES.active) {
    clearAuthSession();
    setAuthenticatedAccount(null);
    return;
  }
  setAuthenticatedAccount(selected);
}

function roleLabel(role) {
  return ROLE_LABELS[normalizeRoleCode(role)] || role;
}

function categoryById(categoryId) {
  return appState.cache.schema?.categories?.find((category) => category.id === categoryId) || null;
}

function productById(productId) {
  return appState.cache.products.find((product) => product.id === productId) || null;
}

function visibleProducts(permission = PERMISSIONS.viewInventory) {
  return appState.cache.products.filter((product) => hasPermission(permission, product.categoryId));
}

function visibleTransactions(permission = PERMISSIONS.viewHistory) {
  return appState.cache.transactions.filter((transaction) => hasPermission(permission, transaction.categoryId));
}

function transactionById(transactionId) {
  return appState.cache.transactions.find((transaction) => transaction.id === transactionId) || null;
}

function latestTransactionForProduct(productId) {
  return appState.cache.transactions.find((transaction) => transaction.productId === productId) || null;
}

function productStatus(product) {
  const quantity = toNumber(product.quantity);
  const warning = Math.max(0, toNumber(product.warningLevel));
  if (quantity <= 0) return { key: "out", label: "Hết hàng", className: "badge-danger" };
  if (quantity <= warning) return { key: "low", label: "Sắp hết", className: "badge-warning" };
  return { key: "ok", label: "Đủ hàng", className: "badge-success" };
}

function attributeDisplayValue(attribute, value) {
  if (value === "" || value === null || value === undefined) return "—";
  const formatted = attribute.type === "number" ? formatQuantity(value) : String(value);
  return attribute.unit ? `${formatted} ${attribute.unit}` : formatted;
}

function orderedCategoryAttributes(category, { activeOnly = true, identityOnly = false } = {}) {
  if (!Array.isArray(category?.attributes)) return [];
  return category.attributes
    .map((attribute, index) => ({ attribute, index }))
    .filter(({ attribute }) => (!activeOnly || attribute.active !== false) && (!identityOnly || attribute.identity))
    .sort((left, right) => {
      const leftOrder = Number.isFinite(Number(left.attribute.sortOrder)) ? Number(left.attribute.sortOrder) : left.index;
      const rightOrder = Number.isFinite(Number(right.attribute.sortOrder)) ? Number(right.attribute.sortOrder) : right.index;
      return leftOrder - rightOrder || left.index - right.index;
    })
    .map(({ attribute }) => attribute);
}

function identityCategoryAttributes(category) {
  if (!Array.isArray(category?.attributes)) return [];
  return category.attributes
    .map((attribute, index) => ({ attribute, index }))
    .filter(({ attribute }) => attribute.active !== false && attribute.identity)
    .sort((left, right) => {
      const leftIdentityOrder = toOptionalNumber(left.attribute.identityOrder);
      const rightIdentityOrder = toOptionalNumber(right.attribute.identityOrder);
      const leftOrder = leftIdentityOrder ?? left.index;
      const rightOrder = rightIdentityOrder ?? right.index;
      return leftOrder - rightOrder || String(left.attribute.id).localeCompare(String(right.attribute.id), "vi");
    })
    .map(({ attribute }) => attribute);
}

function buildProductSignature(category, attributes) {
  const parts = identityCategoryAttributes(category)
    .map((attribute) => `${attribute.id}=${normalizeText(attributes[attribute.id])}`);
  return `${category.id}|${parts.join("|")}`;
}

function buildProductName(category, attributes) {
  const values = orderedCategoryAttributes(category, { identityOnly: true })
    .map((attribute) => {
      const value = attributes[attribute.id];
      if (value === "" || value === null || value === undefined) return "";
      return attributeDisplayValue(attribute, value);
    })
    .filter(Boolean);
  return values.length ? `${category.name} · ${values.join(" · ")}` : category.name;
}

function validateProductPayload(payload, schema, products) {
  const category = schema.categories.find((item) => item.id === payload.categoryId && item.active !== false);
  if (!category) throw new Error("Nhóm vật liệu không hợp lệ hoặc đã ngừng sử dụng.");

  const attributes = {};
  for (const attribute of orderedCategoryAttributes(category)) {
    const rawValue = payload.attributes?.[attribute.id] ?? "";
    const value = attribute.type === "number" && rawValue !== "" ? toNumber(rawValue, Number.NaN) : String(rawValue).trim();
    if (attribute.required && (value === "" || Number.isNaN(value))) {
      throw new Error(`Vui lòng nhập ${attribute.name}.`);
    }
    if (attribute.type === "number" && value !== "" && (!Number.isFinite(value) || value < 0)) {
      throw new Error(`${attribute.name} phải là số không âm.`);
    }
    attributes[attribute.id] = value;
  }

  const units = category.units.filter(Boolean);
  const unit = String(payload.unit || category.defaultUnit || units[0] || "").trim();
  if (!unit) throw new Error("Vui lòng chọn đơn vị.");
  if (units.length && !units.includes(unit)) throw new Error("Đơn vị không thuộc nhóm vật liệu này.");

  const warningLevel = toNumber(payload.warningLevel, Number.NaN);
  if (!Number.isFinite(warningLevel) || warningLevel < 0) throw new Error("Mức cảnh báo phải là số không âm.");

  const signature = buildProductSignature(category, attributes);
  const duplicate = products.find((product) => !product.archived && product.id !== payload.id && product.signature === signature);
  if (duplicate) throw new Error(`Quy cách này đã tồn tại: ${duplicate.name}.`);

  const customName = String(payload.customName || "").trim();
  const name = customName || buildProductName(category, attributes);

  return {
    id: payload.id || null,
    categoryId: category.id,
    customName,
    name,
    unit,
    warningLevel,
    attributes,
    signature,
    note: String(payload.note || "").trim(),
  };
}

function transactionPermission(type) {
  if (type === TRANSACTION_TYPES.import) return PERMISSIONS.importInventory;
  if (type === TRANSACTION_TYPES.export) return PERMISSIONS.exportInventory;
  if (type === TRANSACTION_TYPES.adjust) return PERMISSIONS.countInventory;
  if (type === TRANSACTION_TYPES.reverse) return PERMISSIONS.reverseTransaction;
  return null;
}

function assertTransactionPermission(type, categoryId = null) {
  const permission = transactionPermission(type);
  if (!permission || !hasPermission(permission, categoryId)) {
    throw new Error("Vai trò hiện tại không có quyền thực hiện loại giao dịch này.");
  }
}

function validateTransactionPayload(payload, product) {
  if (!product || product.archived) throw new Error("Vật liệu không còn khả dụng.");
  const type = payload.type;
  if (![TRANSACTION_TYPES.import, TRANSACTION_TYPES.export, TRANSACTION_TYPES.adjust].includes(type)) {
    throw new Error("Loại giao dịch không hợp lệ.");
  }
  const currentQuantity = normalizeQuantity(product.quantity);
  const amount = normalizeQuantity(payload.amount);
  if (!Number.isFinite(currentQuantity) || currentQuantity < 0) throw new Error("Tồn hiện tại không hợp lệ.");
  if (!Number.isFinite(amount) || amount < 0) throw new Error("Số lượng phải là số không âm.");
  if (amount > MAX_QUANTITY) throw new Error("Số lượng vượt giới hạn cho phép.");

  if ([TRANSACTION_TYPES.import, TRANSACTION_TYPES.export].includes(type) && amount <= 0) {
    throw new Error("Số lượng nhập hoặc xuất phải lớn hơn 0.");
  }
  if (type === TRANSACTION_TYPES.export && amount > currentQuantity) {
    throw new Error(`Tồn hiện tại chỉ còn ${formatQuantity(currentQuantity)} ${product.unit}.`);
  }

  const note = String(payload.note || "").trim();
  if ([TRANSACTION_TYPES.export, TRANSACTION_TYPES.adjust].includes(type) && !note) {
    throw new Error(type === TRANSACTION_TYPES.adjust ? "Kiểm kê bắt buộc có lý do." : "Xuất kho bắt buộc có mục đích hoặc ghi chú.");
  }

  let afterQuantity = currentQuantity;
  if (type === TRANSACTION_TYPES.import) afterQuantity = normalizeQuantity(currentQuantity + amount);
  if (type === TRANSACTION_TYPES.export) afterQuantity = normalizeQuantity(currentQuantity - amount);
  if (type === TRANSACTION_TYPES.adjust) afterQuantity = amount;
  if (!Number.isFinite(afterQuantity) || afterQuantity < 0 || afterQuantity > MAX_QUANTITY) {
    throw new Error("Tồn sau giao dịch không hợp lệ.");
  }

  return {
    type,
    amount,
    beforeQuantity: currentQuantity,
    afterQuantity,
    deltaQuantity: normalizeQuantity(afterQuantity - currentQuantity, 0),
    note,
  };
}

function createProductSnapshot(product, schema, fallbackTransaction = null) {
  const category = schema?.categories?.find((item) => item.id === product?.categoryId);
  const attributes = category
    ? orderedCategoryAttributes(category).map((attribute) => ({
        id: attribute.id,
        name: attribute.name,
        value: product?.attributes?.[attribute.id] ?? "",
        unit: attribute.unit || "",
      }))
    : [];
  return {
    productId: product?.id || fallbackTransaction?.productId || "",
    productName: fallbackTransaction?.productName || product?.name || "Vật liệu",
    categoryId: fallbackTransaction?.categoryId || product?.categoryId || "",
    categoryName: category?.name || fallbackTransaction?.productSnapshot?.categoryName || "",
    unit: fallbackTransaction?.unit || product?.unit || "",
    signature: product?.signature || fallbackTransaction?.productSnapshot?.signature || "",
    attributes,
  };
}

function migrateStoreData(data) {
  const store = clone(data);
  let changed = toNumber(store.version, 1) !== DATA_FORMAT_VERSION;

  if (!store || !store.schema || !Array.isArray(store.schema.categories) || !Array.isArray(store.products) || !Array.isArray(store.transactions) || !Array.isArray(store.accounts)) {
    throw new Error("Dữ liệu thử nghiệm sai định dạng.");
  }

  for (const category of store.schema.categories) {
    if (!Array.isArray(category.attributes)) category.attributes = [];

    const displayEntries = category.attributes
      .map((attribute, index) => ({ attribute, index }))
      .sort((left, right) => {
        const leftOrder = Number.isFinite(Number(left.attribute.sortOrder)) ? Number(left.attribute.sortOrder) : left.index;
        const rightOrder = Number.isFinite(Number(right.attribute.sortOrder)) ? Number(right.attribute.sortOrder) : right.index;
        return leftOrder - rightOrder || left.index - right.index;
      });

    displayEntries.forEach(({ attribute }, index) => {
      if (Number(attribute.sortOrder) !== index) changed = true;
      attribute.sortOrder = index;
    });

    const identityEntries = displayEntries.filter(({ attribute }) => attribute.active !== false && attribute.identity);
    const identityOrders = identityEntries.map(({ attribute }) => toOptionalNumber(attribute.identityOrder));
    const hasStableIdentityOrder = identityOrders.every((order) => order !== null)
      && new Set(identityOrders).size === identityOrders.length;

    if (!hasStableIdentityOrder) {
      identityEntries.forEach(({ attribute }, index) => {
        attribute.identityOrder = index;
      });
      changed = true;
    } else {
      identityEntries.forEach(({ attribute }) => {
        const normalizedOrder = toOptionalNumber(attribute.identityOrder);
        if (attribute.identityOrder !== normalizedOrder) changed = true;
        attribute.identityOrder = normalizedOrder;
      });
    }
  }

  const categoriesById = new Map(store.schema.categories.map((category) => [category.id, category]));
  const activeSignatures = new Set();
  for (const product of store.products) {
    const category = categoriesById.get(product.categoryId);
    if (!category) continue;
    const signature = buildProductSignature(category, product.attributes || {});
    if (product.signature !== signature) {
      product.signature = signature;
      changed = true;
    }
    if (!product.archived) {
      if (activeSignatures.has(signature)) {
        throw new Error(`Dữ liệu có quy cách trùng sau khi chuẩn hóa: ${product.name || product.id}.`);
      }
      activeSignatures.add(signature);
    }
  }

  const productsById = new Map(store.products.map((product) => [product.id, product]));
  const requestKeys = new Set();
  for (const transaction of store.transactions || []) {
    const product = productsById.get(transaction.productId);
    const requestKey = String(transaction.requestKey || `migrated:${transaction.id}`);
    if (transaction.requestKey !== requestKey) changed = true;
    transaction.requestKey = requestKey;
    if (requestKeys.has(requestKey)) throw new Error(`Dữ liệu có khóa thao tác giao dịch trùng: ${transaction.id}.`);
    requestKeys.add(requestKey);

    const beforeQuantity = normalizeQuantity(transaction.beforeQuantity);
    const afterQuantity = normalizeQuantity(transaction.afterQuantity);
    const amount = normalizeQuantity(transaction.amount, Math.abs(afterQuantity - beforeQuantity));
    if (!quantitiesEqual(transaction.beforeQuantity, beforeQuantity) || !quantitiesEqual(transaction.afterQuantity, afterQuantity) || !quantitiesEqual(transaction.amount, amount)) changed = true;
    transaction.beforeQuantity = beforeQuantity;
    transaction.afterQuantity = afterQuantity;
    transaction.amount = amount;
    transaction.deltaQuantity = normalizeQuantity(afterQuantity - beforeQuantity, 0);
    transaction.actorId = String(transaction.actorId || "legacy-user");
    transaction.actorRole = String(transaction.actorRole || "legacy");
    transaction.reversedAt = transaction.reversedAt || null;
    transaction.reversedBy = transaction.reversedBy || null;
    transaction.reversalTransactionId = transaction.reversalTransactionId || null;
    transaction.reversalOf = transaction.reversalOf || null;
    transaction.originalType = transaction.originalType || null;
    transaction.hiddenAt = transaction.hiddenAt || null;
    transaction.hiddenBy = transaction.hiddenBy || null;
    transaction.hiddenReason = String(transaction.hiddenReason || "");
    if (!transaction.productSnapshot) {
      transaction.productSnapshot = createProductSnapshot(product, store.schema, transaction);
      transaction.productSnapshot.migrated = true;
      changed = true;
    }
  }


  if (!Array.isArray(store.accountAudit)) {
    store.accountAudit = [];
    changed = true;
  }

  const schemaCategoryIds = new Set(store.schema.categories.map((category) => category.id));
  for (const account of store.accounts) {
    const status = accountStatus(account);
    if (account.status !== status || account.active !== (status === ACCOUNT_STATUSES.active)) changed = true;
    account.status = status;
    account.active = status === ACCOUNT_STATUSES.active;
    if (!['all', 'custom'].includes(account.scopeMode)) {
      account.scopeMode = 'all';
      changed = true;
    }
    const normalizedPermissions = normalizeCategoryPermissions(account, store.schema);
    const cleanedPermissions = {};
    for (const categoryId of schemaCategoryIds) cleanedPermissions[categoryId] = normalizedPermissions[categoryId] || [];
    if (JSON.stringify(account.categoryPermissions || {}) !== JSON.stringify(cleanedPermissions)) changed = true;
    account.categoryPermissions = account.scopeMode === 'custom' ? cleanedPermissions : {};
    if (!account.passwordSalt || !account.passwordHash || !Number.isFinite(Number(account.passwordIterations))) {
      Object.assign(account, clone(DEFAULT_DEMO_PASSWORD_RECORD));
      changed = true;
    }
    if (Object.prototype.hasOwnProperty.call(account, "mustChangePassword")) {
      delete account.mustChangePassword;
      changed = true;
    }
    if (Object.prototype.hasOwnProperty.call(account, "passwordResetRequestedAt")) {
      delete account.passwordResetRequestedAt;
      changed = true;
    }
    if (Object.prototype.hasOwnProperty.call(account, "password")) {
      delete account.password;
      changed = true;
    }
  }

  if (!store.accounts.some((account) => normalizeRoleCode(account.role) === 'superadmin')) {
    store.accounts.unshift(clone(DEFAULT_ACCOUNTS.find((account) => normalizeRoleCode(account.role) === 'superadmin')));
    changed = true;
  }

  store.version = DATA_FORMAT_VERSION;
  return { store, changed };
}

function seedData() {
  const seeded = {
    version: DATA_FORMAT_VERSION,
    schema: clone(DEFAULT_SCHEMA),
    products: clone(DEFAULT_PRODUCTS),
    transactions: clone(DEFAULT_TRANSACTIONS),
    accounts: clone(DEFAULT_ACCOUNTS),
    accountAudit: [],
    updatedAt: new Date().toISOString(),
  };
  return migrateStoreData(seeded).store;
}

function validateBackupData(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("File sao lưu không hợp lệ.");
  const normalizedData = migrateStoreData(data).store;
  data = normalizedData;
  if (!data.schema || !Array.isArray(data.schema.categories)) throw new Error("File sao lưu thiếu danh mục vật liệu.");
  if (!Array.isArray(data.products) || !Array.isArray(data.transactions) || !Array.isArray(data.accounts)) {
    throw new Error("File sao lưu thiếu cấu trúc bắt buộc.");
  }

  const ensureUnique = (values, label) => {
    const normalized = values.map((value) => String(value || "").trim());
    if (normalized.some((value) => !value)) throw new Error(`${label} có giá trị rỗng.`);
    if (new Set(normalized).size !== normalized.length) throw new Error(`${label} có giá trị trùng.`);
  };

  ensureUnique(data.schema.categories.map((category) => category.id), "ID nhóm");
  for (const category of data.schema.categories) {
    if (!String(category.name || "").trim()) throw new Error("Có nhóm chưa có tên.");
    if (!Array.isArray(category.units) || !category.units.length) throw new Error(`Nhóm ${category.name} chưa có đơn vị.`);
    if (!Array.isArray(category.attributes) || !category.attributes.length) throw new Error(`Nhóm ${category.name} chưa có thuộc tính.`);
    ensureUnique(category.attributes.map((attribute) => attribute.id), `ID thuộc tính của nhóm ${category.name}`);
    if (!category.attributes.some((attribute) => attribute.identity && attribute.active !== false)) {
      throw new Error(`Nhóm ${category.name} chưa có thuộc tính nhận diện.`);
    }
  }

  const categoryIds = new Set(data.schema.categories.map((category) => category.id));
  ensureUnique(data.products.map((product) => product.id), "ID vật liệu");
  const activeSignatures = new Set();
  for (const product of data.products) {
    if (!categoryIds.has(product.categoryId)) throw new Error(`Vật liệu ${product.name || product.id} tham chiếu nhóm không tồn tại.`);
    if (!String(product.name || "").trim()) throw new Error("Có vật liệu chưa có tên.");
    if (toNumber(product.quantity, Number.NaN) < 0 || !Number.isFinite(toNumber(product.quantity, Number.NaN))) throw new Error(`Số tồn của ${product.name} không hợp lệ.`);
    if (toNumber(product.warningLevel, Number.NaN) < 0 || !Number.isFinite(toNumber(product.warningLevel, Number.NaN))) throw new Error(`Mức cảnh báo của ${product.name} không hợp lệ.`);
    if (!product.archived) {
      const signatureKey = `${product.categoryId}|${String(product.signature || "")}`;
      if (activeSignatures.has(signatureKey)) throw new Error(`File có quy cách vật liệu trùng: ${product.name}.`);
      activeSignatures.add(signatureKey);
    }
  }

  ensureUnique(data.transactions.map((transaction) => transaction.id), "ID giao dịch");
  ensureUnique(data.transactions.map((transaction) => transaction.requestKey), "Khóa thao tác giao dịch");
  const productIds = new Set(data.products.map((product) => product.id));
  const transactionIds = new Set(data.transactions.map((transaction) => transaction.id));
  for (const transaction of data.transactions) {
    if (!productIds.has(transaction.productId)) throw new Error(`Giao dịch ${transaction.id} tham chiếu vật liệu không tồn tại.`);
    if (!Object.values(TRANSACTION_TYPES).includes(transaction.type)) throw new Error(`Giao dịch ${transaction.id} có loại không hợp lệ.`);
    const before = normalizeQuantity(transaction.beforeQuantity);
    const after = normalizeQuantity(transaction.afterQuantity);
    const amount = normalizeQuantity(transaction.amount);
    if (![before, after, amount].every(Number.isFinite) || before < 0 || after < 0 || amount < 0) throw new Error(`Giao dịch ${transaction.id} có số lượng không hợp lệ.`);
    if (transaction.reversalOf && !transactionIds.has(transaction.reversalOf)) throw new Error(`Giao dịch đảo ${transaction.id} không tìm thấy giao dịch gốc.`);
    if (transaction.reversalTransactionId && !transactionIds.has(transaction.reversalTransactionId)) throw new Error(`Giao dịch ${transaction.id} tham chiếu giao dịch đảo không tồn tại.`);
  }

  ensureUnique(data.accounts.map((account) => account.id), "ID tài khoản");
  ensureUnique(data.accounts.map((account) => normalizeText(account.username)), "Tên đăng nhập");
  for (const account of data.accounts) {
    if (!ROLE_PRESETS[account.role]) throw new Error(`Tài khoản ${account.username} có vai trò không hợp lệ.`);
    if (!Object.values(ACCOUNT_STATUSES).includes(accountStatus(account))) throw new Error(`Tài khoản ${account.username} có trạng thái không hợp lệ.`);
    if (!['all', 'custom'].includes(account.scopeMode)) throw new Error(`Tài khoản ${account.username} có phạm vi không hợp lệ.`);
    validateUsername(account.username);
    if (!account.passwordSalt || !account.passwordHash || !Number.isFinite(Number(account.passwordIterations))) throw new Error(`Tài khoản ${account.username} thiếu dữ liệu xác thực.`);
    if (account.scopeMode === 'custom') {
      for (const [categoryId, permissions] of Object.entries(account.categoryPermissions || {})) {
        if (!categoryIds.has(categoryId)) throw new Error(`Tài khoản ${account.username} tham chiếu nhóm không tồn tại.`);
        if (!Array.isArray(permissions) || permissions.some((permission) => !CATEGORY_SCOPED_PERMISSION_SET.has(permission))) throw new Error(`Tài khoản ${account.username} có quyền nhóm không hợp lệ.`);
      }
    }
  }
  if (!Array.isArray(data.accountAudit)) throw new Error("File sao lưu thiếu nhật ký tài khoản.");

  return data;
}

const localDataService = {
  mode: "local",
  label: "Local Preview Adapter",
  capabilities: Object.freeze({ localBackup: true, cloud: false }),

  readStore() {
    try {
      const raw = safeStorage.getItem(STORAGE_KEYS.demoData);
      if (!raw) {
        const seeded = seedData();
        safeStorage.setItem(STORAGE_KEYS.demoData, JSON.stringify(seeded));
        return seeded;
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.products)) throw new Error("Dữ liệu thử nghiệm sai định dạng.");
      const migration = migrateStoreData(parsed);
      if (migration.changed) safeStorage.setItem(STORAGE_KEYS.demoData, JSON.stringify(migration.store));
      return migration.store;
    } catch (error) {
      console.warn("Không đọc được dữ liệu thử nghiệm, khởi tạo lại.", error);
      try {
        const raw = safeStorage.getItem(STORAGE_KEYS.demoData);
        if (raw) safeStorage.setItem(`${STORAGE_KEYS.demoData}:corrupt:${Date.now()}`, raw);
      } catch {
        // Không cản trở việc khởi tạo dữ liệu mẫu.
      }
      const seeded = seedData();
      safeStorage.setItem(STORAGE_KEYS.demoData, JSON.stringify(seeded));
      return seeded;
    }
  },

  writeStore(store) {
    const next = { ...store, updatedAt: new Date().toISOString() };
    safeStorage.setItem(STORAGE_KEYS.demoData, JSON.stringify(next));
    return next;
  },

  async login(usernameInput, password) {
    await delay(220);
    const store = this.readStore();
    let username;
    try {
      username = validateUsername(usernameInput);
    } catch {
      throw new Error("Tên đăng nhập hoặc mật khẩu không đúng.");
    }
    const account = store.accounts.find((item) => normalizeText(item.username).replace(/\s+/g, "") === username);
    const validPassword = account ? await verifyPassword(password, account) : false;
    if (!account || !validPassword) throw new Error("Tên đăng nhập hoặc mật khẩu không đúng.");
    const status = accountStatus(account);
    if (status === ACCOUNT_STATUSES.locked) throw new Error("Tài khoản đã bị khóa. Hãy liên hệ Super Admin.");
    if (status !== ACCOUNT_STATUSES.active) throw new Error("Tài khoản đã ngừng sử dụng.");
    saveAuthSession(account.id);
    return clone(account);
  },

  async logout() {
    await delay(60);
    clearAuthSession();
    return true;
  },

  async getSessionProfile(accountId) {
    await delay(80);
    const store = this.readStore();
    const account = store.accounts.find((item) => item.id === accountId);
    if (!account || accountStatus(account) !== ACCOUNT_STATUSES.active) return null;
    return clone(account);
  },

  async loadBootstrap() {
    await delay(120);
    const store = this.readStore();
    const actor = storeActor(store);
    if (!actor || accountStatus(actor) !== ACCOUNT_STATUSES.active) throw new Error("Phiên đăng nhập không còn hợp lệ.");
    return clone({ schema: store.schema, products: store.products.filter((product) => !product.archived), profile: actor });
  },

  async listTransactions({ limit = 50, offset = 0 } = {}) {
    await delay(100);
    const store = this.readStore();
    const actor = storeActor(store);
    if (!actor) throw new Error("Phiên đăng nhập không hợp lệ.");
    const visible = store.transactions.filter((transaction) => !transaction.hiddenAt && accountHasPermission(actor, PERMISSIONS.viewHistory, transaction.categoryId, store.schema));
    return clone(visible.slice(Math.max(0, offset), Math.max(0, offset) + Math.max(1, limit)));
  },

  async listAccounts() {
    await delay(100);
    const store = this.readStore();
    assertStorePermission(store, PERMISSIONS.manageAccounts);
    return clone(store.accounts);
  },

  async listAccountAudit({ limit = 50 } = {}) {
    await delay(90);
    const store = this.readStore();
    assertStorePermission(store, PERMISSIONS.manageAccounts);
    return clone((store.accountAudit || []).slice(0, Math.max(1, limit)));
  },


  async saveProduct(payload) {
    await delay(180);
    const store = this.readStore();
    const normalized = validateProductPayload(payload, store.schema, store.products);
    const requiredPermission = normalized.id ? PERMISSIONS.editProduct : PERMISSIONS.addProduct;
    const actor = assertStorePermission(store, requiredPermission, normalized.categoryId);
    const now = new Date().toISOString();
    let product;

    if (normalized.id) {
      const index = store.products.findIndex((item) => item.id === normalized.id && !item.archived);
      if (index < 0) throw new Error("Không tìm thấy vật liệu cần sửa.");
      product = {
        ...store.products[index],
        ...normalized,
        attributes: { ...(store.products[index].attributes || {}), ...(normalized.attributes || {}) },
        id: store.products[index].id,
        quantity: store.products[index].quantity,
        archived: false,
        updatedAt: now,
      };
      store.products[index] = product;
    } else {
      product = {
        ...normalized,
        id: makeId("prd"),
        quantity: 0,
        archived: false,
        createdAt: now,
        updatedAt: now,
      };
      store.products.unshift(product);
    }

    const initialStock = toNumber(payload.initialStock, 0);
    if (!normalized.id && initialStock > 0) {
      product.quantity = initialStock;
      product.updatedAt = now;
      const initialTransactionId = makeId("txn");
      store.transactions.unshift({
        id: initialTransactionId,
        requestKey: `initial:${product.id}`,
        productId: product.id,
        productName: product.name,
        categoryId: product.categoryId,
        type: TRANSACTION_TYPES.initial,
        amount: normalizeQuantity(initialStock),
        beforeQuantity: 0,
        afterQuantity: normalizeQuantity(initialStock),
        deltaQuantity: normalizeQuantity(initialStock),
        unit: product.unit,
        note: "Khởi tạo tồn khi tạo vật liệu",
        actor: actor.displayName,
        actorId: actor.id,
        actorRole: actor.role,
        productSnapshot: createProductSnapshot(product, store.schema),
        reversedAt: null,
        reversedBy: null,
        reversalTransactionId: null,
        reversalOf: null,
        originalType: null,
        createdAt: now,
      });
    }

    this.writeStore(store);
    return clone(product);
  },

  async archiveProduct(productId) {
    await delay(160);
    const store = this.readStore();
    const index = store.products.findIndex((item) => item.id === productId && !item.archived);
    if (index < 0) throw new Error("Không tìm thấy vật liệu cần lưu trữ.");
    assertStorePermission(store, PERMISSIONS.archiveProduct, store.products[index].categoryId);
    store.products[index] = { ...store.products[index], archived: true, updatedAt: new Date().toISOString() };
    this.writeStore(store);
    return true;
  },

  async applyTransaction(payload) {
    await delay(200);
    return withDemoWriteLock(async () => {
      const store = this.readStore();
    const requestKey = String(payload.requestKey || "").trim();
    if (!requestKey) throw new Error("Thiếu khóa thao tác giao dịch.");
    const existingTransaction = store.transactions.find((transaction) => transaction.requestKey === requestKey);
    if (existingTransaction) {
      const samePayload = existingTransaction.productId === payload.productId
        && existingTransaction.type === payload.type
        && quantitiesEqual(existingTransaction.amount, payload.amount)
        && String(existingTransaction.note || "") === String(payload.note || "").trim();
      if (!samePayload) throw new Error("Khóa thao tác đã được dùng cho một giao dịch khác.");
      const existingProduct = store.products.find((product) => product.id === existingTransaction.productId);
      if (!existingProduct) throw new Error("Giao dịch đã tồn tại nhưng vật liệu không còn trong dữ liệu.");
      return clone({ product: existingProduct, transaction: existingTransaction, duplicate: true });
    }

    const index = store.products.findIndex((item) => item.id === payload.productId && !item.archived);
    if (index < 0) throw new Error("Không tìm thấy vật liệu để giao dịch.");
    const product = store.products[index];
    const actor = assertStorePermission(store, transactionPermission(payload.type), product.categoryId);
    const normalized = validateTransactionPayload(payload, product);
    const now = new Date().toISOString();

    const updatedProduct = { ...product, quantity: normalized.afterQuantity, updatedAt: now };
    const transaction = {
      id: makeId("txn"),
      requestKey,
      productId: product.id,
      productName: product.name,
      categoryId: product.categoryId,
      type: normalized.type,
      amount: normalized.amount,
      beforeQuantity: normalized.beforeQuantity,
      afterQuantity: normalized.afterQuantity,
      deltaQuantity: normalized.deltaQuantity,
      unit: product.unit,
      note: normalized.note,
      actor: actor.displayName,
      actorId: actor.id,
      actorRole: actor.role,
      productSnapshot: createProductSnapshot(product, store.schema),
      reversedAt: null,
      reversedBy: null,
      reversalTransactionId: null,
      reversalOf: null,
      originalType: null,
      createdAt: now,
    };

    store.products[index] = updatedProduct;
    store.transactions.unshift(transaction);
      this.writeStore(store);
      return clone({ product: updatedProduct, transaction, duplicate: false });
    });
  },

  async reverseTransaction(payload) {
    await delay(220);
    return withDemoWriteLock(async () => {
      const store = this.readStore();
    const requestKey = String(payload.requestKey || "").trim();
    if (!requestKey) throw new Error("Thiếu khóa thao tác đảo giao dịch.");
    const existingReversal = store.transactions.find((transaction) => transaction.requestKey === requestKey);
    if (existingReversal) {
      const samePayload = existingReversal.reversalOf === payload.transactionId
        && String(existingReversal.note || "") === String(payload.reason || "").trim();
      if (!samePayload) throw new Error("Khóa thao tác đảo đã được dùng cho một yêu cầu khác.");
      const existingProduct = store.products.find((product) => product.id === existingReversal.productId);
      if (!existingProduct) throw new Error("Giao dịch đảo đã tồn tại nhưng vật liệu không còn trong dữ liệu.");
      return clone({ product: existingProduct, transaction: existingReversal, duplicate: true });
    }

    const originalIndex = store.transactions.findIndex((transaction) => transaction.id === payload.transactionId);
    if (originalIndex < 0) throw new Error("Không tìm thấy giao dịch cần đảo.");
    const original = store.transactions[originalIndex];
    const actor = assertStorePermission(store, PERMISSIONS.reverseTransaction, original.categoryId);
    if (original.type === TRANSACTION_TYPES.reverse || original.type === TRANSACTION_TYPES.initial) {
      throw new Error("Không hỗ trợ đảo giao dịch khởi tạo hoặc một giao dịch đảo.");
    }
    if (original.reversalTransactionId || original.reversedAt) throw new Error("Giao dịch này đã được đảo trước đó.");

    const latest = store.transactions.find((transaction) => transaction.productId === original.productId);
    if (!latest || latest.id !== original.id) {
      throw new Error("Chỉ được đảo giao dịch mới nhất của vật liệu để không làm sai chuỗi tồn kho.");
    }

    const productIndex = store.products.findIndex((product) => product.id === original.productId && !product.archived);
    if (productIndex < 0) throw new Error("Vật liệu không còn khả dụng để đảo giao dịch.");
    const product = store.products[productIndex];
    if (!quantitiesEqual(product.quantity, original.afterQuantity)) {
      throw new Error("Tồn hiện tại không khớp giao dịch gốc. Hãy tải lại dữ liệu và kiểm tra lịch sử.");
    }

    const reason = String(payload.reason || "").trim();
    if (!reason) throw new Error("Vui lòng nhập lý do đảo giao dịch.");
    const now = new Date().toISOString();
    const afterQuantity = normalizeQuantity(original.beforeQuantity);
    const reversal = {
      id: makeId("txn"),
      requestKey,
      productId: product.id,
      productName: original.productName,
      categoryId: original.categoryId,
      type: TRANSACTION_TYPES.reverse,
      amount: normalizeQuantity(Math.abs(afterQuantity - product.quantity), 0),
      beforeQuantity: normalizeQuantity(product.quantity),
      afterQuantity,
      deltaQuantity: normalizeQuantity(afterQuantity - product.quantity, 0),
      unit: original.unit,
      note: reason,
      actor: actor.displayName,
      actorId: actor.id,
      actorRole: actor.role,
      productSnapshot: clone(original.productSnapshot || createProductSnapshot(product, store.schema, original)),
      reversedAt: null,
      reversedBy: null,
      reversalTransactionId: null,
      reversalOf: original.id,
      originalType: original.type,
      createdAt: now,
    };

    store.transactions[originalIndex] = {
      ...original,
      reversedAt: now,
      reversedBy: actor.displayName,
      reversalTransactionId: reversal.id,
    };
    store.products[productIndex] = { ...product, quantity: afterQuantity, updatedAt: now };
      store.transactions.unshift(reversal);
      this.writeStore(store);
      return clone({ product: store.products[productIndex], transaction: reversal, original: store.transactions[originalIndex], duplicate: false });
    });
  },

  addAccountAudit(store, action, target, detail = "", actor = storeActor(store)) {
    if (!actor) throw new Error("Không tìm thấy tài khoản thực hiện thao tác.");
    if (!Array.isArray(store.accountAudit)) store.accountAudit = [];
    store.accountAudit.unshift({
      id: makeId("audit"),
      action,
      targetAccountId: target?.id || "",
      targetUsername: target?.username || "",
      actorId: actor.id,
      actorName: actor.displayName,
      actorRole: actor.role,
      detail: String(detail || ""),
      createdAt: new Date().toISOString(),
    });
    store.accountAudit = store.accountAudit.slice(0, 500);
  },

  async saveAccount(payload) {
    await delay(160);
    const store = this.readStore();
    const actor = assertStorePermission(store, PERMISSIONS.manageAccounts);
    if (normalizeRoleCode(actor.role) !== "superadmin") throw new Error("Chỉ Super Admin được quản lý tài khoản.");
    const existing = payload.id ? store.accounts.find((item) => item.id === payload.id) : null;
    if (payload.id && !existing) throw new Error("Không tìm thấy tài khoản cần sửa.");
    if (!canAccountManageTarget(actor, existing)) throw new Error("Bạn không có quyền quản lý tài khoản này.");

    const username = validateUsername(payload.username);
    const displayName = String(payload.displayName || "").trim();
    const role = String(payload.role || "viewer");
    const scopeMode = payload.scopeMode === "custom" ? "custom" : "all";
    const status = Object.values(ACCOUNT_STATUSES).includes(payload.status) ? payload.status : ACCOUNT_STATUSES.active;
    if (!displayName) throw new Error("Vui lòng nhập tên hiển thị.");
    if (!ROLE_PRESETS[role]) throw new Error("Vai trò không hợp lệ.");
    if (!assignableRolesForAccount(actor, existing).includes(role)) throw new Error("Bạn không được gán vai trò này.");
    if (existing && username !== existing.username) throw new Error("Không đổi tên đăng nhập sau khi tạo tài khoản.");
    const duplicate = store.accounts.find((account) => account.id !== payload.id && normalizeText(account.username).replace(/\s+/g, "") === username);
    if (duplicate) throw new Error("Tên đăng nhập đã tồn tại.");

    if (normalizeRoleCode(existing?.role) === "superadmin" && normalizeRoleCode(role) !== "superadmin" && accountStatus(existing) === ACCOUNT_STATUSES.active) {
      const remaining = store.accounts.filter((account) => account.id !== existing.id && normalizeRoleCode(account.role) === "superadmin" && accountStatus(account) === ACCOUNT_STATUSES.active);
      if (!remaining.length) throw new Error("Phải giữ ít nhất một Super Admin đang hoạt động.");
    }

    if (existing && status !== accountStatus(existing)) {
      if (!accountHasPermission(actor, PERMISSIONS.lockAccounts, null, store.schema)) throw new Error("Bạn không có quyền thay đổi trạng thái tài khoản.");
      if (existing.id === actor.id && status !== ACCOUNT_STATUSES.active) throw new Error("Không thể tự khóa hoặc ngừng tài khoản đang đăng nhập.");
      if (normalizeRoleCode(existing.role) === "superadmin" && accountStatus(existing) === ACCOUNT_STATUSES.active && status !== ACCOUNT_STATUSES.active) {
        const remaining = store.accounts.filter((account) => account.id !== existing.id && normalizeRoleCode(account.role) === "superadmin" && accountStatus(account) === ACCOUNT_STATUSES.active);
        if (!remaining.length) throw new Error("Phải giữ ít nhất một Super Admin đang hoạt động.");
      }
    }

    const allowedScoped = new Set(rolePermissions(role).includes("*") ? CATEGORY_SCOPED_PERMISSIONS : rolePermissions(role).filter((permission) => isCategoryScopedPermission(permission)));
    const categoryPermissions = {};
    if (scopeMode === "custom") {
      for (const category of store.schema.categories) {
        const requested = Array.isArray(payload.categoryPermissions?.[category.id]) ? payload.categoryPermissions[category.id] : [];
        categoryPermissions[category.id] = [...new Set(requested.filter((permission) => allowedScoped.has(permission)))];
      }
      if (!Object.values(categoryPermissions).some((permissions) => permissions.includes(PERMISSIONS.viewInventory))) {
        throw new Error("Phạm vi tùy chỉnh cần cho phép xem kho ở ít nhất một nhóm.");
      }
      validateCategoryPermissionDependencies(categoryPermissions, store.schema);
    }

    const now = new Date().toISOString();
    let account;
    if (existing) {
      const index = store.accounts.findIndex((item) => item.id === existing.id);
      account = { ...existing, username, displayName, role, status, active: status === ACCOUNT_STATUSES.active, scopeMode, categoryPermissions, updatedAt: now };
      store.accounts[index] = account;
      this.addAccountAudit(store, "update_account", account, `Vai trò: ${roleLabel(role)} · Trạng thái: ${accountStatusLabel(account)} · Phạm vi: ${scopeMode}`, actor);
    } else {
      if (String(payload.password || "") !== String(payload.passwordConfirm || "")) throw new Error("Xác nhận mật khẩu không khớp.");
      const passwordRecord = await createPasswordRecord(payload.password);
      account = {
        id: makeId("acc"), username, displayName, role, status: ACCOUNT_STATUSES.active, active: true, scopeMode, categoryPermissions,
        ...passwordRecord, createdAt: now, updatedAt: now,
      };
      store.accounts.unshift(account);
      this.addAccountAudit(store, "create_account", account, `Vai trò: ${roleLabel(role)} · Phạm vi: ${scopeMode} · Không bắt buộc đổi mật khẩu lần đầu`, actor);
    }
    this.writeStore(store);
    return clone(account);
  },

  async setAccountPassword(accountId, password, passwordConfirm) {
    await delay(160);
    const store = this.readStore();
    const actor = assertStorePermission(store, PERMISSIONS.resetAccountPassword);
    if (normalizeRoleCode(actor.role) !== "superadmin") throw new Error("Chỉ Super Admin được đặt lại mật khẩu.");
    const index = store.accounts.findIndex((account) => account.id === accountId);
    if (index < 0) throw new Error("Không tìm thấy tài khoản.");
    const target = store.accounts[index];
    if (!canAccountManageTarget(actor, target)) throw new Error("Bạn không có quyền thao tác với tài khoản này.");
    if (String(password || "") !== String(passwordConfirm || "")) throw new Error("Xác nhận mật khẩu không khớp.");
    const passwordRecord = await createPasswordRecord(password);
    store.accounts[index] = { ...target, ...passwordRecord, updatedAt: new Date().toISOString() };
    this.addAccountAudit(store, "reset_password", store.accounts[index], "Super Admin đã đặt mật khẩu mới; tài khoản không bị bắt buộc đổi ở lần đăng nhập tiếp theo.", actor);
    this.writeStore(store);
    return true;
  },

  async archiveAccount(accountId) {
    await delay(150);
    const store = this.readStore();
    const actor = assertStorePermission(store, PERMISSIONS.lockAccounts);
    const target = store.accounts.find((account) => account.id === accountId);
    if (!target) throw new Error("Không tìm thấy tài khoản.");
    if (!canAccountManageTarget(actor, target)) throw new Error("Bạn không có quyền thao tác với tài khoản này.");
    if (target.id === actor.id) throw new Error("Không thể tự ngừng tài khoản đang đăng nhập.");
    if (normalizeRoleCode(target.role) === "superadmin" && accountStatus(target) === ACCOUNT_STATUSES.active) {
      const remaining = store.accounts.filter((account) => account.id !== target.id && normalizeRoleCode(account.role) === "superadmin" && accountStatus(account) === ACCOUNT_STATUSES.active);
      if (!remaining.length) throw new Error("Phải giữ ít nhất một Super Admin đang hoạt động.");
    }
    const index = store.accounts.findIndex((account) => account.id === accountId);
    store.accounts[index] = { ...target, status: ACCOUNT_STATUSES.disabled, active: false, updatedAt: new Date().toISOString() };
    this.addAccountAudit(store, "disable_account", store.accounts[index], "Ngừng sử dụng tài khoản.", actor);
    this.writeStore(store);
    return true;
  },

  async saveCategory(payload) {
    await delay(180);
    const store = this.readStore();
    assertStorePermission(store, PERMISSIONS.manageSchema);
    const name = String(payload.name || "").trim();
    if (!name) throw new Error("Vui lòng nhập tên nhóm.");
    const units = Array.from(new Set(String(payload.units || "").split(",").map((item) => item.trim()).filter(Boolean)));
    if (!units.length) throw new Error("Nhóm phải có ít nhất một đơn vị.");
    const defaultUnit = String(payload.defaultUnit || units[0]).trim();
    if (!units.includes(defaultUnit)) throw new Error("Đơn vị mặc định phải nằm trong danh sách đơn vị.");
    const warningDefault = toNumber(payload.warningDefault, Number.NaN);
    if (!Number.isFinite(warningDefault) || warningDefault < 0) throw new Error("Mức cảnh báo mặc định không hợp lệ.");

    const existingCategory = payload.id ? store.schema.categories.find((category) => category.id === payload.id) : null;
    const existingAttributesById = new Map((existingCategory?.attributes || []).map((attribute) => [attribute.id, attribute]));
    let nextIdentityOrder = (existingCategory?.attributes || []).reduce((maximum, attribute) => {
      const order = toOptionalNumber(attribute.identityOrder);
      return order !== null ? Math.max(maximum, order) : maximum;
    }, -1) + 1;

    const attributes = payload.attributes.map((attribute, index) => {
      const attrName = String(attribute.name || "").trim();
      if (!attrName) throw new Error(`Thuộc tính ${index + 1} chưa có tên.`);
      const type = ["text", "number", "select"].includes(attribute.type) ? attribute.type : "text";
      const options = type === "select"
        ? Array.from(new Set(String(attribute.options || "").split(",").map((item) => item.trim()).filter(Boolean)))
        : [];
      if (type === "select" && !options.length) throw new Error(`${attrName} cần ít nhất một lựa chọn.`);
      const attributeId = attribute.id || `${payload.id || slugify(name)}-${slugify(attrName)}-${index + 1}`;
      const previousAttribute = existingAttributesById.get(attributeId);
      let identityOrder = toOptionalNumber(previousAttribute?.identityOrder);
      if (identityOrder === null) identityOrder = toOptionalNumber(attribute.identityOrder);
      if (Boolean(attribute.identity) && identityOrder === null) {
        identityOrder = nextIdentityOrder;
        nextIdentityOrder += 1;
      }
      return {
        id: attributeId,
        name: attrName,
        type,
        options,
        unit: String(attribute.unit || "").trim(),
        required: Boolean(attribute.required),
        identity: Boolean(attribute.identity),
        list: Boolean(attribute.list),
        active: true,
        sortOrder: index,
        identityOrder,
      };
    });
    if (!attributes.length) throw new Error("Nhóm cần ít nhất một thuộc tính.");
    if (!attributes.some((attribute) => attribute.identity)) throw new Error("Cần ít nhất một thuộc tính nhận diện để chống trùng.");

    const duplicateName = store.schema.categories.find((category) => category.id !== payload.id && normalizeText(category.name) === normalizeText(name));
    if (duplicateName) throw new Error("Tên nhóm đã tồn tại.");

    if (existingCategory) {
      const categoryAllProducts = store.products.filter((product) => product.categoryId === payload.id);
      const categoryProducts = categoryAllProducts.filter((product) => !product.archived);
      const hasActiveProducts = categoryProducts.length > 0;
      if (payload.active === false && hasActiveProducts) {
        throw new Error("Nhóm vẫn còn vật liệu đang hoạt động nên chưa thể ngừng sử dụng.");
      }
      const oldAttributesById = new Map(existingCategory.attributes.map((attribute) => [attribute.id, attribute]));
      const newAttributesById = new Map(attributes.map((attribute) => [attribute.id, attribute]));
      for (const [attributeId, oldAttribute] of oldAttributesById) {
        const nextAttribute = newAttributesById.get(attributeId);
        const productsUsingAttribute = categoryAllProducts.filter((product) => {
          const value = product.attributes?.[attributeId];
          return value !== "" && value !== null && value !== undefined;
        });
        if (!nextAttribute) {
          if (oldAttribute.identity && hasActiveProducts) {
            throw new Error(`Không thể xóa thuộc tính nhận diện “${oldAttribute.name}” khi nhóm đang có vật liệu hoạt động.`);
          }
          if (productsUsingAttribute.length) {
            attributes.push({ ...oldAttribute, active: false, required: false, identity: false, list: false, sortOrder: attributes.length });
          }
          continue;
        }
        if (productsUsingAttribute.length && nextAttribute.type !== oldAttribute.type) {
          throw new Error(`Không thể đổi kiểu dữ liệu của thuộc tính “${oldAttribute.name}” khi đã có dữ liệu.`);
        }
        if (hasActiveProducts && !oldAttribute.required && nextAttribute.required) {
          const hasMissingValue = categoryProducts.some((product) => {
            const value = product.attributes?.[attributeId];
            return value === "" || value === null || value === undefined;
          });
          if (hasMissingValue) throw new Error(`Chưa thể bắt buộc thuộc tính “${oldAttribute.name}” vì dữ liệu cũ còn thiếu giá trị.`);
        }
      }
      if (hasActiveProducts) {
        const unitsInUse = new Set(categoryProducts.map((product) => product.unit));
        for (const usedUnit of unitsInUse) {
          if (!units.includes(usedUnit)) throw new Error(`Đơn vị “${usedUnit}” đang được vật liệu sử dụng nên chưa thể xóa.`);
        }
        const oldIdentity = existingCategory.attributes
          .filter((attribute) => attribute.active !== false && attribute.identity)
          .map((attribute) => `${attribute.id}:${attribute.type}`)
          .sort()
          .join("|");
        const newIdentity = attributes
          .filter((attribute) => attribute.active !== false && attribute.identity)
          .map((attribute) => `${attribute.id}:${attribute.type}`)
          .sort()
          .join("|");
        if (oldIdentity !== newIdentity) {
          throw new Error("Nhóm đã có vật liệu. Không thể đổi cấu trúc thuộc tính nhận diện nếu chưa chạy migration chữ ký.");
        }
      }
    }

    const nowCategory = {
      id: payload.id || slugify(name),
      name,
      icon: String(payload.icon || "◇").trim().slice(0, 2) || "◇",
      units,
      defaultUnit,
      warningDefault,
      active: payload.active !== false,
      attributes,
    };

    if (payload.id) {
      const index = store.schema.categories.findIndex((category) => category.id === payload.id);
      if (index < 0) throw new Error("Không tìm thấy nhóm cần sửa.");

      const refreshedProducts = store.products.map((product) => {
        if (product.categoryId !== payload.id) return product;
        const signature = buildProductSignature(nowCategory, product.attributes || {});
        const name = String(product.customName || "").trim()
          ? product.name
          : buildProductName(nowCategory, product.attributes || {});
        return { ...product, signature, name, updatedAt: new Date().toISOString() };
      });
      const activeSignatures = new Set();
      for (const product of refreshedProducts.filter((item) => item.categoryId === payload.id && !item.archived)) {
        if (activeSignatures.has(product.signature)) {
          throw new Error(`Cấu hình nhận diện mới làm trùng quy cách: ${product.name}.`);
        }
        activeSignatures.add(product.signature);
      }

      store.products = refreshedProducts;
      store.schema.categories[index] = nowCategory;
    } else {
      if (store.schema.categories.some((category) => category.id === nowCategory.id)) nowCategory.id = `${nowCategory.id}-${Date.now()}`;
      store.schema.categories.push(nowCategory);
    }
    store.schema.version = toNumber(store.schema.version, 1) + 1;
    this.writeStore(store);
    return clone(nowCategory);
  },

  async setCategoryActive(categoryId, active) {
    await delay(140);
    const store = this.readStore();
    assertStorePermission(store, PERMISSIONS.manageSchema);
    const index = store.schema.categories.findIndex((category) => category.id === categoryId);
    if (index < 0) throw new Error("Không tìm thấy nhóm.");
    if (!active) {
      const hasActiveProducts = store.products.some((product) => product.categoryId === categoryId && !product.archived);
      if (hasActiveProducts) throw new Error("Nhóm vẫn còn vật liệu đang hoạt động. Hãy lưu trữ hoặc chuyển vật liệu trước.");
    }
    store.schema.categories[index] = { ...store.schema.categories[index], active: Boolean(active) };
    store.schema.version = toNumber(store.schema.version, 1) + 1;
    this.writeStore(store);
    return true;
  },

  async deleteInventoryHistory({ before = null, reason = "", confirmation = "" } = {}) {
    await delay(180);
    const store = this.readStore();
    const actor = assertStorePermission(store, PERMISSIONS.manageData);
    if (normalizeRoleCode(actor.role) !== "superadmin") throw new Error("Chỉ Super Admin được xóa lịch sử kho.");
    if (String(confirmation || "").trim().toUpperCase() !== "XOA LICH SU") throw new Error("Vui lòng nhập đúng XOA LICH SU để xác nhận.");
    if (String(reason || "").trim().length < 5) throw new Error("Vui lòng nhập lý do tối thiểu 5 ký tự.");
    const cutoff = before ? new Date(`${before}T23:59:59.999`) : null;
    if (cutoff && Number.isNaN(cutoff.getTime())) throw new Error("Ngày xóa lịch sử không hợp lệ.");
    const now = new Date().toISOString();
    let deletedCount = 0;
    store.transactions = store.transactions.map((transaction) => {
      const shouldHide = !transaction.hiddenAt && (!cutoff || new Date(transaction.createdAt) <= cutoff);
      if (!shouldHide) return transaction;
      deletedCount += 1;
      return {
        ...transaction,
        hiddenAt: now,
        hiddenBy: actor.id,
        hiddenReason: String(reason || "").trim(),
      };
    });
    store.accountAudit = Array.isArray(store.accountAudit) ? store.accountAudit : [];
    store.accountAudit.unshift({
      id: makeId("audit"),
      action: "hide_inventory_history",
      targetId: before || "all",
      targetUsername: "Lịch sử kho",
      actorId: actor.id,
      actorName: actor.displayName,
      actorRole: actor.role,
      detail: `${String(reason || "").trim()} · ${deletedCount} giao dịch`,
      createdAt: now,
    });
    this.writeStore(store);
    return { deletedCount, before: before || null };
  },

  exportBackup() {
    const store = this.readStore();
    assertStorePermission(store, PERMISSIONS.manageData);
    return clone(store);
  },

  async importBackup(data) {
    await delay(180);
    const currentStore = this.readStore();
    assertStorePermission(currentStore, PERMISSIONS.manageData);
    const validated = validateBackupData(data);
    safeStorage.setItem(STORAGE_KEYS.rollback, JSON.stringify(currentStore));
    const sanitized = {
      version: DATA_FORMAT_VERSION,
      schema: clone(validated.schema),
      products: clone(validated.products),
      transactions: clone(validated.transactions),
      accounts: clone(validated.accounts),
      accountAudit: clone(validated.accountAudit),
      updatedAt: new Date().toISOString(),
    };
    this.writeStore(sanitized);
    return true;
  },

  async resetDemo() {
    await delay(180);
    const currentStore = this.readStore();
    assertStorePermission(currentStore, PERMISSIONS.manageData);
    safeStorage.setItem(STORAGE_KEYS.rollback, JSON.stringify(currentStore));
    this.writeStore(seedData());
    return true;
  },

  async restoreRollback() {
    await delay(160);
    const activeStore = this.readStore();
    assertStorePermission(activeStore, PERMISSIONS.manageData);
    const raw = safeStorage.getItem(STORAGE_KEYS.rollback);
    if (!raw) throw new Error("Chưa có snapshot để khôi phục.");
    const rollbackData = validateBackupData(JSON.parse(raw));
    this.writeStore(rollbackData);
    safeStorage.setItem(STORAGE_KEYS.rollback, JSON.stringify(activeStore));
    return true;
  },
};

let dataServiceConfigurationError = null;
let dataService = localDataService;

if (window.APP_CONFIG?.dataMode === "supabase") {
  try {
    dataService = window.createSupabaseDataService(window.APP_CONFIG);
  } catch (error) {
    dataServiceConfigurationError = error;
    dataService = Object.freeze({
      mode: "unavailable",
      label: "Supabase chưa cấu hình",
      capabilities: Object.freeze({ localBackup: false, cloud: true }),
      async login() { throw dataServiceConfigurationError; },
      async logout() { clearAuthSession(); return true; },
      async getSessionProfile() { return null; },
    });
  }
}

function delay(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

async function withDemoWriteLock(task) {
  if (navigator.locks?.request) {
    return navigator.locks.request("kho-khuon-be-v2-demo-write", { mode: "exclusive" }, task);
  }
  return task();
}

async function withActionLock(key, button, task) {
  if (appState.actionLocks.has(key)) return;
  appState.actionLocks.add(key);
  const originalHTML = button?.innerHTML;
  const originalDisabled = button?.disabled;
  if (button) {
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    button.innerHTML = `<span class="spinner" aria-hidden="true"></span><span>Đang xử lý</span>`;
  }
  appState.ui.modalBusy = true;
  try {
    return await task();
  } finally {
    appState.actionLocks.delete(key);
    appState.ui.modalBusy = false;
    if (button?.isConnected) {
      button.disabled = Boolean(originalDisabled);
      button.removeAttribute("aria-busy");
      button.innerHTML = originalHTML;
    }
  }
}

function nextRequestId(key) {
  const id = (appState.requestIds[key] || 0) + 1;
  appState.requestIds[key] = id;
  return id;
}

function isCurrentRequest(key, id) {
  return appState.requestIds[key] === id;
}

async function checkInitializationStatus() {
  if (dataService.mode !== "supabase" || typeof dataService.getInitializationStatus !== "function") {
    appState.ui.initialized = true;
    return;
  }
  try {
    const result = await dataService.getInitializationStatus();
    appState.ui.initialized = Boolean(result?.initialized);
  } catch (error) {
    appState.ui.initialized = true;
    appState.ui.bootstrapError = error.message || "Không kiểm tra được trạng thái khởi tạo.";
  }
}

async function loadBootstrap({ render = true, silent = false } = {}) {
  const requestId = nextRequestId("bootstrap");
  appState.loading.bootstrap = true;
  appState.ui.bootstrapError = null;
  if (render) renderApp();
  try {
    const result = await dataService.loadBootstrap();
    if (!isCurrentRequest("bootstrap", requestId)) return;
    appState.cache.schema = result.schema;
    appState.cache.products = result.products;
    appState.cache.loaded.bootstrap = true;
    setAuthenticatedAccount(result.profile);
  } catch (error) {
    console.error(error);
    const invalidSession = ["AUTH_REQUIRED", "ACCOUNT_LOCKED", "ACCOUNT_DISABLED"].includes(error.code);
    if (invalidSession) {
      await dataService.logout().catch(() => {});
      clearAuthSession();
      setAuthenticatedAccount(null);
      await stopRealtimeSync();
      showToast("error", "Phiên đăng nhập không còn hợp lệ", error.message);
    } else {
      appState.ui.bootstrapError = error.message || "Không tải được dữ liệu từ máy chủ.";
      if (!silent) showToast("error", "Không tải được dữ liệu", appState.ui.bootstrapError);
    }
  } finally {
    if (isCurrentRequest("bootstrap", requestId)) {
      appState.loading.bootstrap = false;
      if (render) renderApp();
    }
  }
}

async function loadTransactions({ render = false, limit = 50, useFilters = appState.screen === SCREENS.history, silent = false } = {}) {
  if (appState.auth.status !== "signedIn") return;
  const requestId = nextRequestId("transactions");
  appState.loading.transactions = true;
  if (render) renderApp();
  try {
    const historyFilters = useFilters ? appState.filters.history : { type: "all", from: "", to: "" };
    const transactions = await dataService.listTransactions({
      limit,
      type: historyFilters.type !== "all" ? historyFilters.type : null,
      from: historyFilters.from || null,
      to: historyFilters.to || null,
    });
    if (!isCurrentRequest("transactions", requestId)) return;
    appState.cache.transactions = transactions;
    appState.cache.loaded.transactions = true;
  } catch (error) {
    if (!silent) showToast("error", "Không tải được lịch sử", error.message);
  } finally {
    if (isCurrentRequest("transactions", requestId)) {
      appState.loading.transactions = false;
      if (render) renderApp();
    }
  }
}

async function loadAccountData({ render = false, silent = false } = {}) {
  if (!hasPermission(PERMISSIONS.manageAccounts)) return;
  const requestId = nextRequestId("accounts");
  appState.loading.accounts = true;
  if (render) renderApp();
  try {
    const [accounts, accountAudit] = await Promise.all([dataService.listAccounts(), dataService.listAccountAudit({ limit: 50 })]);
    if (!isCurrentRequest("accounts", requestId)) return;
    appState.cache.accounts = accounts;
    appState.cache.accountAudit = accountAudit;
    appState.cache.loaded.accounts = true;
    appState.cache.loaded.accountAudit = true;
    syncCurrentUserFromAccounts();
  } catch (error) {
    if (!silent) showToast("error", "Không tải được dữ liệu tài khoản", error.message);
  } finally {
    if (isCurrentRequest("accounts", requestId)) {
      appState.loading.accounts = false;
      if (render) renderApp();
    }
  }
}

async function refreshInventoryAndHistory({ render = true } = {}) {
  await loadBootstrap({ render: false });
  if (appState.auth.status === "signedIn") await loadTransactions({ render: false, limit: appState.screen === SCREENS.history ? 200 : 50 });
  if (render) renderApp();
}

function realtimeStatusMeta() {
  if (dataService.mode !== "supabase") return { state: "local", label: "Trên thiết bị" };
  if (!navigator.onLine || appState.realtime.status === "offline") return { state: "offline", label: "Ngoại tuyến" };
  if (appState.realtime.status === "synced") return { state: "synced", label: "Đã đồng bộ" };
  if (appState.realtime.status === "disabled") return { state: "local", label: "Đồng bộ thủ công" };
  if (appState.realtime.status === "error") return { state: "error", label: "Đang kết nối lại" };
  return { state: "connecting", label: "Đang kết nối" };
}

function renderRealtimeStatusLine() {
  const meta = realtimeStatusMeta();
  return `<div class="status-line" data-realtime-status="true" data-state="${meta.state}"><span class="status-dot"></span><span>${escapeHTML(meta.label)}</span></div>`;
}

function updateRealtimeStatusLine() {
  const line = $("[data-realtime-status='true']");
  if (!line) return;
  const meta = realtimeStatusMeta();
  line.dataset.state = meta.state;
  const label = line.querySelector("span:last-child");
  if (label) label.textContent = meta.label;
}

function setRealtimeStatus(status) {
  appState.realtime.status = status;
  updateRealtimeStatusLine();
}

function realtimeScopeFromMessage(message) {
  const direct = message?.scope;
  const nested = message?.payload?.scope;
  const deeper = message?.payload?.payload?.scope;
  const scope = String(direct || nested || deeper || "all").toLowerCase();
  return ["inventory", "history", "schema", "access", "all"].includes(scope) ? scope : "all";
}

function scheduleRealtimeRefresh(scope = "all", wait = 360) {
  if (appState.auth.status !== "signedIn") return;
  appState.realtime.pendingScopes.add(scope);
  clearTimeout(appState.realtime.refreshTimer);
  appState.realtime.refreshTimer = window.setTimeout(() => {
    appState.realtime.refreshTimer = null;
    void performRealtimeRefresh();
  }, wait);
}

async function performRealtimeRefresh() {
  if (appState.auth.status !== "signedIn" || dataService.mode !== "supabase") return;
  if (!navigator.onLine) {
    setRealtimeStatus("offline");
    return;
  }
  if (appState.realtime.refreshInFlight) {
    scheduleRealtimeRefresh("all", 240);
    return;
  }

  const scopes = new Set(appState.realtime.pendingScopes);
  appState.realtime.pendingScopes.clear();
  if (!scopes.size) scopes.add("all");
  appState.realtime.refreshInFlight = true;

  try {
    const needsBootstrap = scopes.has("all") || scopes.has("inventory") || scopes.has("schema") || scopes.has("access");
    const needsHistory = scopes.has("all") || scopes.has("history") || scopes.has("inventory");
    const needsAccounts = (scopes.has("all") || scopes.has("access"))
      && appState.screen === SCREENS.manage
      && appState.manageTab === MANAGE_TABS.accounts;

    if (needsBootstrap) await loadBootstrap({ render: false, silent: true });
    if (appState.auth.status !== "signedIn") {
      closeModal(true);
      renderApp();
      return;
    }
    if (needsHistory && hasPermission(PERMISSIONS.viewHistory)) {
      const historyScreen = appState.screen === SCREENS.history;
      await loadTransactions({ render: false, limit: historyScreen ? 200 : 50, useFilters: historyScreen, silent: true });
    }
    if (needsAccounts && hasPermission(PERMISSIONS.manageAccounts)) await loadAccountData({ render: false, silent: true });

    appState.realtime.lastSyncedAt = new Date().toISOString();
    if (appState.realtime.status !== "error") setRealtimeStatus("synced");
    renderApp();
  } finally {
    appState.realtime.refreshInFlight = false;
    if (appState.realtime.pendingScopes.size) scheduleRealtimeRefresh("all", 180);
  }
}

function handleRealtimeStatus(status) {
  if (status === "SUBSCRIBED") {
    const wasSubscribed = appState.realtime.hasSubscribed;
    appState.realtime.hasSubscribed = true;
    setRealtimeStatus("synced");
    if (wasSubscribed) scheduleRealtimeRefresh("all", 120);
    return;
  }
  if (status === "DISABLED") {
    setRealtimeStatus("disabled");
    return;
  }
  if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
    setRealtimeStatus(navigator.onLine ? "error" : "offline");
    return;
  }
  if (status === "CLOSED") setRealtimeStatus(navigator.onLine ? "connecting" : "offline");
}

async function stopRealtimeSync() {
  clearTimeout(appState.realtime.refreshTimer);
  appState.realtime.refreshTimer = null;
  appState.realtime.pendingScopes.clear();
  appState.realtime.hasSubscribed = false;
  const unsubscribe = appState.realtime.unsubscribe;
  appState.realtime.unsubscribe = null;
  if (unsubscribe) {
    try { await unsubscribe(); } catch { /* Cleanup only. */ }
  } else if (typeof dataService.unsubscribeRealtime === "function") {
    try { await dataService.unsubscribeRealtime(); } catch { /* Cleanup only. */ }
  }
  setRealtimeStatus(navigator.onLine ? "idle" : "offline");
}

function startRealtimeSync() {
  if (dataService.mode !== "supabase" || appState.auth.status !== "signedIn" || typeof dataService.subscribeRealtime !== "function") return;
  if (appState.realtime.unsubscribe) return;
  setRealtimeStatus(navigator.onLine ? "connecting" : "offline");
  if (!navigator.onLine) return;
  appState.realtime.unsubscribe = dataService.subscribeRealtime({
    onEvent: (message) => scheduleRealtimeRefresh(realtimeScopeFromMessage(message)),
    onStatus: handleRealtimeStatus,
  });
}

function bindRealtimeLifecycle() {
  window.addEventListener("offline", () => setRealtimeStatus("offline"));
  window.addEventListener("online", () => {
    if (appState.auth.status !== "signedIn") return;
    setRealtimeStatus("connecting");
    if (!appState.realtime.unsubscribe) startRealtimeSync();
    scheduleRealtimeRefresh("all", 100);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden || appState.auth.status !== "signedIn" || !navigator.onLine) return;
    if (!appState.realtime.unsubscribe) startRealtimeSync();
    scheduleRealtimeRefresh("all", 160);
  });
}

async function restoreSession() {
  if (dataService.mode === "supabase") {
    const profile = await dataService.getSessionProfile();
    if (!profile) {
      clearAuthSession();
      setAuthenticatedAccount(null);
      return;
    }
    setAuthenticatedAccount(profile);
    await loadBootstrap({ render: false });
    if (appState.auth.status === "signedIn") await loadTransactions({ render: false, limit: 50 });
    return;
  }

  const session = readAuthSession();
  if (!session) {
    setAuthenticatedAccount(null);
    return;
  }
  const profile = await dataService.getSessionProfile(session.accountId);
  if (!profile) {
    clearAuthSession();
    setAuthenticatedAccount(null);
    return;
  }
  setAuthenticatedAccount(profile);
  await loadBootstrap({ render: false });
  if (appState.auth.status === "signedIn") await loadTransactions({ render: false, limit: 50 });
}

function screenMeta() {
  const map = {
    [SCREENS.dashboard]: ["Tổng quan", "Kho Khuôn Bế"],
    [SCREENS.inventory]: ["Kho vật liệu", "Quản lý tồn"],
    [SCREENS.history]: ["Lịch sử", "Giao dịch kho"],
    [SCREENS.manage]: ["Quản lý", roleLabel(appState.currentUser.role)],
  };
  return map[appState.screen] || map[SCREENS.dashboard];
}

function renderApp() {
  const app = $("#app");
  if (!app) return;
  if (appState.auth.status === "checking") {
    app.setAttribute("aria-busy", "true");
    app.innerHTML = renderAuthLoadingScreen();
    return;
  }
  if (appState.auth.status !== "signedIn" || !appState.currentUser) {
    app.setAttribute("aria-busy", "false");
    app.innerHTML = renderLoginScreen();
    return;
  }
  const [title, eyebrow] = screenMeta();
  app.setAttribute("aria-busy", String(Boolean(appState.loading.bootstrap)));
  app.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <div class="topbar-row">
          <div class="brand-block">
            <div class="eyebrow">${escapeHTML(eyebrow)}</div>
            <h1 class="page-title">${escapeHTML(title)}</h1>
          </div>
          <div class="topbar-actions">
            <button class="icon-btn" type="button" data-action="toggle-theme" aria-label="Chuyển sang giao diện ${appState.theme === "dark" ? "sáng" : "tối"}">
              ${icon(appState.theme === "dark" ? "sun" : "moon")}
            </button>
            <button class="icon-btn" type="button" data-action="open-profile" aria-label="Mở thông tin người dùng">
              ${icon("account")}
            </button>
          </div>
        </div>
      </header>

      <main id="main-content" class="main-content" tabindex="-1">
        ${renderCurrentScreen()}
      </main>

      ${renderBottomNavigation()}
    </div>`;
}

function renderAuthLoadingScreen() {
  return `<main class="auth-shell" aria-label="Đang kiểm tra phiên đăng nhập"><section class="auth-card"><div class="auth-logo">${icon("inventory")}</div><div class="skeleton" style="height:28px;width:68%;margin:auto"></div><div class="skeleton" style="height:52px;margin-top:24px"></div></section></main>`;
}

function renderLoginScreen() {
  const needsBootstrap = dataService.mode === "supabase" && appState.ui.initialized === false;
  return `<main class="auth-shell">
    <section class="auth-card" aria-labelledby="login-title">
      <div class="auth-top-actions"><button class="icon-btn" type="button" data-action="toggle-theme" aria-label="Chuyển sang giao diện ${appState.theme === "dark" ? "sáng" : "tối"}">${icon(appState.theme === "dark" ? "sun" : "moon")}</button></div>
      <div class="auth-logo">${icon("inventory")}</div>
      <div class="auth-copy"><div class="eyebrow">Quản lý vật liệu</div><h1 id="login-title" class="auth-title">Kho Khuôn Bế</h1><p class="auth-subtitle">${needsBootstrap ? "Tạo Super Admin đầu tiên để bắt đầu sử dụng." : "Đăng nhập bằng tên tài khoản do Super Admin cấp."}</p></div>
      ${needsBootstrap ? `<form id="bootstrap-form" class="field-grid auth-form" novalidate>
        <label class="field" for="bootstrap-username"><span class="field-label">Tên đăng nhập Super Admin</span><input id="bootstrap-username" name="username" class="input" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" value="superadmin" required autofocus></label>
        <label class="field" for="bootstrap-display-name"><span class="field-label">Tên hiển thị</span><input id="bootstrap-display-name" name="displayName" class="input" type="text" autocomplete="name" value="Super Admin" required></label>
        <label class="field" for="bootstrap-password"><span class="field-label">Mật khẩu</span><input id="bootstrap-password" name="password" class="input" type="password" autocomplete="new-password" minlength="8" required></label>
        <label class="field" for="bootstrap-password-confirm"><span class="field-label">Nhập lại mật khẩu</span><input id="bootstrap-password-confirm" name="passwordConfirm" class="input" type="password" autocomplete="new-password" minlength="8" required></label>
        <button class="btn btn-primary btn-full" type="submit">Tạo Super Admin</button>
      </form>` : `<form id="login-form" class="field-grid auth-form" novalidate>
        <label class="field" for="login-username"><span class="field-label">Tên đăng nhập</span><input id="login-username" name="username" class="input" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" required autofocus></label>
        <label class="field" for="login-password"><span class="field-label">Mật khẩu</span><input id="login-password" name="password" class="input" type="password" autocomplete="current-password" required></label>
        <button class="btn btn-primary btn-full" type="submit">Đăng nhập</button>
      </form>`}
      ${dataService.mode === "local"
        ? `<div class="notice"><div class="notice-icon">${icon("info")}</div><div><div class="notice-title">Tài khoản thử nghiệm</div><div class="notice-text"><strong>superadmin-demo</strong> · mật khẩu <strong>${escapeHTML(DEFAULT_DEMO_PASSWORD)}</strong>.</div></div></div>`
        : dataServiceConfigurationError
          ? `<div class="notice notice-danger"><div class="notice-icon">${icon("warning")}</div><div><div class="notice-title">Supabase chưa cấu hình</div><div class="notice-text">${escapeHTML(dataServiceConfigurationError.message)}</div></div></div>`
          : appState.ui.bootstrapError
            ? `<div class="notice notice-danger"><div class="notice-icon">${icon("warning")}</div><div><div class="notice-title">Database chưa sẵn sàng</div><div class="notice-text">${escapeHTML(appState.ui.bootstrapError)} Hãy chạy file database.sql trong Supabase SQL Editor.</div></div></div>`
            : `<div class="notice"><div class="notice-icon">${icon("cloud")}</div><div><div class="notice-title">Dữ liệu Supabase</div><div class="notice-text">Dùng được trên iPhone, iPad và máy tính. Không cần email thật.</div></div></div>`}
      <div class="app-footer-note">Phiên bản ${APP_VERSION}</div>
    </section>
  </main>`;
}

function renderCurrentScreen() {
  if (appState.loading.bootstrap && !appState.cache.schema) return renderLoadingScreen();
  if (appState.ui.bootstrapError && !appState.cache.schema) {
    return `<section class="screen"><div class="card">${renderEmptyState("warning", "Không tải được dữ liệu", appState.ui.bootstrapError)}<button class="btn btn-primary btn-block" type="button" data-action="retry-bootstrap">Thử tải lại</button></div></section>`;
  }
  if (appState.screen === SCREENS.inventory) return renderInventoryScreen();
  if (appState.screen === SCREENS.history) return renderHistoryScreen();
  if (appState.screen === SCREENS.manage) return renderManageScreen();
  return renderDashboardScreen();
}

function renderLoadingScreen() {
  return `<section class="screen" aria-label="Đang tải dữ liệu">
    <div class="skeleton loading-block"></div>
    <div class="metric-grid"><div class="skeleton loading-block"></div><div class="skeleton loading-block"></div></div>
    <div class="card"><div class="skeleton" style="height:240px"></div></div>
  </section>`;
}

function renderBottomNavigation() {
  const items = [
    [SCREENS.dashboard, "dashboard", "Tổng quan"],
    [SCREENS.inventory, "inventory", "Kho"],
    ["quick", "plus", "Giao dịch"],
    [SCREENS.history, "history", "Lịch sử"],
    [SCREENS.manage, "manage", "Quản lý"],
  ];
  return `<nav class="bottom-nav" aria-label="Điều hướng chính">
    ${items.map(([key, iconName, label]) => {
      const quick = key === "quick";
      const active = !quick && appState.screen === key;
      return `<button class="nav-item${quick ? " nav-primary" : ""}" type="button" data-nav="${key}" ${active ? 'aria-current="page"' : ""} aria-label="${escapeHTML(label)}">
        ${icon(iconName)}<span>${escapeHTML(label)}</span>
      </button>`;
    }).join("")}
  </nav>`;
}

function renderDashboardScreen() {
  if (!hasPermission(PERMISSIONS.viewInventory)) return renderAccessDenied("Bạn chưa có quyền xem tổng quan kho.");
  const products = visibleProducts();
  const quantityProducts = products.filter((product) => hasPermission(PERMISSIONS.viewQuantity, product.categoryId));
  const historyTransactions = visibleTransactions();
  const canViewQuantity = quantityProducts.length > 0;
  const canViewHistory = historyTransactions.length > 0 || hasPermission(PERMISSIONS.viewHistory);
  const totalQuantity = canViewQuantity ? quantityProducts.reduce((sum, product) => sum + toNumber(product.quantity), 0) : null;
  const outCount = canViewQuantity ? quantityProducts.filter((product) => productStatus(product).key === "out").length : null;
  const lowProducts = canViewQuantity
    ? quantityProducts.filter((product) => productStatus(product).key !== "ok").sort((a, b) => toNumber(a.quantity) - toNumber(b.quantity))
    : [];
  const today = formatISODate(new Date());
  const todayTransactions = historyTransactions.filter((transaction) => formatISODate(transaction.createdAt) === today);
  const recentTransactions = historyTransactions.slice(0, 4);

  return `<section class="screen" aria-label="Tổng quan kho">
    <div class="notice">
      <div class="notice-icon">${icon(dataService.mode === "supabase" ? "cloud" : "database")}</div>
      <div>
        <div class="notice-title">${dataService.mode === "supabase" ? "Đã kết nối Supabase" : "Bản thử nghiệm trên thiết bị"}</div>
        <div class="notice-text">${dataService.mode === "supabase" ? "Dữ liệu được lưu trên cloud và dùng chung giữa iPhone, iPad và máy tính." : "Dữ liệu hiện tại chỉ dùng để kiểm thử giao diện và nghiệp vụ."}</div>
      </div>
    </div>

    <article class="hero-card">
      <div class="hero-label">${canViewQuantity ? "Tổng số lượng đang quản lý" : "Tổng quan tồn kho"}</div>
      <div class="hero-value">${canViewQuantity ? formatQuantity(totalQuantity) : "Đã ẩn"}</div>
      <div class="hero-meta">${products.length} quy cách trong phạm vi · ${canViewQuantity ? `${quantityProducts.length} quy cách được xem số lượng` : "không có quyền xem số lượng"}</div>
    </article>

    <div class="metric-grid" aria-label="Chỉ số kho">
      ${renderMetric(products.length, "Quy cách hoạt động")}
      ${renderMetric(canViewQuantity ? lowProducts.length : "—", "Cần chú ý")}
      ${renderMetric(canViewQuantity ? outCount : "—", "Đã hết hàng")}
      ${renderMetric(canViewHistory ? todayTransactions.length : "—", "Giao dịch hôm nay")}
    </div>

    <section>
      <div class="section-head">
        <div class="section-copy"><h2 class="section-title">Cần xử lý</h2><p class="section-subtitle">${canViewQuantity ? "Vật liệu hết hoặc dưới mức cảnh báo." : "Số lượng đang được ẩn theo quyền."}</p></div>
        <button class="btn btn-compact btn-secondary" type="button" data-nav="inventory">Mở kho</button>
      </div>
      <div class="card list-card" style="margin-top:10px">
        ${canViewQuantity ? (lowProducts.length ? lowProducts.slice(0, 5).map(renderProductRow).join("") : renderEmptyState("check", "Tồn kho ổn định", "Chưa có vật liệu nào dưới mức cảnh báo.")) : renderEmptyState("shield", "Đã ẩn số lượng", "Vai trò hiện tại không được xem cảnh báo tồn kho.")}
      </div>
    </section>

    ${canViewHistory ? `<section>
      <div class="section-head">
        <div class="section-copy"><h2 class="section-title">Giao dịch gần đây</h2><p class="section-subtitle">Bốn thay đổi mới nhất trong kho.</p></div>
      </div>
      <div class="card list-card" style="margin-top:10px">
        ${recentTransactions.length ? recentTransactions.map(renderTransactionRow).join("") : renderEmptyState("history", "Chưa có giao dịch", "Giao dịch mới sẽ xuất hiện tại đây.")}
      </div>
    </section>` : ""}

    <div class="app-footer-note">Phiên bản ${APP_VERSION}</div>
  </section>`;
}

function renderMetric(value, label) {
  return `<article class="metric"><div class="metric-value">${formatQuantity(value)}</div><div class="metric-label">${escapeHTML(label)}</div></article>`;
}

function filteredProducts() {
  const { search, category, status, quantityBelow } = appState.filters.inventory;
  const tokens = searchTokens(search);
  const hasQuantityBelow = String(quantityBelow ?? "").trim() !== "";
  const quantityBelowValue = hasQuantityBelow ? toNumber(quantityBelow, Number.NaN) : null;
  return visibleProducts().filter((product) => {
    const categoryItem = categoryById(product.categoryId);
    const searchText = productSearchText(product, categoryItem);
    const matchesSearch = !tokens.length || tokens.every((token) => searchText.includes(token));
    const matchesCategory = category === "all" || product.categoryId === category;
    const matchesStatus = status === "all" || (hasPermission(PERMISSIONS.viewQuantity, product.categoryId) && productStatus(product).key === status);
    const matchesQuantity = !hasQuantityBelow
      || (Number.isFinite(quantityBelowValue)
        && quantityBelowValue >= 0
        && hasPermission(PERMISSIONS.viewQuantity, product.categoryId)
        && toNumber(product.quantity) < quantityBelowValue);
    return matchesSearch && matchesCategory && matchesStatus && matchesQuantity;
  }).sort((a, b) => a.name.localeCompare(b.name, "vi"));
}

function renderInventoryScreen() {
  if (!hasPermission(PERMISSIONS.viewInventory)) return renderAccessDenied("Bạn chưa có quyền xem kho vật liệu.");
  const categories = categoriesWithPermission(PERMISSIONS.viewInventory);
  const visibleInventoryProducts = visibleProducts();
  const canFilterStatus = visibleInventoryProducts.length > 0 && visibleInventoryProducts.every((product) => hasPermission(PERMISSIONS.viewQuantity, product.categoryId));
  const canFilterQuantity = canFilterStatus;
  if (!canFilterStatus && appState.filters.inventory.status !== "all") appState.filters.inventory.status = "all";
  if (!canFilterQuantity && appState.filters.inventory.quantityBelow !== "") appState.filters.inventory.quantityBelow = "";
  const products = filteredProducts();
  return `<section class="screen" aria-label="Kho vật liệu">
    <div class="toolbar">
      <div class="toolbar-row">
        <label class="search-wrap" for="inventory-search">
          <span class="search-icon">${icon("search")}</span>
          <input id="inventory-search" class="input" type="search" inputmode="search" autocomplete="off" placeholder="Ví dụ: dao cắt 0.7 23.8" value="${escapeHTML(appState.filters.inventory.search)}">
        </label>
        ${categoriesWithPermission(PERMISSIONS.addProduct).length ? `<button class="icon-btn" type="button" data-action="add-product" aria-label="Thêm vật liệu">${icon("plus")}</button>` : ""}
      </div>
      <div class="filter-grid">
        <label class="field" for="inventory-category">
          <span class="field-label">Nhóm vật liệu</span>
          <select id="inventory-category" class="select">
            <option value="all">Tất cả nhóm</option>
            ${categories.map((category) => `<option value="${escapeHTML(category.id)}" ${category.id === appState.filters.inventory.category ? "selected" : ""}>${escapeHTML(category.name)}</option>`).join("")}
          </select>
        </label>
        <label class="field" for="inventory-status">
          <span class="field-label">Tình trạng</span>
          <select id="inventory-status" class="select" ${canFilterStatus ? "" : "disabled"}>
            ${[["all", "Tất cả"], ["ok", "Đủ hàng"], ["low", "Sắp hết"], ["out", "Hết hàng"]].map(([value, label]) => `<option value="${value}" ${value === appState.filters.inventory.status ? "selected" : ""}>${label}</option>`).join("")}
          </select>${canFilterStatus ? "" : '<span class="field-help">Đã tắt để tránh suy luận tồn của nhóm bị ẩn số lượng.</span>'}
        </label>
        <label class="field inventory-quantity-filter" for="inventory-quantity-below">
          <span class="field-label">Số lượng dưới</span>
          <input id="inventory-quantity-below" class="input" type="number" inputmode="decimal" min="0" step="any" placeholder="Ví dụ: 5" value="${escapeHTML(appState.filters.inventory.quantityBelow)}" ${canFilterQuantity ? "" : "disabled"}>
        </label>
      </div>
    </div>

    <div class="section-head">
      <div class="section-copy"><h2 class="section-title">Danh sách vật liệu</h2><p id="inventory-result-count" class="section-subtitle">${products.length} kết quả</p></div>
      ${renderRealtimeStatusLine()}
    </div>

    <div id="inventory-list" class="card list-card">
      ${renderInventoryListContent(products)}
    </div>
  </section>`;
}

function renderInventoryListContent(products = filteredProducts()) {
  return products.length
    ? products.map(renderProductRow).join("")
    : renderEmptyState("search", "Không tìm thấy vật liệu", "Thử thay đổi từ khóa hoặc bộ lọc.");
}

function renderProductRow(product) {
  const category = categoryById(product.categoryId);
  const canViewQuantity = hasPermission(PERMISSIONS.viewQuantity, product.categoryId);
  const status = canViewQuantity ? productStatus(product) : null;
  const quantityText = canViewQuantity ? `${formatQuantity(product.quantity)} ${escapeHTML(product.unit)}` : "Đã ẩn";
  return `<button class="list-row list-row-button" type="button" data-action="open-product" data-product-id="${escapeHTML(product.id)}">
    <div class="row-main">
      <div class="row-title">${escapeHTML(product.name)}</div>
      <div class="row-sub">${escapeHTML(category?.name || "Chưa phân nhóm")} · ${product.note ? escapeHTML(product.note) : "Không có ghi chú"}</div>
    </div>
    <div class="row-copy">
      <div class="row-value">${quantityText}</div>
      ${status ? `<div style="margin-top:5px;text-align:right"><span class="badge ${status.className}">${escapeHTML(status.label)}</span></div>` : ""}
    </div>
  </button>`;
}

function filteredTransactions() {
  const { search, type, from, to } = appState.filters.history;
  const searchKey = normalizeText(search);
  return visibleTransactions().filter((transaction) => {
    const date = formatISODate(transaction.createdAt);
    const matchesSearch = !searchKey || normalizeText(`${transaction.productName} ${transaction.note} ${transaction.actor}`).includes(searchKey);
    const matchesType = type === "all" || transaction.type === type;
    const matchesFrom = !from || date >= from;
    const matchesTo = !to || date <= to;
    return matchesSearch && matchesType && matchesFrom && matchesTo;
  });
}

function renderHistoryScreen() {
  if (!hasPermission(PERMISSIONS.viewHistory)) return renderAccessDenied("Vai trò hiện tại chưa có quyền xem lịch sử giao dịch.");
  const transactions = filteredTransactions();
  return `<section class="screen" aria-label="Lịch sử giao dịch">
    <div class="toolbar">
      <label class="search-wrap" for="history-search">
        <span class="search-icon">${icon("search")}</span>
        <input id="history-search" class="input" type="search" inputmode="search" autocomplete="off" placeholder="Tìm vật liệu, ghi chú, người tạo" value="${escapeHTML(appState.filters.history.search)}">
      </label>
      <div class="filter-grid history-filter-grid">
        <label class="field" for="history-type"><span class="field-label">Loại giao dịch</span><select id="history-type" class="select">
          <option value="all">Tất cả</option>
          ${Object.entries(TRANSACTION_LABELS).map(([value, label]) => `<option value="${value}" ${value === appState.filters.history.type ? "selected" : ""}>${escapeHTML(label)}</option>`).join("")}
        </select></label>
        <div class="field-grid two history-date-grid">
          <label class="field" for="history-from"><span class="field-label">Từ ngày</span><input id="history-from" class="input" type="date" value="${escapeHTML(appState.filters.history.from)}"></label>
          <label class="field" for="history-to"><span class="field-label">Đến ngày</span><input id="history-to" class="input" type="date" value="${escapeHTML(appState.filters.history.to)}"></label>
        </div>
      </div>
    </div>

    <div class="section-head history-section-head">
      <div class="section-copy"><h2 class="section-title">Các thay đổi trong kho</h2><p id="history-result-count" class="section-subtitle">${transactions.length} giao dịch</p></div>
      <div class="inline-actions">
        <button class="btn btn-compact btn-secondary" type="button" data-action="clear-history-filters">Xóa lọc</button>
        ${normalizeRoleCode(appState.currentUser.role) === "superadmin" && hasPermission(PERMISSIONS.manageData) ? `<button class="btn btn-compact btn-danger-soft" type="button" data-action="open-history-cleanup">${icon("trash")} Xóa lịch sử</button>` : ""}
      </div>
    </div>

    <div id="history-list" class="card list-card">
      ${transactions.length ? transactions.map(renderTransactionRow).join("") : renderEmptyState("history", "Không có giao dịch phù hợp", "Thử xóa bộ lọc hoặc chọn khoảng ngày khác.")}
    </div>
  </section>`;
}

function transactionPresentation(transaction) {
  if (transaction.type === TRANSACTION_TYPES.import) return { sign: "+", className: "positive", badge: "badge-success" };
  if (transaction.type === TRANSACTION_TYPES.export) return { sign: "−", className: "negative", badge: "badge-danger" };
  if (transaction.type === TRANSACTION_TYPES.reverse) return { sign: "↶", className: "warning", badge: "badge-warning" };
  return { sign: "→", className: "neutral", badge: "badge-purple" };
}

function renderTransactionRow(transaction) {
  const presentation = transactionPresentation(transaction);
  const quantityText = [TRANSACTION_TYPES.adjust, TRANSACTION_TYPES.initial, TRANSACTION_TYPES.reverse].includes(transaction.type)
    ? `${formatQuantity(transaction.beforeQuantity)} → ${formatQuantity(transaction.afterQuantity)}`
    : `${presentation.sign}${formatQuantity(transaction.amount)}`;
  const reversedBadge = transaction.reversalTransactionId ? '<span class="badge badge-warning">Đã đảo</span>' : "";
  const reversalLink = transaction.reversalOf ? '<span class="badge badge-purple">Bản ghi đảo</span>' : "";
  return `<button class="list-row list-row-button transaction-row ${transaction.reversalTransactionId ? "transaction-row-reversed" : ""}" type="button" data-action="open-transaction-detail" data-transaction-id="${escapeHTML(transaction.id)}">
    <div class="row-main">
      <div class="row-title">${escapeHTML(transaction.productName)}</div>
      <div class="row-sub">${escapeHTML(transaction.actor)} · ${formatDateTime(transaction.createdAt)}${transaction.note ? ` · ${escapeHTML(transaction.note)}` : ""}</div>
    </div>
    <div class="row-copy">
      <div class="row-value transaction-value ${presentation.className}">${quantityText} ${escapeHTML(transaction.unit)}</div>
      <div class="transaction-status"><span class="badge ${presentation.badge}">${escapeHTML(TRANSACTION_LABELS[transaction.type] || transaction.type)}</span>${reversedBadge}${reversalLink}</div>
    </div>
  </button>`;
}

function renderManageScreen() {
  const tabs = [
    [MANAGE_TABS.accounts, "account", "Tài khoản"],
    [MANAGE_TABS.categories, "category", "Danh mục"],
    [MANAGE_TABS.access, "shield", "Phân quyền"],
    [MANAGE_TABS.data, "database", "Dữ liệu"],
  ];
  return `<section class="screen" aria-label="Quản lý ứng dụng">
    <div class="manage-tabs" role="tablist" aria-label="Nhóm cài đặt">
      ${tabs.map(([key, iconName, label]) => `<button class="manage-tab" type="button" role="tab" data-manage-tab="${key}" aria-selected="${appState.manageTab === key}">${icon(iconName)}<span>${escapeHTML(label)}</span></button>`).join("")}
    </div>
    <div role="tabpanel">${renderManagePanel()}</div>
  </section>`;
}

function renderManagePanel() {
  if (appState.manageTab === MANAGE_TABS.categories) return renderCategoriesPanel();
  if (appState.manageTab === MANAGE_TABS.access) return renderAccessPanel();
  if (appState.manageTab === MANAGE_TABS.data) return renderDataPanel();
  return renderAccountsPanel();
}

function renderAccountsPanel() {
  if (!hasPermission(PERMISSIONS.manageAccounts)) return renderAccessDenied("Vai trò hiện tại chưa được quản lý tài khoản.");
  if (appState.loading.accounts && !appState.cache.loaded.accounts) return renderLoadingScreen();
  const audits = appState.cache.accountAudit.slice(0, 5);
  return `<div class="screen">
    <div class="section-head">
      <div class="section-copy"><h2 class="section-title">Tài khoản</h2><p class="section-subtitle">Vai trò, trạng thái và quyền riêng theo từng nhóm vật liệu.</p></div>
      ${canManageAccount() ? `<button class="btn btn-compact btn-primary" type="button" data-action="add-account">${icon("plus")} Tạo</button>` : ""}
    </div>
    <div class="notice ${dataService.mode === "supabase" ? "notice-success" : "notice-warning"}">
      <div class="notice-icon">${icon(dataService.mode === "supabase" ? "shield" : "warning")}</div>
      <div><div class="notice-title">${dataService.mode === "supabase" ? "Tài khoản lưu trên Supabase" : "Tài khoản thử nghiệm trên thiết bị"}</div><div class="notice-text">${dataService.mode === "supabase" ? "Mật khẩu chỉ lưu dạng bcrypt hash; Super Admin quản lý tài khoản ngay trong app." : "Dữ liệu local chỉ dùng kiểm thử giao diện."}</div></div>
    </div>
    <div class="card list-card">
      ${appState.cache.accounts.length ? appState.cache.accounts.map((account) => {
        const status = accountStatus(account);
        const statusClass = status === ACCOUNT_STATUSES.active ? "badge-success" : status === ACCOUNT_STATUSES.locked ? "badge-warning" : "badge-danger";
        const scopeText = account.scopeMode === "custom" ? `${Object.values(account.categoryPermissions || {}).filter((permissions) => permissions.includes(PERMISSIONS.viewInventory)).length} nhóm được cấp` : "Tất cả nhóm theo vai trò";
        return `<button class="list-row list-row-button" type="button" data-action="edit-account" data-account-id="${escapeHTML(account.id)}" ${canManageAccount(account) ? "" : 'aria-disabled="true"'}>
          <div class="row-main"><div class="row-title">${escapeHTML(account.displayName)}</div><div class="row-sub">${escapeHTML(account.username)} · ${escapeHTML(roleLabel(account.role))} · ${escapeHTML(scopeText)}</div></div>
          <div class="row-copy"><span class="badge ${statusClass}">${escapeHTML(accountStatusLabel(account))}</span></div>
        </button>`;
      }).join("") : renderEmptyState("account", "Chưa có tài khoản", "Tạo tài khoản đầu tiên để kiểm thử phân quyền.")}
    </div>
    <div class="section-head"><div class="section-copy"><h2 class="section-title">Nhật ký tài khoản gần đây</h2><p class="section-subtitle">Các thay đổi được giữ riêng để phục vụ đối soát.</p></div></div>
    <div class="card list-card">
      ${audits.length ? audits.map((audit) => `<div class="list-row"><div class="row-main"><div class="row-title">${escapeHTML(audit.targetUsername || "Tài khoản")}</div><div class="row-sub">${escapeHTML(audit.actorName)} · ${escapeHTML(audit.detail || audit.action)}</div></div><div class="row-copy"><div class="row-value row-value-small">${formatDateTime(audit.createdAt)}</div></div></div>`).join("") : renderEmptyState("history", "Chưa có thay đổi", "Nhật ký sẽ xuất hiện khi tạo hoặc sửa tài khoản.")}
    </div>
  </div>`;
}

function renderCategoriesPanel() {
  if (!hasPermission(PERMISSIONS.manageSchema)) return renderAccessDenied("Vai trò hiện tại chưa được quản lý danh mục.");
  const categories = appState.cache.schema.categories;
  return `<div class="screen">
    <div class="section-head">
      <div class="section-copy"><h2 class="section-title">Nhóm và thuộc tính</h2><p class="section-subtitle">Thứ tự hiển thị điều khiển form và tên; khóa chống trùng được giữ độc lập.</p></div>
      <button class="btn btn-compact btn-primary" type="button" data-action="add-category">${icon("plus")} Thêm</button>
    </div>
    <div class="notice">
      <div class="notice-icon">${icon("info")}</div>
      <div><div class="notice-title">Thứ tự hiển thị không đổi khóa chống trùng</div><div class="notice-text">Bạn có thể sắp xếp lại thuộc tính an toàn. Chỉ khi thêm, bỏ hoặc đổi thuộc tính nhận diện mới cần migration chữ ký trong production.</div></div>
    </div>
    <div class="card list-card">
      ${categories.map((category) => `<button class="list-row list-row-button" type="button" data-action="edit-category" data-category-id="${escapeHTML(category.id)}">
        <div class="row-main"><div class="row-title">${escapeHTML(category.icon)} ${escapeHTML(category.name)}</div><div class="row-sub">${category.attributes.filter((item) => item.active !== false).length} thuộc tính · ${escapeHTML(category.units.join(", "))}</div></div>
        <div class="row-copy"><span class="badge ${category.active !== false ? "badge-success" : "badge-danger"}">${category.active !== false ? "Đang dùng" : "Ngừng dùng"}</span></div>
      </button>`).join("")}
    </div>
  </div>`;
}

function renderAccessPanel() {
  const permissions = rolePermissions(appState.currentUser.role);
  const effectivePermissions = permissions.includes("*") ? Object.keys(PERMISSION_META) : permissions;
  const categories = appState.cache.schema.categories.filter((category) => category.active !== false);
  return `<div class="screen">
    <div class="card card-pad">
      <div class="detail-grid">
        <div class="detail-row"><div class="detail-key">Tài khoản đăng nhập</div><div class="detail-value">${escapeHTML(appState.currentUser.username)}</div></div>
        <div class="detail-row"><div class="detail-key">Vai trò</div><div class="detail-value">${escapeHTML(roleLabel(appState.currentUser.role))}</div></div>
      </div>
      <span class="field-help" style="margin-top:10px">Phiên đăng nhập hiện tại được kiểm tra lại theo vai trò, trạng thái và phạm vi nhóm vật liệu.</span>
    </div>
    <div class="section-head"><div class="section-copy"><h2 class="section-title">Quyền theo vai trò</h2><p class="section-subtitle">${effectivePermissions.length} quyền nền · ${escapeHTML(roleLabel(appState.currentUser.role))}.</p></div></div>
    <div class="permission-grid">
      ${Object.entries(PERMISSION_META).map(([permission, [name, description]]) => {
        const allowed = hasBasePermission(appState.currentUser, permission);
        return `<div class="permission-item"><input type="checkbox" ${allowed ? "checked" : ""} disabled aria-label="${escapeHTML(name)}"><div><div class="permission-name">${escapeHTML(name)}</div><div class="permission-desc">${escapeHTML(description)}</div></div></div>`;
      }).join("")}
    </div>
    <div class="section-head"><div class="section-copy"><h2 class="section-title">Phạm vi nhóm vật liệu</h2><p class="section-subtitle">${appState.currentUser.scopeMode === "custom" ? "Quyền tùy chỉnh theo từng nhóm." : "Áp dụng quyền vai trò cho tất cả nhóm."}</p></div></div>
    <div class="scope-summary-grid">
      ${categories.map((category) => {
        const allowed = CATEGORY_SCOPED_PERMISSIONS.filter((permission) => hasPermission(permission, category.id));
        return `<article class="scope-summary-card"><div class="scope-summary-head"><strong>${escapeHTML(category.icon)} ${escapeHTML(category.name)}</strong><span class="badge ${allowed.includes(PERMISSIONS.viewInventory) ? "badge-success" : "badge-danger"}">${allowed.includes(PERMISSIONS.viewInventory) ? "Có quyền" : "Ẩn"}</span></div><div class="scope-chip-list">${allowed.length ? allowed.map((permission) => `<span class="scope-chip">${escapeHTML(PERMISSION_META[permission]?.[0] || permission)}</span>`).join("") : '<span class="permission-desc">Không có quyền trong nhóm này.</span>'}</div></article>`;
      }).join("")}
    </div>
  </div>`;
}

function renderDataPanel() {
  if (!hasPermission(PERMISSIONS.manageData)) return renderAccessDenied("Vai trò hiện tại chưa được quản lý dữ liệu.");

  if (!dataService.capabilities?.localBackup) {
    return `<div class="screen">
      <div class="notice notice-success">
        <div class="notice-icon">${icon("check")}</div>
        <div><div class="notice-title">Dữ liệu đang lưu trên Supabase</div><div class="notice-text">Ứng dụng không cho tải toàn bộ database hoặc phục hồi JSON trực tiếp từ trình duyệt.</div></div>
      </div>
      <div class="card list-card">
        <div class="list-row">
          <div class="row-main"><div class="row-title">Sao lưu database</div><div class="row-sub">Thiết lập backup hoặc Point-in-Time Recovery trong Supabase Dashboard.</div></div><div class="row-actions">${icon("shield")}</div>
        </div>
        <div class="list-row">
          <div class="row-main"><div class="row-title">Khôi phục dữ liệu</div><div class="row-sub">Thực hiện bằng backup của Supabase, không ghi đè từ file JSON trên trình duyệt.</div></div><div class="row-actions">${icon("history")}</div>
        </div>
        <div class="list-row">
          <div class="row-main"><div class="row-title">Tầng dữ liệu</div><div class="row-sub">${escapeHTML(dataService.label)} · RLS và RPC kiểm tra quyền phía server.</div></div><div class="row-actions">${icon("cloud")}</div>
        </div>
        ${normalizeRoleCode(appState.currentUser.role) === "superadmin" ? `<button class="list-row list-row-button" type="button" data-action="open-history-cleanup">
          <div class="row-main"><div class="row-title" style="color:var(--danger)">Xóa lịch sử kho</div><div class="row-sub">Xóa khỏi màn hình theo ngày hoặc toàn bộ. Tồn kho hiện tại không thay đổi và thao tác vẫn được ghi nhật ký quản trị.</div></div><div class="row-actions" style="color:var(--danger)">${icon("trash")}</div>
        </button>` : ""}
      </div>
      <div class="helper-block">File <strong>database.sql</strong> là file cài đặt database cho ứng dụng này.</div>
    </div>`;
  }

  return `<div class="screen">
    <div class="notice notice-warning">
      <div class="notice-icon">${icon("warning")}</div>
      <div><div class="notice-title">Chỉ áp dụng cho dữ liệu thử nghiệm trên thiết bị</div><div class="notice-text">Backup JSON có thể chứa dữ liệu nghiệp vụ và hash mật khẩu demo. Không gửi file cho người không có quyền.</div></div>
    </div>
    <div class="card list-card">
      <button class="list-row list-row-button" type="button" data-action="export-backup">
        <div class="row-main"><div class="row-title">Xuất bản sao lưu JSON</div><div class="row-sub">Tải toàn bộ dữ liệu thử nghiệm trên thiết bị.</div></div><div class="row-actions">${icon("download")}</div>
      </button>
      <button class="list-row list-row-button" type="button" data-action="trigger-import">
        <div class="row-main"><div class="row-title">Phục hồi từ JSON</div><div class="row-sub">Kiểm tra cấu trúc trước khi ghi đè dữ liệu thử nghiệm.</div></div><div class="row-actions">${icon("upload")}</div>
      </button>
      <button class="list-row list-row-button" type="button" data-action="restore-rollback">
        <div class="row-main"><div class="row-title">Khôi phục thao tác ghi đè gần nhất</div><div class="row-sub">Hoán đổi với snapshot trước lần phục hồi hoặc đặt lại gần nhất.</div></div><div class="row-actions">${icon("history")}</div>
      </button>
      <button class="list-row list-row-button" type="button" data-action="reset-demo">
        <div class="row-main"><div class="row-title" style="color:var(--danger)">Đặt lại dữ liệu thử nghiệm</div><div class="row-sub">Khôi phục dữ liệu mẫu ban đầu trên thiết bị này.</div></div><div class="row-actions" style="color:var(--danger)">${icon("trash")}</div>
      </button>
    </div>
    <input id="backup-file-input" type="file" accept="application/json,.json" hidden>
    <div class="helper-block code-like">Adapter hiện tại: ${escapeHTML(dataService.label)} · cache key: ${escapeHTML(STORAGE_KEYS.demoData)}</div>
  </div>`;
}

function renderAccessDenied(message) {
  return `<div class="card">${renderEmptyState("shield", "Không có quyền truy cập", message)}</div>`;
}

function renderEmptyState(iconName, title, text) {
  return `<div class="empty-state"><div class="empty-icon">${icon(iconName)}</div><div class="empty-title">${escapeHTML(title)}</div><div class="empty-text">${escapeHTML(text)}</div></div>`;
}

function openModal({ name, title, subtitle = "", body, footer = "", size = "sheet" }) {
  const root = $("#modal-root");
  if (!root) return;
  appState.ui.modalName = name;
  appState.ui.modalLastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const content = size === "dialog"
    ? `<div class="dialog-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="dialog-body"><h2 id="modal-title" class="sheet-title">${escapeHTML(title)}</h2>${subtitle ? `<p class="sheet-subtitle">${escapeHTML(subtitle)}</p>` : ""}<div style="margin-top:14px">${body}</div></div>${footer ? `<div class="dialog-actions">${footer}</div>` : ""}</div>`
    : `<section class="sheet" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div><div class="sheet-handle" aria-hidden="true"></div><header class="sheet-head"><div><h2 id="modal-title" class="sheet-title">${escapeHTML(title)}</h2>${subtitle ? `<p class="sheet-subtitle">${escapeHTML(subtitle)}</p>` : ""}</div><button class="icon-btn" type="button" data-action="close-modal" aria-label="Đóng">${icon("close")}</button></header></div><div class="sheet-body">${body}</div>${footer ? `<footer class="sheet-footer">${footer}</footer>` : ""}</section>`;
  root.innerHTML = `<div class="modal-layer" data-modal-backdrop="true">${content}</div>`;
  document.body.style.overflow = "hidden";
  window.setTimeout(() => {
    const focusTarget = $("[autofocus], .sheet-body input:not([type='hidden']):not(:disabled), .sheet-body select:not(:disabled), .sheet-body textarea:not(:disabled), .dialog-body button:not(:disabled), .sheet-head button:not(:disabled)", root);
    focusTarget?.focus();
  }, 20);
}

function closeModal(force = false) {
  if (appState.ui.modalBusy && !force) {
    showToast("info", "Đang xử lý", "Hãy đợi thao tác hiện tại hoàn tất.");
    return;
  }
  const root = $("#modal-root");
  if (root) root.innerHTML = "";
  document.body.style.overflow = "";
  appState.ui.modalName = null;
  appState.ui.categoryDraft = null;
  if (appState.ui.confirmCallbackId) {
    confirmCallbacks.delete(appState.ui.confirmCallbackId);
    appState.ui.confirmCallbackId = null;
  }
  const lastFocus = appState.ui.modalLastFocus;
  appState.ui.modalLastFocus = null;
  if (lastFocus?.isConnected) lastFocus.focus();
}

function openConfirm({ title, message, confirmLabel = "Xác nhận", danger = false, onConfirm }) {
  const callbackId = makeId("confirm");
  confirmCallbacks.set(callbackId, onConfirm);
  appState.ui.confirmCallbackId = callbackId;
  openModal({
    name: "confirm",
    title,
    size: "dialog",
    body: `<p style="color:var(--sub)">${escapeHTML(message)}</p>`,
    footer: `<button class="btn btn-secondary" type="button" data-action="close-modal">Hủy</button><button class="btn ${danger ? "btn-danger" : "btn-primary"}" type="button" data-action="confirm-callback" data-callback-id="${callbackId}">${escapeHTML(confirmLabel)}</button>`,
  });
}

const confirmCallbacks = new Map();

function openHistoryCleanupModal() {
  if (normalizeRoleCode(appState.currentUser?.role) !== "superadmin" || !hasPermission(PERMISSIONS.manageData)) {
    showToast("error", "Không có quyền", "Chỉ Super Admin được xóa lịch sử kho.");
    return;
  }
  const today = formatISODate(new Date());
  openModal({
    name: "history-cleanup",
    title: "Xóa lịch sử kho",
    subtitle: "Lịch sử sẽ biến mất khỏi ứng dụng; tồn kho hiện tại và nhật ký quản trị vẫn được giữ.",
    body: `<form id="history-cleanup-form" class="field-grid" novalidate>
      <div class="notice notice-warning"><div class="notice-icon">${icon("warning")}</div><div><div class="notice-title">Không dùng để sửa tồn kho</div><div class="notice-text">Giao dịch sai nên dùng Đảo giao dịch. Xóa lịch sử chỉ dùng để dọn dữ liệu hiển thị.</div></div></div>
      <label class="field" for="history-cleanup-scope"><span class="field-label">Phạm vi xóa</span><select id="history-cleanup-scope" name="scope" class="select"><option value="before">Đến hết một ngày</option><option value="all">Toàn bộ lịch sử</option></select></label>
      <label class="field" id="history-cleanup-date-field" for="history-cleanup-before"><span class="field-label">Xóa đến hết ngày</span><input id="history-cleanup-before" name="before" class="input" type="date" value="${escapeHTML(today)}"></label>
      <label class="field" for="history-cleanup-reason"><span class="field-label">Lý do</span><textarea id="history-cleanup-reason" name="reason" class="textarea" rows="3" required placeholder="Ví dụ: Dọn dữ liệu thử nghiệm trước khi sử dụng chính thức"></textarea></label>
      <label class="field" for="history-cleanup-confirmation"><span class="field-label">Nhập XOA LICH SU để xác nhận</span><input id="history-cleanup-confirmation" name="confirmation" class="input" type="text" autocapitalize="characters" autocomplete="off" required></label>
    </form>`,
    footer: `<button class="btn btn-secondary" type="button" data-action="close-modal">Hủy</button><button class="btn btn-danger" type="submit" form="history-cleanup-form">Xóa lịch sử</button>`,
  });
}

function updateHistoryCleanupFields() {
  const form = $("#history-cleanup-form");
  if (!form) return;
  const deleteAll = $("#history-cleanup-scope", form)?.value === "all";
  const dateField = $("#history-cleanup-date-field", form);
  const dateInput = $("#history-cleanup-before", form);
  if (dateField) dateField.hidden = deleteAll;
  if (dateInput) dateInput.required = !deleteAll;
}

function openProfileModal() {
  const permissions = rolePermissions(appState.currentUser.role);
  openModal({
    name: "profile",
    title: appState.currentUser.displayName,
    subtitle: roleLabel(appState.currentUser.role),
    body: `<div class="detail-grid">
      <div class="detail-row"><div class="detail-key">Tên đăng nhập</div><div class="detail-value">${escapeHTML(appState.currentUser.username)}</div></div>
      <div class="detail-row"><div class="detail-key">Phiên bản</div><div class="detail-value">${escapeHTML(APP_VERSION)}</div></div>
      <div class="detail-row"><div class="detail-key">Tầng dữ liệu</div><div class="detail-value">${escapeHTML(dataService.label)}</div></div>
      <div class="detail-row"><div class="detail-key">Quyền nền</div><div class="detail-value">${permissions.includes("*") ? "Toàn bộ" : permissions.length}</div></div>
      <div class="detail-row"><div class="detail-key">Phạm vi</div><div class="detail-value">${appState.currentUser.scopeMode === "custom" ? "Theo từng nhóm" : "Tất cả nhóm"}</div></div>
      <div class="detail-row"><div class="detail-key">Trạng thái</div><div class="detail-value"><span class="badge badge-success">Đã đăng nhập</span></div></div>
    </div>
    ${dataService.mode === "local"
      ? `<div class="notice notice-warning" style="margin-top:14px"><div class="notice-icon">${icon("warning")}</div><div><div class="notice-title">Dữ liệu chỉ nằm trên thiết bị</div><div class="notice-text">Chế độ local chỉ dùng xem thử; dữ liệu không đồng bộ giữa các thiết bị.</div></div></div>`
      : `<div class="notice notice-success" style="margin-top:14px"><div class="notice-icon">${icon("check")}</div><div><div class="notice-title">Đang dùng dữ liệu cloud</div><div class="notice-text">Quyền và giao dịch được kiểm tra lại tại Supabase.</div></div></div>`}`,
    footer: `<button class="btn btn-danger" type="button" data-action="logout">Đăng xuất</button><button class="btn btn-secondary" type="button" data-action="close-modal">Đóng</button>`,
  });
}

function openProductDetail(productId) {
  const product = productById(productId);
  if (!product) return showToast("error", "Không tìm thấy vật liệu");
  if (!hasPermission(PERMISSIONS.viewDetail, product.categoryId)) {
    showToast("error", "Không có quyền", "Tài khoản hiện tại không được xem chi tiết vật liệu trong nhóm này.");
    return;
  }
  const category = categoryById(product.categoryId);
  const status = hasPermission(PERMISSIONS.viewQuantity, product.categoryId) ? productStatus(product) : null;
  const attributeRows = orderedCategoryAttributes(category).map((attribute) => `<div class="detail-row"><div class="detail-key">${escapeHTML(attribute.name)}</div><div class="detail-value">${escapeHTML(attributeDisplayValue(attribute, product.attributes[attribute.id]))}</div></div>`).join("");
  const quantityRows = hasPermission(PERMISSIONS.viewQuantity, product.categoryId)
    ? `<div class="detail-row"><div class="detail-key">Tồn hiện tại</div><div class="detail-value">${formatQuantity(product.quantity)} ${escapeHTML(product.unit)}</div></div><div class="detail-row"><div class="detail-key">Cảnh báo</div><div class="detail-value">${formatQuantity(product.warningLevel)} ${escapeHTML(product.unit)}</div></div>`
    : `<div class="detail-row"><div class="detail-key">Tồn kho</div><div class="detail-value">Đã ẩn theo quyền</div></div>`;
  const actions = [
    canCreateAnyInventoryTransaction(product.categoryId) ? `<button class="btn btn-primary" type="button" data-action="open-transaction" data-product-id="${escapeHTML(product.id)}">Giao dịch</button>` : "",
    hasPermission(PERMISSIONS.editProduct, product.categoryId) ? `<button class="btn btn-secondary" type="button" data-action="edit-product" data-product-id="${escapeHTML(product.id)}">Sửa</button>` : "",
  ].filter(Boolean).join("");

  openModal({
    name: "product-detail",
    title: product.name,
    subtitle: `${category?.name || "Chưa phân nhóm"}${status ? ` · ${status.label}` : ""}`,
    body: `<div class="detail-grid">${quantityRows}<div class="detail-row"><div class="detail-key">Đơn vị</div><div class="detail-value">${escapeHTML(product.unit)}</div></div>${attributeRows}<div class="detail-row"><div class="detail-key">Ghi chú</div><div class="detail-value">${escapeHTML(product.note || "—")}</div></div><div class="detail-row"><div class="detail-key">Cập nhật</div><div class="detail-value">${formatDateTime(product.updatedAt)}</div></div></div>
      ${hasPermission(PERMISSIONS.archiveProduct, product.categoryId) ? `<button class="btn btn-danger-soft btn-block" style="margin-top:14px" type="button" data-action="archive-product" data-product-id="${escapeHTML(product.id)}">${icon("archive")} Lưu trữ vật liệu</button>` : ""}`,
    footer: actions ? `<button class="btn btn-secondary" type="button" data-action="close-modal">Đóng</button><div class="inline-actions">${actions}</div>` : `<button class="btn btn-secondary btn-block" type="button" data-action="close-modal">Đóng</button>`,
  });
}

function productFormBody(product = null, categoryId = null) {
  const categories = product ? appState.cache.schema.categories.filter((category) => category.id === product.categoryId && hasPermission(PERMISSIONS.editProduct, category.id)) : categoriesWithPermission(PERMISSIONS.addProduct);
  const selectedCategory = categoryById(categoryId || product?.categoryId || categories[0]?.id);
  if (!selectedCategory) return renderEmptyState("warning", "Chưa có nhóm vật liệu", "Hãy tạo nhóm trước khi thêm vật liệu.");
  const attributes = product?.attributes || {};
  const generatedName = product?.name || buildProductName(selectedCategory, attributes);
  return `<form id="product-form" class="field-grid" novalidate>
    <input type="hidden" name="id" value="${escapeHTML(product?.id || "")}">
    <input type="hidden" name="expectedRevision" value="${escapeHTML(product?.revision ?? "")}">
    <label class="field" for="product-category"><span class="field-label">Nhóm vật liệu</span><select id="product-category" name="categoryId" class="select" ${product ? "disabled" : ""}>
      ${categories.map((category) => `<option value="${escapeHTML(category.id)}" ${category.id === selectedCategory.id ? "selected" : ""}>${escapeHTML(category.icon)} ${escapeHTML(category.name)}</option>`).join("")}
    </select>${product ? `<input type="hidden" name="categoryId" value="${escapeHTML(selectedCategory.id)}">` : ""}</label>

    <div id="product-attribute-fields" class="field-grid">
      ${orderedCategoryAttributes(selectedCategory).map((attribute) => renderProductAttributeField(attribute, attributes[attribute.id])).join("")}
    </div>

    <label class="field" for="product-custom-name"><span class="field-label">Tên hiển thị tùy chỉnh</span><input id="product-custom-name" name="customName" class="input" type="text" autocomplete="off" value="${escapeHTML(product?.customName || "")}" placeholder="Để trống để tạo tên tự động"><span class="field-help">Tên tự động dự kiến theo thứ tự thuộc tính: <strong id="generated-product-name">${escapeHTML(generatedName)}</strong></span></label>

    <div class="field-grid two">
      <label class="field" for="product-unit"><span class="field-label">Đơn vị</span><select id="product-unit" name="unit" class="select">${selectedCategory.units.map((unit) => `<option value="${escapeHTML(unit)}" ${unit === (product?.unit || selectedCategory.defaultUnit) ? "selected" : ""}>${escapeHTML(unit)}</option>`).join("")}</select></label>
      <label class="field" for="product-warning"><span class="field-label">Mức cảnh báo</span><input id="product-warning" name="warningLevel" class="input" type="number" inputmode="decimal" min="0" step="any" value="${escapeHTML(product?.warningLevel ?? selectedCategory.warningDefault)}"></label>
    </div>

    ${product ? "" : `<label class="field" for="product-initial-stock"><span class="field-label">Tồn khởi tạo</span><input id="product-initial-stock" name="initialStock" class="input" type="number" inputmode="decimal" min="0" step="any" value="0"><span class="field-help">Tạo cùng giao dịch khởi tạo. Production sẽ thực hiện trong một transaction database.</span></label>`}

    <label class="field" for="product-note"><span class="field-label">Ghi chú</span><textarea id="product-note" name="note" class="textarea" rows="3" placeholder="Thông tin cần lưu ý">${escapeHTML(product?.note || "")}</textarea></label>
  </form>`;
}

function renderProductAttributeField(attribute, value = "") {
  const required = attribute.required ? "required" : "";
  const label = `${escapeHTML(attribute.name)}${attribute.required ? " *" : ""}`;
  if (attribute.type === "select") {
    return `<label class="field" for="attr-${escapeHTML(attribute.id)}"><span class="field-label">${label}</span><select id="attr-${escapeHTML(attribute.id)}" name="attr:${escapeHTML(attribute.id)}" class="select" ${required}><option value="">Chọn ${escapeHTML(attribute.name.toLowerCase())}</option>${attribute.options.map((option) => `<option value="${escapeHTML(option)}" ${String(value) === String(option) ? "selected" : ""}>${escapeHTML(option)}</option>`).join("")}</select></label>`;
  }
  return `<label class="field" for="attr-${escapeHTML(attribute.id)}"><span class="field-label">${label}</span><input id="attr-${escapeHTML(attribute.id)}" name="attr:${escapeHTML(attribute.id)}" class="input" type="${attribute.type === "number" ? "number" : "text"}" ${attribute.type === "number" ? 'inputmode="decimal" min="0" step="any"' : 'autocomplete="off"'} value="${escapeHTML(value)}" ${required}><span class="field-help">${attribute.unit ? `Đơn vị thuộc tính: ${escapeHTML(attribute.unit)}.` : attribute.identity ? "Thuộc tính tham gia chống trùng." : ""}</span></label>`;
}

function openProductForm(productId = null) {
  const product = productId ? productById(productId) : null;
  if (product && !hasPermission(PERMISSIONS.editProduct, product.categoryId)) return showToast("error", "Không có quyền sửa vật liệu");
  if (!product && !categoriesWithPermission(PERMISSIONS.addProduct).length) return showToast("error", "Không có quyền thêm vật liệu");
  closeModal(true);
  openModal({
    name: "product-form",
    title: product ? "Sửa vật liệu" : "Thêm vật liệu",
    subtitle: product ? "Số tồn chỉ thay đổi bằng giao dịch kho." : "Khóa chống trùng được tạo từ thuộc tính nhận diện.",
    body: productFormBody(product),
    footer: `<button class="btn btn-secondary" type="button" data-action="close-modal">Hủy</button><button class="btn btn-primary" type="submit" form="product-form">${product ? "Lưu thay đổi" : "Tạo vật liệu"}</button>`,
  });
}

function refreshProductFormForCategory(categoryId) {
  const form = $("#product-form");
  if (!form) return;
  const existingValues = Object.fromEntries(new FormData(form).entries());
  const body = productFormBody(null, categoryId);
  const sheetBody = $("#modal-root .sheet-body");
  if (!sheetBody) return;
  sheetBody.innerHTML = body;
  setValue("#product-custom-name", existingValues.customName || "", sheetBody);
  setValue("#product-note", existingValues.note || "", sheetBody);
  updateGeneratedProductName();
}

function updateGeneratedProductName() {
  const form = $("#product-form");
  if (!form) return;
  const formData = new FormData(form);
  const category = categoryById(formData.get("categoryId"));
  if (!category) return;
  const attributes = {};
  for (const attribute of orderedCategoryAttributes(category)) {
    attributes[attribute.id] = formData.get(`attr:${attribute.id}`) ?? "";
  }
  setText("#generated-product-name", buildProductName(category, attributes), form);
}

function transactionTypeOptionsForCategory(categoryId) {
  return [
    hasPermission(PERMISSIONS.importInventory, categoryId) ? [TRANSACTION_TYPES.import, "Nhập kho"] : null,
    hasPermission(PERMISSIONS.exportInventory, categoryId) ? [TRANSACTION_TYPES.export, "Xuất kho"] : null,
    hasPermission(PERMISSIONS.countInventory, categoryId) ? [TRANSACTION_TYPES.adjust, "Kiểm kê"] : null,
  ].filter(Boolean);
}

function renderTransactionTypeButtons(categoryId, selectedType = "") {
  const options = transactionTypeOptionsForCategory(categoryId);
  const effectiveType = options.some(([type]) => type === selectedType) ? selectedType : options[0]?.[0] || "";
  return options.map(([type, label]) => `<button class="segmented-item" type="button" data-action="select-transaction-type" data-type="${type}" aria-pressed="${type === effectiveType}">${label}</button>`).join("");
}

function transactionFormBody(productId = null) {
  const products = appState.cache.products.filter((product) => !product.archived && canCreateAnyInventoryTransaction(product.categoryId));
  const selected = products.find((product) => product.id === productId) || products[0];
  if (!selected) return renderEmptyState("inventory", "Chưa có vật liệu", "Vai trò hiện tại chưa có vật liệu nào được phép giao dịch.");
  const allowedTypes = transactionTypeOptionsForCategory(selected.categoryId);
  const firstType = allowedTypes[0]?.[0] || "";
  return `<form id="transaction-form" class="field-grid" novalidate>
    <input type="hidden" name="requestKey" value="${escapeHTML(makeId("request"))}">
    <label class="field" for="transaction-product"><span class="field-label">Vật liệu</span><select id="transaction-product" name="productId" class="select">${products.map((product) => `<option value="${escapeHTML(product.id)}" ${product.id === selected.id ? "selected" : ""}>${escapeHTML(product.name)}</option>`).join("")}</select></label>
    <fieldset class="field"><legend class="field-label">Loại giao dịch</legend><div id="transaction-type-buttons" class="segmented" role="group">${renderTransactionTypeButtons(selected.categoryId, firstType)}</div><input id="transaction-type" type="hidden" name="type" value="${firstType}"></fieldset>
    <label class="field" for="transaction-amount"><span id="transaction-amount-label" class="field-label">${firstType === TRANSACTION_TYPES.adjust ? "Tồn thực tế" : "Số lượng"}</span><input id="transaction-amount" name="amount" class="input" type="number" inputmode="decimal" min="0" max="${MAX_QUANTITY}" step="any" required value=""><span id="transaction-unit-help" class="field-help">Đơn vị: ${escapeHTML(selected.unit)}</span></label>
    <div id="transaction-preview" class="helper-block">Tồn hiện tại: ${formatQuantity(selected.quantity)} ${escapeHTML(selected.unit)}</div>
    <label class="field" for="transaction-note"><span class="field-label">Lý do / ghi chú</span><textarea id="transaction-note" name="note" class="textarea" rows="3" placeholder="${firstType === TRANSACTION_TYPES.export ? "Bắt buộc khi xuất kho" : firstType === TRANSACTION_TYPES.adjust ? "Bắt buộc khi kiểm kê" : "Nguồn nhập hoặc thông tin liên quan"}"></textarea><span id="transaction-note-help" class="field-help">${firstType === TRANSACTION_TYPES.import ? "Không bắt buộc, nhưng nên ghi nguồn nhập." : "Bắt buộc để bảo đảm lịch sử có thể đối soát."}</span></label>
    <div class="notice notice-warning"><div class="notice-icon">${icon("warning")}</div><div><div class="notice-title">Lịch sử không được sửa hoặc xóa</div><div class="notice-text">Nếu nhập sai, quản lý chỉ được đảo giao dịch mới nhất của vật liệu trong phạm vi được cấp.</div></div></div>
  </form>`;
}

function openTransactionModal(productId = null) {
  if (!canCreateAnyInventoryTransaction()) return showToast("error", "Không có quyền giao dịch");
  closeModal(true);
  openModal({
    name: "transaction-form",
    title: "Giao dịch kho",
    subtitle: "Mỗi lần gửi chỉ tạo đúng một giao dịch.",
    body: transactionFormBody(productId),
    footer: `<button class="btn btn-secondary" type="button" data-action="close-modal">Hủy</button><button class="btn btn-primary" type="submit" form="transaction-form">Lưu giao dịch</button>`,
  });
}

function updateTransactionPreview() {
  const form = $("#transaction-form");
  if (!form) return;
  const formData = new FormData(form);
  const product = productById(formData.get("productId"));
  if (!product) return;
  let type = formData.get("type");
  const typeOptions = transactionTypeOptionsForCategory(product.categoryId);
  if (!typeOptions.some(([value]) => value === type)) {
    type = typeOptions[0]?.[0] || "";
    setValue("#transaction-type", type, form);
  }
  const typeButtons = $("#transaction-type-buttons", form);
  if (typeButtons) typeButtons.innerHTML = renderTransactionTypeButtons(product.categoryId, type);
  const amount = normalizeQuantity(formData.get("amount"), 0);
  let after = normalizeQuantity(product.quantity, 0);
  if (type === TRANSACTION_TYPES.import) after = normalizeQuantity(after + amount, 0);
  if (type === TRANSACTION_TYPES.export) after = normalizeQuantity(after - amount, 0);
  if (type === TRANSACTION_TYPES.adjust) after = amount;
  setText("#transaction-amount-label", type === TRANSACTION_TYPES.adjust ? "Tồn thực tế" : "Số lượng", form);
  setText("#transaction-unit-help", `Đơn vị: ${product.unit}`, form);
  const note = $("#transaction-note", form);
  if (note) note.placeholder = type === TRANSACTION_TYPES.export ? "Bắt buộc khi xuất kho" : type === TRANSACTION_TYPES.adjust ? "Bắt buộc khi kiểm kê" : "Nguồn nhập hoặc thông tin liên quan";
  setText("#transaction-note-help", type === TRANSACTION_TYPES.import ? "Không bắt buộc, nhưng nên ghi nguồn nhập." : "Bắt buộc để bảo đảm lịch sử có thể đối soát.", form);
  const preview = $("#transaction-preview", form);
  if (preview) {
    const invalid = after < 0 || after > MAX_QUANTITY;
    preview.classList.toggle("helper-danger", invalid);
    preview.innerHTML = invalid
      ? `Tồn hiện tại: <strong>${formatQuantity(product.quantity)} ${escapeHTML(product.unit)}</strong> · <strong>Không thể tạo tồn ${formatQuantity(after)} ${escapeHTML(product.unit)}</strong>`
      : `Tồn hiện tại: <strong>${formatQuantity(product.quantity)} ${escapeHTML(product.unit)}</strong> · Sau giao dịch: <strong>${formatQuantity(after)} ${escapeHTML(product.unit)}</strong>`;
  }
}

function canReverseTransactionRecord(transaction) {
  if (!transaction || !hasPermission(PERMISSIONS.reverseTransaction, transaction.categoryId)) return false;
  if ([TRANSACTION_TYPES.initial, TRANSACTION_TYPES.reverse].includes(transaction.type)) return false;
  if (transaction.reversalTransactionId || transaction.reversedAt) return false;
  const latest = latestTransactionForProduct(transaction.productId);
  const product = productById(transaction.productId);
  return Boolean(latest?.id === transaction.id && product && quantitiesEqual(product.quantity, transaction.afterQuantity));
}

function transactionSnapshotRows(transaction) {
  const snapshot = transaction.productSnapshot;
  if (!snapshot?.attributes?.length) return "";
  return snapshot.attributes.map((attribute) => `<div class="detail-row"><div class="detail-key">${escapeHTML(attribute.name)}</div><div class="detail-value">${escapeHTML(`${attribute.value ?? ""}${attribute.unit ? ` ${attribute.unit}` : ""}` || "—")}</div></div>`).join("");
}

function openTransactionDetail(transactionId) {
  const transaction = transactionById(transactionId);
  if (!transaction || !hasPermission(PERMISSIONS.viewHistory, transaction.categoryId)) return showToast("error", "Không có quyền xem lịch sử nhóm này");
  if (!transaction) return showToast("error", "Không tìm thấy giao dịch");
  const delta = normalizeQuantity(transaction.afterQuantity - transaction.beforeQuantity, 0);
  const statusNotice = transaction.reversalTransactionId
    ? `<div class="notice notice-warning" style="margin-top:14px"><div class="notice-icon">${icon("warning")}</div><div><div class="notice-title">Giao dịch đã được đảo</div><div class="notice-text">${escapeHTML(transaction.reversedBy || "Người có quyền")} đã tạo bản ghi đảo lúc ${formatDateTime(transaction.reversedAt)}.</div></div></div>`
    : transaction.reversalOf
      ? `<div class="notice notice-warning" style="margin-top:14px"><div class="notice-icon">${icon("history")}</div><div><div class="notice-title">Đây là giao dịch đảo</div><div class="notice-text">Bản ghi này khôi phục tồn trước giao dịch ${escapeHTML(transaction.reversalOf)}.</div></div></div>`
      : "";
  const reverseButton = canReverseTransactionRecord(transaction)
    ? `<button class="btn btn-danger" type="button" data-action="open-reverse-transaction" data-transaction-id="${escapeHTML(transaction.id)}">Đảo giao dịch</button>`
    : "";
  openModal({
    name: "transaction-detail",
    title: TRANSACTION_LABELS[transaction.type] || "Chi tiết giao dịch",
    subtitle: `${transaction.productName} · ${formatDateTime(transaction.createdAt)}`,
    body: `<div class="detail-grid">
      <div class="detail-row"><div class="detail-key">Người thực hiện</div><div class="detail-value">${escapeHTML(transaction.actor)}</div></div>
      <div class="detail-row"><div class="detail-key">Tồn trước</div><div class="detail-value">${formatQuantity(transaction.beforeQuantity)} ${escapeHTML(transaction.unit)}</div></div>
      <div class="detail-row"><div class="detail-key">Tồn sau</div><div class="detail-value">${formatQuantity(transaction.afterQuantity)} ${escapeHTML(transaction.unit)}</div></div>
      <div class="detail-row"><div class="detail-key">Chênh lệch</div><div class="detail-value">${delta > 0 ? "+" : ""}${formatQuantity(delta)} ${escapeHTML(transaction.unit)}</div></div>
      <div class="detail-row"><div class="detail-key">Lý do / ghi chú</div><div class="detail-value">${escapeHTML(transaction.note || "—")}</div></div>
      <div class="detail-row"><div class="detail-key">Nhóm lúc giao dịch</div><div class="detail-value">${escapeHTML(transaction.productSnapshot?.categoryName || transaction.categoryId || "—")}</div></div>
      ${transactionSnapshotRows(transaction)}
      <div class="detail-row"><div class="detail-key">Mã giao dịch</div><div class="detail-value code-like">${escapeHTML(transaction.id)}</div></div>
    </div>${statusNotice}`,
    footer: `<button class="btn btn-secondary" type="button" data-action="close-modal">Đóng</button>${reverseButton}`,
  });
}

function openReverseTransactionModal(transactionId) {
  const transaction = transactionById(transactionId);
  if (!canReverseTransactionRecord(transaction)) return showToast("error", "Không thể đảo giao dịch", "Chỉ giao dịch mới nhất, chưa bị đảo và còn khớp tồn hiện tại mới được phép đảo.");
  closeModal(true);
  openModal({
    name: "reverse-transaction-form",
    title: "Đảo giao dịch",
    subtitle: `${transaction.productName} · ${TRANSACTION_LABELS[transaction.type]}`,
    body: `<form id="reverse-transaction-form" class="field-grid" novalidate>
      <input type="hidden" name="transactionId" value="${escapeHTML(transaction.id)}">
      <input type="hidden" name="requestKey" value="${escapeHTML(makeId("reverse-request"))}">
      <div class="notice notice-danger"><div class="notice-icon">${icon("warning")}</div><div><div class="notice-title">Không xóa lịch sử</div><div class="notice-text">Hệ thống sẽ tạo một giao dịch mới để đưa tồn từ ${formatQuantity(transaction.afterQuantity)} về ${formatQuantity(transaction.beforeQuantity)} ${escapeHTML(transaction.unit)}.</div></div></div>
      <label class="field" for="reverse-reason"><span class="field-label">Lý do đảo giao dịch *</span><textarea id="reverse-reason" name="reason" class="textarea" rows="4" required autofocus placeholder="Ví dụ: Nhập nhầm số lượng hoặc chọn nhầm vật liệu"></textarea></label>
    </form>`,
    footer: `<button class="btn btn-secondary" type="button" data-action="close-modal">Hủy</button><button class="btn btn-danger" type="submit" form="reverse-transaction-form">Xác nhận đảo</button>`,
  });
}

function accountFormBody(account = null) {
  const roles = assignableRoles(account);
  const model = account || { role: roles[0] || "viewer", status: ACCOUNT_STATUSES.active, scopeMode: "all", categoryPermissions: {} };
  const basePermissions = rolePermissions(model.role);
  const allowedScoped = new Set(basePermissions.includes("*") ? CATEGORY_SCOPED_PERMISSIONS : basePermissions.filter((permission) => isCategoryScopedPermission(permission)));
  const normalizedPermissions = normalizeCategoryPermissions(model);
  const canChangeStatus = Boolean(account && hasPermission(PERMISSIONS.lockAccounts) && account.id !== appState.currentUser.id);
  const passwordFields = account ? "" : `<div class="field-grid two">
    <label class="field" for="account-password"><span class="field-label">Mật khẩu</span><input id="account-password" name="password" class="input" type="password" autocomplete="new-password" minlength="8" required><span class="field-help">Tối thiểu 8 ký tự, có chữ và số.</span></label>
    <label class="field" for="account-password-confirm"><span class="field-label">Xác nhận mật khẩu</span><input id="account-password-confirm" name="passwordConfirm" class="input" type="password" autocomplete="new-password" minlength="8" required></label>
  </div>`;
  return `<form id="account-form" class="field-grid" novalidate>
    <input type="hidden" name="id" value="${escapeHTML(account?.id || "")}">
    <input type="hidden" name="expectedRevision" value="${escapeHTML(account?.revision ?? "")}">
    <label class="field" for="account-display-name"><span class="field-label">Tên hiển thị</span><input id="account-display-name" name="displayName" class="input" type="text" autocomplete="name" required value="${escapeHTML(account?.displayName || "")}"></label>
    <label class="field" for="account-username"><span class="field-label">Tên đăng nhập</span><input id="account-username" name="username" class="input" type="text" autocapitalize="none" autocomplete="username" required ${account ? "readonly" : ""} value="${escapeHTML(account?.username || "")}"><span class="field-help">Không cần email thật. Tên đăng nhập không đổi sau khi tạo.</span></label>
    ${passwordFields}
    <div class="field-grid two">
      <label class="field" for="account-role"><span class="field-label">Vai trò</span><select id="account-role" name="role" class="select">${roles.map((role) => `<option value="${role}" ${role === model.role ? "selected" : ""}>${escapeHTML(roleLabel(role))}</option>`).join("")}</select></label>
      <label class="field" for="account-status"><span class="field-label">Trạng thái</span>${canChangeStatus ? "" : `<input type="hidden" name="status" value="${escapeHTML(accountStatus(model))}">`}<select id="account-status" ${canChangeStatus ? 'name="status"' : ""} class="select" ${canChangeStatus ? "" : "disabled"}>${Object.entries(ACCOUNT_STATUS_LABELS).map(([value, label]) => `<option value="${value}" ${value === accountStatus(model) ? "selected" : ""}>${escapeHTML(label)}</option>`).join("")}</select>${!canChangeStatus ? '<span class="field-help">Không thể tự khóa tài khoản đang đăng nhập.</span>' : ""}</label>
    </div>
    <label class="field" for="account-scope-mode"><span class="field-label">Phạm vi nhóm vật liệu</span><select id="account-scope-mode" name="scopeMode" class="select"><option value="all" ${model.scopeMode !== "custom" ? "selected" : ""}>Tất cả nhóm theo vai trò</option><option value="custom" ${model.scopeMode === "custom" ? "selected" : ""}>Tùy chỉnh theo từng nhóm</option></select><span class="field-help">Quyền quản trị hệ thống vẫn theo vai trò. Quyền thao tác cần kèm Xem kho; quyền giao dịch cần kèm Xem số lượng; Đảo giao dịch cần kèm Xem lịch sử.</span></label>
    <div id="account-category-permissions" class="account-scope-editor">
      ${appState.cache.schema.categories.filter((category) => category.active !== false).map((category) => `<fieldset class="scope-permission-card" data-account-category="${escapeHTML(category.id)}"><legend>${escapeHTML(category.icon)} ${escapeHTML(category.name)}</legend><div class="scope-permission-grid">${CATEGORY_SCOPED_PERMISSIONS.map((permission) => {
        const checked = model.scopeMode === "custom" ? normalizedPermissions[category.id]?.includes(permission) : allowedScoped.has(permission);
        const [name] = PERMISSION_META[permission] || [permission];
        return `<label class="scope-permission-item"><input type="checkbox" data-account-scope-permission data-category-id="${escapeHTML(category.id)}" data-permission="${escapeHTML(permission)}" ${checked ? "checked" : ""} ${allowedScoped.has(permission) && model.scopeMode === "custom" ? "" : "disabled"}><span>${escapeHTML(name)}</span></label>`;
      }).join("")}</div></fieldset>`).join("")}
    </div>
    <div class="notice"><div class="notice-icon">${icon("info")}</div><div><div class="notice-title">Không bắt buộc đổi mật khẩu lần đầu</div><div class="notice-text">Tài khoản mới đăng nhập và sử dụng ngay theo quyền được cấp. Super Admin có thể đặt mật khẩu mới khi cần.</div></div></div>
  </form>`;
}

function openPasswordResetForm(accountId) {
  const account = appState.cache.accounts.find((item) => item.id === accountId);
  if (!account || !canManageAccount(account) || !hasPermission(PERMISSIONS.resetAccountPassword)) return showToast("error", "Không có quyền đặt lại mật khẩu");
  openModal({
    name: "password-reset-form",
    title: "Đặt mật khẩu mới",
    subtitle: `${account.displayName} · ${account.username}`,
    body: `<form id="password-reset-form" class="field-grid" novalidate>
      <input type="hidden" name="accountId" value="${escapeHTML(account.id)}">
      <label class="field" for="reset-password"><span class="field-label">Mật khẩu mới</span><input id="reset-password" name="password" class="input" type="password" autocomplete="new-password" minlength="8" required autofocus><span class="field-help">Tối thiểu 8 ký tự, có chữ và số.</span></label>
      <label class="field" for="reset-password-confirm"><span class="field-label">Xác nhận mật khẩu</span><input id="reset-password-confirm" name="passwordConfirm" class="input" type="password" autocomplete="new-password" minlength="8" required></label>
      <div class="notice notice-warning"><div class="notice-icon">${icon("warning")}</div><div><div class="notice-title">Có hiệu lực ngay</div><div class="notice-text">Tài khoản không bị bắt buộc đổi lại mật khẩu ở lần đăng nhập sau.</div></div></div>
    </form>`,
    footer: `<button class="btn btn-secondary" type="button" data-action="close-modal">Hủy</button><button class="btn btn-primary" type="submit" form="password-reset-form">Lưu mật khẩu</button>`,
  });
}

function updateAccountPermissionEditor() {
  const form = $("#account-form");
  if (!form) return;
  const role = $("#account-role", form)?.value || "viewer";
  const scopeMode = $("#account-scope-mode", form)?.value || "all";
  const permissions = rolePermissions(role);
  const allowed = new Set(permissions.includes("*") ? CATEGORY_SCOPED_PERMISSIONS : permissions.filter((permission) => isCategoryScopedPermission(permission)));
  $$('[data-account-scope-permission]', form).forEach((checkbox) => {
    const isAllowed = allowed.has(checkbox.dataset.permission);
    if (!isAllowed) checkbox.checked = false;
    if (scopeMode === "all") checkbox.checked = isAllowed;
    checkbox.disabled = scopeMode !== "custom" || !isAllowed;
  });
}

function readAccountCategoryPermissions(form) {
  const result = {};
  for (const category of appState.cache.schema.categories) result[category.id] = [];
  $$('[data-account-scope-permission]:checked', form).forEach((checkbox) => {
    const categoryId = checkbox.dataset.categoryId;
    const permission = checkbox.dataset.permission;
    if (result[categoryId] && CATEGORY_SCOPED_PERMISSION_SET.has(permission)) result[categoryId].push(permission);
  });
  return result;
}

function openAccountForm(accountId = null) {
  if (!hasPermission(PERMISSIONS.manageAccounts)) return showToast("error", "Không có quyền quản lý tài khoản");
  const account = accountId ? appState.cache.accounts.find((item) => item.id === accountId) : null;
  if (accountId && !account) return showToast("error", "Không tìm thấy tài khoản");
  if (!canManageAccount(account)) return showToast("error", "Bạn không có quyền quản lý tài khoản này");
  const extraButton = account && canManageAccount(account) && hasPermission(PERMISSIONS.resetAccountPassword)
    ? `<button class="btn btn-soft" type="button" data-action="open-password-reset" data-account-id="${escapeHTML(account.id)}">Đặt mật khẩu mới</button>`
    : "";
  openModal({
    name: "account-form",
    title: account ? "Sửa tài khoản" : "Tạo tài khoản",
    subtitle: "Cấp vai trò và quyền riêng theo từng nhóm vật liệu.",
    body: `${accountFormBody(account)}${extraButton ? `<div style="margin-top:12px">${extraButton}</div>` : ""}`,
    footer: `<button class="btn btn-secondary" type="button" data-action="close-modal">Hủy</button><button class="btn btn-primary" type="submit" form="account-form">${account ? "Lưu thay đổi" : "Tạo tài khoản"}</button>`,
  });
  updateAccountPermissionEditor();
}

function categoryFormBody(category = null, draft = null) {
  const model = draft || category || {
    id: "",
    name: "",
    icon: "◇",
    units: ["cái"],
    defaultUnit: "cái",
    warningDefault: 5,
    active: true,
    attributes: [{ id: "", name: "Tên vật liệu", type: "text", options: [], unit: "", required: true, identity: true, list: true, identityOrder: 0 }],
  };
  const attributes = model.attributes?.length
    ? model.attributes
      .filter((attribute) => attribute.active !== false)
      .map((attribute, index) => ({ ...attribute, sortOrder: Number.isFinite(Number(attribute.sortOrder)) ? Number(attribute.sortOrder) : index }))
      .sort((left, right) => left.sortOrder - right.sortOrder)
    : [];
  return `<form id="category-form" class="field-grid" novalidate>
    <input type="hidden" name="id" value="${escapeHTML(model.id || "")}">
    <input type="hidden" name="expectedRevision" value="${escapeHTML(model.revision ?? "")}">
    <div class="field-grid two">
      <label class="field" for="category-name"><span class="field-label">Tên nhóm</span><input id="category-name" name="name" class="input" type="text" required value="${escapeHTML(model.name || "")}"></label>
      <label class="field" for="category-icon"><span class="field-label">Ký hiệu</span><input id="category-icon" name="icon" class="input" type="text" maxlength="2" value="${escapeHTML(model.icon || "◇")}"></label>
    </div>
    <label class="field" for="category-units"><span class="field-label">Danh sách đơn vị</span><input id="category-units" name="units" class="input" type="text" required value="${escapeHTML((model.units || []).join(", "))}"><span class="field-help">Phân tách bằng dấu phẩy, ví dụ: cái, hộp, m.</span></label>
    <div class="field-grid two">
      <label class="field" for="category-default-unit"><span class="field-label">Đơn vị mặc định</span><input id="category-default-unit" name="defaultUnit" class="input" type="text" required value="${escapeHTML(model.defaultUnit || "")}"></label>
      <label class="field" for="category-warning"><span class="field-label">Cảnh báo mặc định</span><input id="category-warning" name="warningDefault" class="input" type="number" inputmode="decimal" min="0" step="any" value="${escapeHTML(model.warningDefault ?? 0)}"></label>
    </div>
    ${category ? `<label class="checkbox-row" for="category-active"><input id="category-active" name="active" type="checkbox" ${model.active !== false ? "checked" : ""}><span>Nhóm đang hoạt động</span></label>` : ""}

    <div class="section-head"><div class="section-copy"><h3 class="section-title">Thuộc tính</h3><p class="section-subtitle">Sắp xếp tại đây; form, chi tiết và tên tự động sẽ dùng đúng thứ tự này. Việc sắp xếp không làm thay đổi khóa chống trùng.</p></div><button class="btn btn-compact btn-soft" type="button" data-action="add-attribute-row">${icon("plus")} Thuộc tính</button></div>
    <div id="attribute-editor-list" class="field-grid">${attributes.map((attribute, index) => renderAttributeEditorRow(attribute, index, attributes.length)).join("")}</div>
  </form>`;
}

function renderAttributeEditorRow(attribute, index, total = appState.ui.categoryDraft?.attributes?.length || 0) {
  return `<fieldset class="card card-pad" data-attribute-row data-attribute-id="${escapeHTML(attribute.id || "")}" data-identity-order="${toOptionalNumber(attribute.identityOrder) ?? ""}">
    <div class="section-head">
      <legend class="section-title">Thuộc tính ${index + 1}</legend>
      <div class="attribute-row-actions" aria-label="Sắp xếp thuộc tính ${index + 1}">
        <button class="icon-btn" type="button" data-action="move-attribute-up" aria-label="Đưa thuộc tính ${index + 1} lên trên" ${index === 0 ? "disabled" : ""}>${icon("up")}</button>
        <button class="icon-btn" type="button" data-action="move-attribute-down" aria-label="Đưa thuộc tính ${index + 1} xuống dưới" ${index >= total - 1 ? "disabled" : ""}>${icon("down")}</button>
        <button class="icon-btn" type="button" data-action="remove-attribute-row" aria-label="Xóa thuộc tính ${index + 1}">${icon("trash")}</button>
      </div>
    </div>
    <div class="field-grid" style="margin-top:12px">
      <label class="field"><span class="field-label">Tên thuộc tính</span><input class="input" data-attribute-field="name" type="text" required value="${escapeHTML(attribute.name || "")}"></label>
      <div class="field-grid two">
        <label class="field"><span class="field-label">Kiểu dữ liệu</span><select class="select" data-attribute-field="type">${[["text", "Văn bản"], ["number", "Số"], ["select", "Danh sách"]].map(([value, label]) => `<option value="${value}" ${attribute.type === value ? "selected" : ""}>${label}</option>`).join("")}</select></label>
        <label class="field"><span class="field-label">Đơn vị</span><input class="input" data-attribute-field="unit" type="text" value="${escapeHTML(attribute.unit || "")}" placeholder="mm, cm..."></label>
      </div>
      <label class="field"><span class="field-label">Các lựa chọn</span><input class="input" data-attribute-field="options" type="text" value="${escapeHTML(Array.isArray(attribute.options) ? attribute.options.join(", ") : String(attribute.options || ""))}" placeholder="Chỉ dùng khi kiểu là Danh sách"><span class="field-help">Phân tách bằng dấu phẩy.</span></label>
      <div class="field-grid two">
        <label class="checkbox-row"><input type="checkbox" data-attribute-field="required" ${attribute.required ? "checked" : ""}><span>Bắt buộc</span></label>
        <label class="checkbox-row"><input type="checkbox" data-attribute-field="identity" ${attribute.identity ? "checked" : ""}><span>Nhận diện</span></label>
        <label class="checkbox-row"><input type="checkbox" data-attribute-field="list" ${attribute.list ? "checked" : ""}><span>Hiện danh sách</span></label>
      </div>
    </div>
  </fieldset>`;
}

function readCategoryDraftFromForm() {
  const form = $("#category-form");
  if (!form) return appState.ui.categoryDraft;
  const data = new FormData(form);
  const attributes = $$("[data-attribute-row]", form).map((row, index) => ({
    id: row.dataset.attributeId || "",
    name: $("[data-attribute-field='name']", row)?.value || "",
    type: $("[data-attribute-field='type']", row)?.value || "text",
    unit: $("[data-attribute-field='unit']", row)?.value || "",
    options: $("[data-attribute-field='options']", row)?.value || "",
    required: Boolean($("[data-attribute-field='required']", row)?.checked),
    identity: Boolean($("[data-attribute-field='identity']", row)?.checked),
    list: Boolean($("[data-attribute-field='list']", row)?.checked),
    sortOrder: index,
    identityOrder: toOptionalNumber(row.dataset.identityOrder),
  }));
  return {
    id: data.get("id") || "",
    expectedRevision: toOptionalNumber(data.get("expectedRevision")),
    name: data.get("name") || "",
    icon: data.get("icon") || "◇",
    units: String(data.get("units") || "").split(",").map((item) => item.trim()).filter(Boolean),
    defaultUnit: data.get("defaultUnit") || "",
    warningDefault: data.get("warningDefault") || 0,
    active: $("#category-active", form)?.checked ?? true,
    attributes,
  };
}

function openCategoryForm(categoryId = null) {
  if (!hasPermission(PERMISSIONS.manageSchema)) return showToast("error", "Không có quyền quản lý danh mục");
  const category = categoryId ? categoryById(categoryId) : null;
  appState.ui.categoryDraft = clone(category || {
    id: "",
    name: "",
    icon: "◇",
    units: ["cái"],
    defaultUnit: "cái",
    warningDefault: 5,
    active: true,
    attributes: [{ id: "", name: "Tên vật liệu", type: "text", options: [], unit: "", required: true, identity: true, list: true, identityOrder: 0 }],
  });
  openModal({
    name: "category-form",
    title: category ? "Sửa nhóm vật liệu" : "Thêm nhóm vật liệu",
    subtitle: "Không đổi ID nhóm khi đã có dữ liệu lịch sử.",
    body: categoryFormBody(category, appState.ui.categoryDraft),
    footer: `<button class="btn btn-secondary" type="button" data-action="close-modal">Hủy</button><button class="btn btn-primary" type="submit" form="category-form">${category ? "Lưu thay đổi" : "Tạo nhóm"}</button>`,
  });
}

function rerenderCategoryAttributes() {
  const list = $("#attribute-editor-list");
  if (!list || !appState.ui.categoryDraft) return;
  list.innerHTML = appState.ui.categoryDraft.attributes.map((attribute, index) => renderAttributeEditorRow(attribute, index, appState.ui.categoryDraft.attributes.length)).join("");
}

function collectProductPayload(form) {
  const data = new FormData(form);
  const category = categoryById(data.get("categoryId"));
  if (!category) throw new Error("Nhóm vật liệu không hợp lệ.");
  const attributes = {};
  for (const attribute of orderedCategoryAttributes(category)) {
    attributes[attribute.id] = data.get(`attr:${attribute.id}`) ?? "";
  }
  return {
    id: data.get("id") || null,
    expectedRevision: toOptionalNumber(data.get("expectedRevision")),
    categoryId: data.get("categoryId"),
    customName: data.get("customName"),
    unit: data.get("unit"),
    warningLevel: data.get("warningLevel"),
    initialStock: data.get("initialStock"),
    note: data.get("note"),
    attributes,
  };
}

function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function updateInventoryListOnly() {
  const list = $("#inventory-list");
  if (!list) return;
  const products = filteredProducts();
  list.innerHTML = renderInventoryListContent(products);
  setText("#inventory-result-count", `${products.length} kết quả`);
}

function updateHistoryListOnly() {
  const list = $("#history-list");
  if (!list) return;
  const transactions = filteredTransactions();
  list.innerHTML = transactions.length ? transactions.map(renderTransactionRow).join("") : renderEmptyState("history", "Không có giao dịch phù hợp", "Thử xóa bộ lọc hoặc chọn khoảng ngày khác.");
  setText("#history-result-count", `${transactions.length} giao dịch`);
}

const debouncedInventoryFilter = debounce(updateInventoryListOnly, 160);
const debouncedHistoryFilter = debounce(updateHistoryListOnly, 160);

async function switchScreen(screen, manageTarget = null) {
  if (!Object.values(SCREENS).includes(screen)) return;
  appState.screen = screen;
  if (manageTarget && Object.values(MANAGE_TABS).includes(manageTarget)) appState.manageTab = manageTarget;
  closeModal(true);
  if (screen === SCREENS.history) await loadTransactions({ render: false, limit: 200 });
  if (screen === SCREENS.manage && appState.manageTab === MANAGE_TABS.accounts && hasPermission(PERMISSIONS.manageAccounts)) await loadAccountData({ render: false });
  renderApp();
  window.scrollTo({ top: 0, behavior: "auto" });
  $("#main-content")?.focus({ preventScroll: true });
}

async function handleBootstrapSubmit(event, form) {
  event.preventDefault();
  const data = new FormData(form);
  const submitButton = $("[type='submit']", form);
  await withActionLock("bootstrap-superadmin", submitButton, async () => {
    try {
      const payload = {
        username: data.get("username"),
        displayName: data.get("displayName"),
        password: data.get("password"),
        passwordConfirm: data.get("passwordConfirm"),
      };
      await dataService.bootstrapFirstSuperadmin(payload);
      appState.ui.initialized = true;
      const account = await dataService.login(payload.username, payload.password);
      setAuthenticatedAccount(account);
      appState.screen = SCREENS.dashboard;
      await loadBootstrap({ render: false });
      await loadTransactions({ render: false, limit: 50 });
      startRealtimeSync();
      renderApp();
      showToast("success", "Đã tạo Super Admin", "Ứng dụng đã sẵn sàng sử dụng.");
    } catch (error) {
      if (error.code === "ALREADY_INITIALIZED") appState.ui.initialized = true;
      showToast("error", "Không thể khởi tạo", error.message);
      renderApp();
    }
  });
}

async function handleLoginSubmit(event, form) {
  event.preventDefault();
  const data = new FormData(form);
  const submitButton = $("[type='submit']", form);
  await withActionLock("login", submitButton, async () => {
    try {
      const account = await dataService.login(data.get("username"), data.get("password"));
      setAuthenticatedAccount(account);
      appState.screen = SCREENS.dashboard;
      appState.cache = { schema: null, products: [], transactions: [], accounts: [], accountAudit: [], loaded: { bootstrap: false, transactions: false, accounts: false, accountAudit: false } };
      await loadBootstrap({ render: false });
      if (appState.cache.schema && appState.auth.status === "signedIn") {
        await loadTransactions({ render: false, limit: 50 });
        startRealtimeSync();
        showToast("success", "Đăng nhập thành công", `${account.displayName} · ${roleLabel(account.role)}`);
      }
      renderApp();
    } catch (error) {
      showToast("error", "Không thể đăng nhập", error.message);
      $("#login-password")?.focus();
    }
  });
}

async function handlePasswordResetSubmit(event, form) {
  event.preventDefault();
  const data = new FormData(form);
  const accountId = String(data.get("accountId") || "");
  const submitButton = $(`[type="submit"][form="${form.getAttribute("id")}"]`);
  await withActionLock(`reset-password:${accountId}`, submitButton, async () => {
    try {
      await dataService.setAccountPassword(accountId, data.get("password"), data.get("passwordConfirm"));
      await loadAccountData({ render: false });
      closeModal(true);
      renderApp();
      showToast("success", "Đã đặt mật khẩu mới", "Tài khoản có thể đăng nhập ngay, không bắt buộc đổi lại.");
    } catch (error) {
      showToast("error", "Không thể đặt mật khẩu", error.message);
    }
  });
}

async function handleProductSubmit(event, form) {
  event.preventDefault();
  const submitButton = $(`[type="submit"][form="${form.getAttribute("id")}"]`);
  await withActionLock("save-product", submitButton, async () => {
    try {
      const payload = collectProductPayload(form);
      const saved = await dataService.saveProduct(payload);
      await refreshInventoryAndHistory({ render: false });
      closeModal(true);
      renderApp();
      showToast("success", payload.id ? "Đã cập nhật vật liệu" : "Đã tạo vật liệu", saved.name);
      announce("Đã lưu vật liệu thành công.");
    } catch (error) {
      showToast("error", "Không thể lưu vật liệu", error.message);
    }
  });
}

async function handleTransactionSubmit(event, form) {
  event.preventDefault();
  const data = new FormData(form);
  const productId = String(data.get("productId") || "");
  const submitButton = $(`[type="submit"][form="${form.getAttribute("id")}"]`);
  await withActionLock(`transaction:${productId}`, submitButton, async () => {
    try {
      const result = await dataService.applyTransaction({
        productId,
        type: data.get("type"),
        amount: data.get("amount"),
        note: data.get("note"),
        requestKey: data.get("requestKey"),
      });
      await refreshInventoryAndHistory({ render: false });
      closeModal(true);
      renderApp();
      showToast("success", result.duplicate ? "Giao dịch đã tồn tại" : "Đã lưu giao dịch", `${result.product.name}: ${formatQuantity(result.product.quantity)} ${result.product.unit}`);
      announce("Đã lưu giao dịch kho thành công.");
    } catch (error) {
      showToast("error", "Không thể lưu giao dịch", error.message);
    }
  });
}

async function handleReverseTransactionSubmit(event, form) {
  event.preventDefault();
  const data = new FormData(form);
  const transactionId = String(data.get("transactionId") || "");
  const submitButton = $(`[type="submit"][form="${form.getAttribute("id")}"]`);
  await withActionLock(`reverse:${transactionId}`, submitButton, async () => {
    try {
      const result = await dataService.reverseTransaction({
        transactionId,
        reason: data.get("reason"),
        requestKey: data.get("requestKey"),
      });
      await refreshInventoryAndHistory({ render: false });
      closeModal(true);
      renderApp();
      showToast("success", result.duplicate ? "Giao dịch đảo đã tồn tại" : "Đã đảo giao dịch", `${result.product.name}: ${formatQuantity(result.product.quantity)} ${result.product.unit}`);
      announce("Đã tạo giao dịch đảo và cập nhật tồn kho.");
    } catch (error) {
      showToast("error", "Không thể đảo giao dịch", error.message);
    }
  });
}

async function handleHistoryCleanupSubmit(event, form) {
  event.preventDefault();
  const data = new FormData(form);
  const submitButton = $(`[type="submit"][form="${form.getAttribute("id")}"]`);
  await withActionLock("delete-inventory-history", submitButton, async () => {
    try {
      const scope = data.get("scope") === "all" ? "all" : "before";
      const before = scope === "all" ? null : String(data.get("before") || "");
      if (scope === "before" && !before) throw new Error("Vui lòng chọn ngày kết thúc.");
      const result = await dataService.deleteInventoryHistory({
        before,
        reason: data.get("reason"),
        confirmation: data.get("confirmation"),
      });
      await loadTransactions({ render: false, limit: appState.screen === SCREENS.history ? 200 : 50, useFilters: appState.screen === SCREENS.history });
      closeModal(true);
      renderApp();
      showToast("success", "Đã xóa lịch sử", `${toNumber(result?.deletedCount, 0)} giao dịch đã được xóa khỏi ứng dụng.`);
    } catch (error) {
      showToast("error", "Không thể xóa lịch sử", error.message);
    }
  });
}

async function handleAccountSubmit(event, form) {
  event.preventDefault();
  const data = new FormData(form);
  const submitButton = $(`[type="submit"][form="${form.getAttribute("id")}"]`);
  await withActionLock("save-account", submitButton, async () => {
    try {
      await dataService.saveAccount({
        id: data.get("id") || null,
        expectedRevision: toOptionalNumber(data.get("expectedRevision")),
        displayName: data.get("displayName"),
        username: data.get("username"),
        role: data.get("role"),
        status: data.get("status") || ACCOUNT_STATUSES.active,
        scopeMode: data.get("scopeMode") || "all",
        categoryPermissions: readAccountCategoryPermissions(form),
        password: data.get("password"),
        passwordConfirm: data.get("passwordConfirm"),
      });
      await loadAccountData({ render: false });
      closeModal(true);
      renderApp();
      showToast("success", "Đã lưu tài khoản");
    } catch (error) {
      showToast("error", "Không thể lưu tài khoản", error.message);
    }
  });
}

async function handleCategorySubmit(event, form) {
  event.preventDefault();
  const draft = readCategoryDraftFromForm();
  const submitButton = $(`[type="submit"][form="${form.getAttribute("id")}"]`);
  await withActionLock("save-category", submitButton, async () => {
    try {
      await dataService.saveCategory({
        ...draft,
        units: draft.units.join(", "),
        attributes: draft.attributes,
      });
      await refreshInventoryAndHistory({ render: false });
      closeModal(true);
      renderApp();
      showToast("success", "Đã lưu nhóm vật liệu");
    } catch (error) {
      showToast("error", "Không thể lưu nhóm", error.message);
    }
  });
}

function bindEvents() {
  on(document, "click", "[data-nav]", async (event, button) => {
    event.preventDefault();
    const destination = button.dataset.nav;
    if (destination === "quick") {
      openTransactionModal();
      return;
    }
    await switchScreen(destination, button.dataset.manageTarget || null);
  });

  on(document, "click", "[data-manage-tab]", async (event, button) => {
    appState.manageTab = button.dataset.manageTab;
    if (appState.manageTab === MANAGE_TABS.accounts && hasPermission(PERMISSIONS.manageAccounts)) await loadAccountData({ render: false });
    renderApp();
  });

  on(document, "click", "[data-action='toggle-theme']", () => applyTheme(appState.theme === "dark" ? "light" : "dark") || renderApp());
  on(document, "click", "[data-action='open-profile']", openProfileModal);
  on(document, "click", "[data-action='retry-bootstrap']", async (event, button) => {
    await withActionLock("retry-bootstrap", button, async () => {
      await loadBootstrap({ render: false });
      if (appState.cache.schema && appState.auth.status === "signedIn") await loadTransactions({ render: false, limit: 50 });
      renderApp();
    });
  });
  on(document, "click", "[data-action='logout']", async (event, button) => {
    await withActionLock("logout", button, async () => {
      await stopRealtimeSync();
      await dataService.logout();
      closeModal(true);
      setAuthenticatedAccount(null);
      appState.cache = { schema: null, products: [], transactions: [], accounts: [], accountAudit: [], loaded: { bootstrap: false, transactions: false, accounts: false, accountAudit: false } };
      renderApp();
      showToast("success", "Đã đăng xuất");
    });
  });
  on(document, "click", "[data-action='close-modal']", () => closeModal());
  on(document, "click", "[data-action='open-product']", (event, button) => openProductDetail(button.dataset.productId));
  on(document, "click", "[data-action='add-product']", () => openProductForm());
  on(document, "click", "[data-action='edit-product']", (event, button) => openProductForm(button.dataset.productId));
  on(document, "click", "[data-action='open-transaction']", (event, button) => openTransactionModal(button.dataset.productId));
  on(document, "click", "[data-action='open-transaction-detail']", (event, button) => openTransactionDetail(button.dataset.transactionId));
  on(document, "click", "[data-action='open-reverse-transaction']", (event, button) => openReverseTransactionModal(button.dataset.transactionId));
  on(document, "click", "[data-action='add-account']", () => openAccountForm());
  on(document, "click", "[data-action='edit-account']", (event, button) => openAccountForm(button.dataset.accountId));
  on(document, "click", "[data-action='open-password-reset']", (event, button) => openPasswordResetForm(button.dataset.accountId));
  on(document, "click", "[data-action='add-category']", () => openCategoryForm());
  on(document, "click", "[data-action='edit-category']", (event, button) => openCategoryForm(button.dataset.categoryId));
  on(document, "click", "[data-action='open-history-cleanup']", openHistoryCleanupModal);

  on(document, "click", "[data-action='archive-product']", (event, button) => {
    const product = productById(button.dataset.productId);
    if (!product) return;
    closeModal(true);
    openConfirm({
      title: "Lưu trữ vật liệu?",
      message: `Vật liệu “${product.name}” sẽ ẩn khỏi kho nhưng lịch sử vẫn được giữ.`,
      confirmLabel: "Lưu trữ",
      danger: true,
      onConfirm: async (confirmButton) => {
        await withActionLock(`archive:${product.id}`, confirmButton, async () => {
          try {
            await dataService.archiveProduct(product.id, product.revision ?? null);
            await refreshInventoryAndHistory({ render: false });
            closeModal(true);
            renderApp();
            showToast("success", "Đã lưu trữ vật liệu");
          } catch (error) {
            showToast("error", "Không thể lưu trữ", error.message);
          }
        });
      },
    });
  });

  on(document, "click", "[data-action='confirm-callback']", async (event, button) => {
    const callback = confirmCallbacks.get(button.dataset.callbackId);
    confirmCallbacks.delete(button.dataset.callbackId);
    appState.ui.confirmCallbackId = null;
    if (callback) await callback(button);
  });

  on(document, "click", "[data-action='select-transaction-type']", (event, button) => {
    const form = $("#transaction-form");
    if (!form) return;
    $$("[data-action='select-transaction-type']", form).forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    setValue("#transaction-type", button.dataset.type, form);
    updateTransactionPreview();
  });

  on(document, "click", "[data-action='clear-history-filters']", async () => {
    appState.filters.history = { search: "", type: "all", from: "", to: "" };
    if (dataService.mode === "supabase") await loadTransactions({ render: false, limit: 200, useFilters: true });
    renderApp();
  });

  on(document, "click", "[data-action='add-attribute-row']", () => {
    appState.ui.categoryDraft = readCategoryDraftFromForm();
    appState.ui.categoryDraft.attributes.push({ id: "", name: "", type: "text", options: "", unit: "", required: false, identity: false, list: true, sortOrder: appState.ui.categoryDraft.attributes.length, identityOrder: null });
    rerenderCategoryAttributes();
  });

  on(document, "click", "[data-action='move-attribute-up'], [data-action='move-attribute-down']", (event, button) => {
    appState.ui.categoryDraft = readCategoryDraftFromForm();
    const rows = $$("[data-attribute-row]");
    const index = rows.indexOf(button.closest("[data-attribute-row]"));
    if (index < 0) return;
    const direction = button.dataset.action === "move-attribute-up" ? -1 : 1;
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= appState.ui.categoryDraft.attributes.length) return;
    const [movedAttribute] = appState.ui.categoryDraft.attributes.splice(index, 1);
    appState.ui.categoryDraft.attributes.splice(nextIndex, 0, movedAttribute);
    appState.ui.categoryDraft.attributes.forEach((attribute, attributeIndex) => { attribute.sortOrder = attributeIndex; });
    rerenderCategoryAttributes();
    const movedRow = $$('[data-attribute-row]')[nextIndex];
    movedRow?.querySelector("[data-attribute-field='name']")?.focus();
  });

  on(document, "click", "[data-action='remove-attribute-row']", (event, button) => {
    appState.ui.categoryDraft = readCategoryDraftFromForm();
    const rows = $$("[data-attribute-row]");
    const index = rows.indexOf(button.closest("[data-attribute-row]"));
    if (index < 0) return;
    if (appState.ui.categoryDraft.attributes.length <= 1) return showToast("error", "Nhóm cần ít nhất một thuộc tính");
    const attribute = appState.ui.categoryDraft.attributes[index];
    if (attribute?.id) {
      const accepted = window.confirm(`Xóa thuộc tính “${attribute.name || `Thuộc tính ${index + 1}`}”?\n\n• Chưa có dữ liệu: xóa hoàn toàn.\n• Đã có dữ liệu và không phải nhận diện: ngừng sử dụng, dữ liệu cũ vẫn được giữ.\n• Thuộc tính nhận diện đang dùng: hệ thống sẽ chặn để tránh trùng vật liệu.`);
      if (!accepted) return;
    }
    appState.ui.categoryDraft.attributes.splice(index, 1);
    appState.ui.categoryDraft.attributes.forEach((item, attributeIndex) => { item.sortOrder = attributeIndex; });
    rerenderCategoryAttributes();
  });

  on(document, "click", "[data-action='export-backup']", () => {
    try {
      const backup = dataService.exportBackup();
      downloadJSON(`kho-khuon-be-backup-${formatISODate(new Date())}.json`, backup);
      showToast("success", "Đã tạo file sao lưu");
    } catch (error) {
      showToast("error", "Không thể tạo file sao lưu", error.message);
    }
  });

  on(document, "click", "[data-action='trigger-import']", () => $("#backup-file-input")?.click());

  on(document, "click", "[data-action='restore-rollback']", () => {
    openConfirm({
      title: "Khôi phục snapshot gần nhất?",
      message: "Dữ liệu hiện tại sẽ hoán đổi với trạng thái trước lần phục hồi hoặc đặt lại gần nhất.",
      confirmLabel: "Khôi phục",
      onConfirm: async (button) => {
        await withActionLock("restore-rollback", button, async () => {
          try {
            await dataService.restoreRollback();
            await refreshAfterDataReplacement();
            closeModal(true);
            renderApp();
            showToast("success", "Đã khôi phục snapshot gần nhất");
          } catch (error) {
            showToast("error", "Không thể khôi phục", error.message);
          }
        });
      },
    });
  });

  on(document, "click", "[data-action='reset-demo']", () => {
    openConfirm({
      title: "Đặt lại dữ liệu thử nghiệm?",
      message: "Toàn bộ thay đổi trên thiết bị này sẽ được thay bằng dữ liệu mẫu ban đầu.",
      confirmLabel: "Đặt lại",
      danger: true,
      onConfirm: async (button) => {
        await withActionLock("reset-demo", button, async () => {
          try {
            await dataService.resetDemo();
            await refreshAfterDataReplacement();
            closeModal(true);
            renderApp();
            showToast("success", "Đã đặt lại dữ liệu thử nghiệm");
          } catch (error) {
            showToast("error", "Không thể đặt lại dữ liệu", error.message);
          }
        });
      },
    });
  });

  on(document, "change", "#history-cleanup-scope", updateHistoryCleanupFields);

  document.addEventListener("submit", (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    const formId = form.getAttribute("id") || "";
    const handledForms = new Set(["bootstrap-form", "login-form", "product-form", "transaction-form", "reverse-transaction-form", "history-cleanup-form", "account-form", "password-reset-form", "category-form"]);
    if (!handledForms.has(formId)) return;
    event.preventDefault();
    event.stopPropagation();
    if (formId === "bootstrap-form") handleBootstrapSubmit(event, form);
    else if (formId === "login-form") handleLoginSubmit(event, form);
    if (formId === "product-form") handleProductSubmit(event, form);
    if (formId === "transaction-form") handleTransactionSubmit(event, form);
    if (formId === "reverse-transaction-form") handleReverseTransactionSubmit(event, form);
    if (formId === "history-cleanup-form") handleHistoryCleanupSubmit(event, form);
    if (formId === "account-form") handleAccountSubmit(event, form);
    if (formId === "password-reset-form") handlePasswordResetSubmit(event, form);
    if (formId === "category-form") handleCategorySubmit(event, form);
  }, true);

  document.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) return;
    if (target.id === "inventory-search") {
      appState.filters.inventory.search = target.value;
      debouncedInventoryFilter();
    }
    if (target.id === "inventory-quantity-below") {
      appState.filters.inventory.quantityBelow = target.value;
      debouncedInventoryFilter();
    }
    if (target.id === "history-search") {
      appState.filters.history.search = target.value;
      debouncedHistoryFilter();
    }
    if (target.closest("#product-form") && (target.name?.startsWith("attr:") || target.id === "product-custom-name")) updateGeneratedProductName();
    if (target.closest("#transaction-form") && ["transaction-amount", "transaction-product"].includes(target.id)) updateTransactionPreview();
  });

  document.addEventListener("change", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
    if (target.id === "inventory-category") {
      appState.filters.inventory.category = target.value;
      updateInventoryListOnly();
    }
    if (target.id === "inventory-status") {
      appState.filters.inventory.status = target.value;
      updateInventoryListOnly();
    }
    if (target.id === "history-type") {
      appState.filters.history.type = target.value;
      if (dataService.mode === "supabase") await loadTransactions({ render: false, limit: 200, useFilters: true });
      renderApp();
    }
    if (target.id === "history-from") {
      appState.filters.history.from = target.value;
      if (dataService.mode === "supabase") await loadTransactions({ render: false, limit: 200, useFilters: true });
      renderApp();
    }
    if (target.id === "history-to") {
      appState.filters.history.to = target.value;
      if (dataService.mode === "supabase") await loadTransactions({ render: false, limit: 200, useFilters: true });
      renderApp();
    }
    if (target.id === "product-category") refreshProductFormForCategory(target.value);
    if (target.id === "transaction-product") updateTransactionPreview();
    if (["account-role", "account-scope-mode"].includes(target.id)) updateAccountPermissionEditor();
    if (target.id === "backup-file-input" && target.files?.[0]) {
      const file = target.files[0];
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        openConfirm({
          title: "Phục hồi bản sao lưu?",
          message: `Dữ liệu thử nghiệm hiện tại sẽ được thay bằng file “${file.name}”.`,
          confirmLabel: "Phục hồi",
          danger: true,
          onConfirm: async (button) => {
            await withActionLock("import-backup", button, async () => {
              try {
                await dataService.importBackup(data);
                await refreshAfterDataReplacement();
                closeModal(true);
                renderApp();
                showToast("success", "Đã phục hồi bản sao lưu");
              } catch (error) {
                showToast("error", "Không thể phục hồi", error.message);
              }
            });
          },
        });
      } catch (error) {
        showToast("error", "File JSON không hợp lệ", error.message);
      } finally {
        target.value = "";
      }
    }
  });

  on(document, "click", "[data-modal-backdrop='true']", (event, layer) => {
    if (event.target === layer) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && appState.ui.modalName) closeModal();
  });

}

async function refreshAfterDataReplacement() {
  const session = readAuthSession();
  if (!session) { setAuthenticatedAccount(null); renderApp(); return; }
  const profile = await dataService.getSessionProfile(session.accountId);
  if (!profile) { clearAuthSession(); setAuthenticatedAccount(null); renderApp(); return; }
  setAuthenticatedAccount(profile);
  await loadBootstrap({ render: false });
  await loadTransactions({ render: false, limit: 50 });
  if (hasPermission(PERMISSIONS.manageAccounts)) await loadAccountData({ render: false });
  renderApp();
}

function bindZoomPrevention() {
  let lastTouchEnd = 0;

  ["gesturestart", "gesturechange", "gestureend"].forEach((eventName) => {
    document.addEventListener(eventName, (event) => event.preventDefault(), { passive: false });
  });

  document.addEventListener("touchmove", (event) => {
    if (event.touches?.length > 1) event.preventDefault();
  }, { passive: false });

  document.addEventListener("touchend", (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) event.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });

  document.addEventListener("dblclick", (event) => event.preventDefault(), { passive: false });
  document.addEventListener("wheel", (event) => {
    if (event.ctrlKey || event.metaKey) event.preventDefault();
  }, { passive: false });
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
  try {
    const registration = await navigator.serviceWorker.register(`./service-worker.js?v=${encodeURIComponent(APP_VERSION)}`);
    registration.update().catch(() => {});
  } catch (error) {
    console.warn("Không đăng ký được service worker.", error);
  }
}

async function init() {
  applyTheme(appState.theme);
  bindZoomPrevention();
  bindEvents();
  bindRealtimeLifecycle();
  renderApp();
  await checkInitializationStatus();
  await restoreSession();
  if (appState.auth.status === "signedIn") startRealtimeSync();
  renderApp();
  registerServiceWorker();
  console.info(`Kho Khuôn Bế ${APP_VERSION} · ${CACHE_VERSION}`);
}

document.addEventListener("DOMContentLoaded", init, { once: true });
