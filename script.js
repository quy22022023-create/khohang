"use strict";

/*
 * Kho Khuôn Bế 2.0.2
 * Frontend HTML/CSS/JavaScript thuần kết nối Supabase qua RPC.
 * Không đặt service-role/secret key trong frontend.
 */

const APP_VERSION = "2.0.2";
const BUILD_ID = "20260814-giao-dich-gon-hoan-tac-nhanh";
const CACHE_VERSION = `kho-khuon-be-cache-${APP_VERSION}-${BUILD_ID}`;
const DATA_FORMAT_VERSION = 5;

const STORAGE_KEYS = Object.freeze({
  theme: "kho_v2_theme",
  demoData: "kho_v2_demo_data",
  demoRole: "kho_v2_demo_role",
  demoAccount: "kho_v2_demo_account",
  authSession: "kho_v2_auth_session",
  rollback: "kho_v2_demo_rollback",
  pdfPreferences: "kho_v2_pdf_preferences",
});

const SCREENS = Object.freeze({
  dashboard: "dashboard",
  inventory: "inventory",
  history: "history",
  manage: "manage",
});

const MANAGE_TABS = Object.freeze({
  home: "home",
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
  adjust: "Điều chỉnh tồn",
  reverse: "Hoàn tác",
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
  [PERMISSIONS.viewHistory]: ["Xem lịch sử", "Xem giao dịch nhập, xuất, điều chỉnh tồn và hoàn tác."],
  [PERMISSIONS.importInventory]: ["Nhập kho", "Tăng tồn bằng một giao dịch nhập kho."],
  [PERMISSIONS.exportInventory]: ["Xuất kho", "Giảm tồn nhưng không được làm tồn âm."],
  [PERMISSIONS.countInventory]: ["Điều chỉnh tồn", "Đặt tồn kho về số thực tế."],
  [PERMISSIONS.reverseTransaction]: ["Hoàn tác giao dịch", "Hoàn tác giao dịch mới nhất của vật liệu thay vì sửa hoặc xóa lịch sử."],
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
  screen: SCREENS.inventory,
  manageTab: MANAGE_TABS.home,
  theme: safeStorage.getItem(STORAGE_KEYS.theme) === "dark" ? "dark" : "light",
  loading: {},
  actionLocks: new Set(),
  requestIds: {},
  cache: {
    schema: null,
    products: [],
    transactions: [],
    historyTransactions: [],
    historyMeta: { total: 0, nextOffset: null, allLoaded: false, queryKey: "" },
    monthlyAnalysis: { key: "", data: null, error: "" },
    accounts: [],
    accountAudit: [],
    loaded: { bootstrap: false, transactions: false, historyTransactions: false, accounts: false, accountAudit: false },
  },
  filters: {
    inventory: { search: "", category: "all", status: "all", quantityBelow: "" },
    history: { search: "", type: "all", category: "all", month: currentMonthKey(), from: "", to: "", filtersOpen: false, view: "transactions", analysisCategory: "all" },
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
    refreshPending: false,
    hasSubscribed: false,
    reconnectTimer: null,
    stopping: false,
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
  const parts = [productDisplayName(product), product?.name, product?.customName, product?.note, category?.name];

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

const HISTORY_PAGE_SIZE = 100;

function currentMonthKey(date = new Date()) {
  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) return "";
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
}

function parseMonthKey(monthKey) {
  const match = /^(\d{4})-(\d{2})$/.exec(String(monthKey || ""));
  if (!match) return null;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  if (!Number.isInteger(year) || monthIndex < 0 || monthIndex > 11) return null;
  return new Date(year, monthIndex, 1);
}

function shiftMonthKey(monthKey, delta) {
  const date = parseMonthKey(monthKey) || new Date();
  return currentMonthKey(new Date(date.getFullYear(), date.getMonth() + Number(delta || 0), 1));
}

function monthDateRange(monthKey) {
  const date = parseMonthKey(monthKey) || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { from: formatISODate(first), to: formatISODate(last) };
}

function formatMonthLabel(monthKey) {
  const date = parseMonthKey(monthKey);
  if (!date) return "Tháng hiện tại";
  return `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
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
    more: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm7 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm7 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z" fill="currentColor"/></svg>',
    edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15.7 4.3 4 4L9 19H5v-4L15.7 4.3Zm0 2.8L7 15.8V17h1.2L17 8.3l-1.3-1.2Z" fill="currentColor"/></svg>',
    archive: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16l1 4H3l1-4Zm1 6h14v10H5V10Zm5 2v2h4v-2h-4Z" fill="currentColor"/></svg>',
    warning: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 1 21h22L12 2Zm-1 7h2v6h-2V9Zm0 8h2v2h-2v-2Z" fill="currentColor"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.2 16.2-4.4-4.4 1.4-1.4 3 3 8.6-8.6 1.4 1.4-10 10Z" fill="currentColor"/></svg>',
    info: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 10h2v8h-2v-8Zm0-4h2v2h-2V6Zm1-4a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" fill="currentColor"/></svg>',
    help: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm-.1-5.2h2v2h-2v-2Zm.1-8.6c2.3 0 4 1.3 4 3.3 0 1.6-.9 2.4-2 3.1-.8.6-1.1.9-1.1 1.7h-2c0-1.7.7-2.4 1.8-3.2.8-.6 1.3-.9 1.3-1.6 0-.8-.7-1.4-2-1.4-1.1 0-1.9.5-2.6 1.4L7.8 8.3c1-1.4 2.4-2.1 4.2-2.1Z" fill="currentColor"/></svg>',
    filter: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v2H3V5Zm3 6h12v2H6v-2Zm4 6h4v2h-4v-2Z" fill="currentColor"/></svg>',
    pdf: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h9l5 5v15H6V2Zm8 2v5h4l-4-5ZM8 13h2.4c1.8 0 2.9.9 2.9 2.4 0 1.6-1.1 2.5-3 2.5H10V20H8v-7Zm2 1.7v1.6h.4c.6 0 .9-.3.9-.8s-.3-.8-.9-.8H10Zm4-1.7h2.4c2.2 0 3.6 1.3 3.6 3.5S18.6 20 16.4 20H14v-7Zm2 1.7v3.6h.3c1.1 0 1.7-.6 1.7-1.8s-.6-1.8-1.7-1.8H16Z" fill="currentColor"/></svg>',
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
      throw new Error(`Nhóm “${category.name}”: quyền Hoàn tác giao dịch phải kèm quyền Xem lịch sử.`);
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

function canDeleteTestProduct() {
  const role = normalizeRoleCode(appState.currentUser?.role);
  return ["admin", "superadmin"].includes(role) && hasPermission(PERMISSIONS.manageData);
}

function canSeeAdvancedSettings() {
  return ["admin", "superadmin"].includes(normalizeRoleCode(appState.currentUser?.role));
}

function canOpenManageTab(tab) {
  if (tab === MANAGE_TABS.home) return true;
  if (tab === MANAGE_TABS.accounts) return hasPermission(PERMISSIONS.manageAccounts);
  if (tab === MANAGE_TABS.categories) return hasPermission(PERMISSIONS.manageSchema);
  if ([MANAGE_TABS.access, MANAGE_TABS.data].includes(tab)) return canSeeAdvancedSettings();
  return false;
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
  return appState.cache.transactions.find((transaction) => transaction.id === transactionId)
    || appState.cache.historyTransactions.find((transaction) => transaction.id === transactionId)
    || null;
}

function latestTransactionForProduct(productId) {
  return appState.cache.transactions.find((transaction) => transaction.productId === productId) || null;
}

function visibleHistoryTransactions(permission = PERMISSIONS.viewHistory) {
  return appState.cache.historyTransactions.filter((transaction) => hasPermission(permission, transaction.categoryId));
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

function formatProductNameNumber(value) {
  const number = normalizeQuantity(value, Number.NaN);
  return Number.isFinite(number) ? String(number) : String(value ?? "").trim();
}

function daoDimensionPriority(attribute, fallbackIndex = 0) {
  const key = normalizeSearchText(`${attribute?.id || ""} ${attribute?.name || ""}`);
  if (key.includes("do day")) return 10;
  if (key.includes("chieu cao")) return 20;
  return 100 + fallbackIndex;
}

function buildProductDisplayName(category, attributes = {}) {
  const fallback = buildProductName(category, attributes);
  const entries = orderedCategoryAttributes(category, { identityOnly: true })
    .map((attribute, index) => ({ attribute, index, value: attributes?.[attribute.id] }))
    .filter(({ value }) => value !== "" && value !== null && value !== undefined);

  if (!entries.length) return fallback;

  const categoryKey = normalizeSearchText(category?.name || "");
  const textEntries = entries.filter(({ attribute }) => attribute.type !== "number");
  const primaryEntry = textEntries.find(({ value }) => normalizeSearchText(value).startsWith("dao"));
  const isDaoMaterial = categoryKey.includes("dao") || Boolean(primaryEntry);
  if (!isDaoMaterial) return fallback;

  const title = primaryEntry ? String(primaryEntry.value).trim() : String(category?.name || "Vật liệu").trim();
  const dimensions = entries
    .filter(({ attribute }) => attribute.type === "number")
    .sort((left, right) => daoDimensionPriority(left.attribute, left.index) - daoDimensionPriority(right.attribute, right.index))
    .map(({ value }) => formatProductNameNumber(value));
  const details = entries
    .filter(({ attribute }) => attribute.type !== "number")
    .filter((entry) => entry !== primaryEntry)
    .map(({ attribute, value }) => attributeDisplayValue(attribute, value));

  let name = title || fallback;
  if (dimensions.length) name += ` ${dimensions.join(" × ")}`;
  if (details.length) name += ` · ${details.join(" · ")}`;
  return name.trim() || fallback;
}

function productDisplayName(product) {
  if (!product) return "Vật liệu";
  if (String(product.customName || "").trim()) return String(product.name || product.customName).trim();
  const category = categoryById(product.categoryId);
  if (!category) return String(product.name || "Vật liệu");
  const categoryKey = normalizeSearchText(category.name || "");
  const hasDaoIdentity = orderedCategoryAttributes(category, { identityOnly: true }).some((attribute) => {
    if (attribute.type === "number") return false;
    const value = product.attributes?.[attribute.id];
    return value !== "" && value !== null && value !== undefined && normalizeSearchText(value).startsWith("dao");
  });
  return categoryKey.includes("dao") || hasDaoIdentity
    ? buildProductDisplayName(category, product.attributes || {})
    : String(product.name || buildProductName(category, product.attributes || {}));
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
    if (transaction.reversalOf && !transactionIds.has(transaction.reversalOf)) throw new Error(`Giao dịch hoàn tác ${transaction.id} không tìm thấy giao dịch gốc.`);
    if (transaction.reversalTransactionId && !transactionIds.has(transaction.reversalTransactionId)) throw new Error(`Giao dịch ${transaction.id} tham chiếu giao dịch hoàn tác không tồn tại.`);
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

  async listTransactions({ limit = 50, offset = 0, categoryId = null, productId = null, type = null, from = null, to = null } = {}) {
    await delay(100);
    const store = this.readStore();
    const actor = storeActor(store);
    if (!actor) throw new Error("Phiên đăng nhập không hợp lệ.");
    const fromTime = from ? new Date(`${from}T00:00:00`).getTime() : null;
    const toTime = to ? new Date(`${to}T23:59:59.999`).getTime() : null;
    const visible = store.transactions
      .filter((transaction) => !transaction.hiddenAt && accountHasPermission(actor, PERMISSIONS.viewHistory, transaction.categoryId, store.schema))
      .filter((transaction) => !categoryId || transaction.categoryId === categoryId)
      .filter((transaction) => !productId || transaction.productId === productId)
      .filter((transaction) => !type || transaction.type === type)
      .filter((transaction) => fromTime === null || new Date(transaction.createdAt).getTime() >= fromTime)
      .filter((transaction) => toTime === null || new Date(transaction.createdAt).getTime() <= toTime);
    const start = Math.max(0, Number(offset) || 0);
    const pageSize = Math.max(1, Math.min(Number(limit) || 50, 200));
    const items = visible.slice(start, start + pageSize);
    const nextOffset = start + pageSize < visible.length ? start + pageSize : null;
    return clone({ items, total: visible.length, nextOffset });
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

  async deleteTestProduct(productId, expectedRevision = null, requestKey = "") {
    await delay(180);
    return withDemoWriteLock(async () => {
      const store = this.readStore();
      const actor = assertStorePermission(store, PERMISSIONS.manageData);
      if (!["admin", "superadmin"].includes(normalizeRoleCode(actor.role))) {
        throw new Error("Chỉ Admin hoặc Super Admin được xóa vật liệu test.");
      }
      const index = store.products.findIndex((item) => item.id === productId);
      if (index < 0) throw new Error("Không tìm thấy vật liệu cần xóa.");
      const product = store.products[index];
      if (expectedRevision !== null && expectedRevision !== undefined && Number(product.revision ?? 1) !== Number(expectedRevision)) {
        throw new Error("Vật liệu đã được cập nhật. Hãy tải lại rồi thử lại.");
      }
      const transactionCount = store.transactions.filter((transaction) => transaction.productId === productId).length;
      store.transactions = store.transactions.filter((transaction) => transaction.productId !== productId);
      store.products.splice(index, 1);
      this.writeStore(store);
      return { deleted: true, productId, transactionCount, requestKey: String(requestKey || ""), duplicate: false };
    });
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
    if (!requestKey) throw new Error("Thiếu khóa thao tác hoàn tác giao dịch.");
    const existingReversal = store.transactions.find((transaction) => transaction.requestKey === requestKey);
    if (existingReversal) {
      const samePayload = existingReversal.reversalOf === payload.transactionId
        && String(existingReversal.note || "") === String(payload.reason || "").trim();
      if (!samePayload) throw new Error("Khóa thao tác hoàn tác đã được dùng cho một yêu cầu khác.");
      const existingProduct = store.products.find((product) => product.id === existingReversal.productId);
      if (!existingProduct) throw new Error("Giao dịch hoàn tác đã tồn tại nhưng vật liệu không còn trong dữ liệu.");
      return clone({ product: existingProduct, transaction: existingReversal, duplicate: true });
    }

    const originalIndex = store.transactions.findIndex((transaction) => transaction.id === payload.transactionId);
    if (originalIndex < 0) throw new Error("Không tìm thấy giao dịch cần hoàn tác.");
    const original = store.transactions[originalIndex];
    const actor = assertStorePermission(store, PERMISSIONS.reverseTransaction, original.categoryId);
    if (original.type === TRANSACTION_TYPES.reverse || original.type === TRANSACTION_TYPES.initial) {
      throw new Error("Không hỗ trợ hoàn tác giao dịch khởi tạo hoặc một giao dịch hoàn tác.");
    }
    if (original.reversalTransactionId || original.reversedAt) throw new Error("Giao dịch này đã được hoàn tác trước đó.");

    const latest = store.transactions.find((transaction) => transaction.productId === original.productId);
    if (!latest || latest.id !== original.id) {
      throw new Error("Chỉ được hoàn tác giao dịch mới nhất của vật liệu để không làm sai chuỗi tồn kho.");
    }

    const productIndex = store.products.findIndex((product) => product.id === original.productId && !product.archived);
    if (productIndex < 0) throw new Error("Vật liệu không còn khả dụng để hoàn tác giao dịch.");
    const product = store.products[productIndex];
    if (!quantitiesEqual(product.quantity, original.afterQuantity)) {
      throw new Error("Tồn hiện tại không khớp giao dịch gốc. Hãy tải lại dữ liệu và kiểm tra lịch sử.");
    }

    const reason = String(payload.reason || "").trim();
    if (!reason) throw new Error("Vui lòng nhập lý do hoàn tác.");
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
    invalidateMonthlyAnalysis();
    setAuthenticatedAccount(result.profile);
    return true;
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
    return false;
  } finally {
    if (isCurrentRequest("bootstrap", requestId)) {
      appState.loading.bootstrap = false;
      if (render) renderApp();
    }
  }
}

async function loadTransactions({ render = false, limit = 50, silent = false } = {}) {
  if (appState.auth.status !== "signedIn") return false;
  const requestId = nextRequestId("transactions");
  appState.loading.transactions = true;
  if (render) renderApp();
  try {
    const result = await dataService.listTransactions({ limit });
    if (!isCurrentRequest("transactions", requestId)) return false;
    appState.cache.transactions = Array.isArray(result) ? result : Array.isArray(result?.items) ? result.items : [];
    appState.cache.loaded.transactions = true;
    return true;
  } catch (error) {
    if (!silent) showToast("error", "Không tải được lịch sử gần đây", error.message);
    return false;
  } finally {
    if (isCurrentRequest("transactions", requestId)) {
      appState.loading.transactions = false;
      if (render) renderApp();
    }
  }
}

function historyEffectiveRange() {
  const filters = appState.filters.history;
  if (filters.from || filters.to) return { from: filters.from || null, to: filters.to || null, custom: true };
  const range = monthDateRange(filters.month || currentMonthKey());
  return { ...range, custom: false };
}

function historyQueryKey() {
  const filters = appState.filters.history;
  const range = historyEffectiveRange();
  return JSON.stringify({
    type: filters.type || "all",
    category: filters.category || "all",
    from: range.from || "",
    to: range.to || "",
  });
}

async function loadHistoryTransactions({ reset = true, loadAll = false, render = false, silent = false } = {}) {
  if (appState.auth.status !== "signedIn" || !hasPermission(PERMISSIONS.viewHistory)) return false;
  const requestId = nextRequestId("history-transactions");
  appState.loading.historyTransactions = true;
  if (render) renderApp();
  const queryKey = historyQueryKey();
  const range = historyEffectiveRange();
  let items = reset || appState.cache.historyMeta.queryKey !== queryKey ? [] : [...appState.cache.historyTransactions];
  let offset = reset || appState.cache.historyMeta.queryKey !== queryKey ? 0 : appState.cache.historyMeta.nextOffset;
  if (!reset && offset === null) {
    appState.loading.historyTransactions = false;
    return true;
  }

  try {
    let total = reset ? 0 : appState.cache.historyMeta.total;
    let nextOffset = offset;
    do {
      const result = await dataService.listTransactions({
        limit: HISTORY_PAGE_SIZE,
        offset: nextOffset || 0,
        categoryId: appState.filters.history.category !== "all" ? appState.filters.history.category : null,
        type: appState.filters.history.type !== "all" ? appState.filters.history.type : null,
        from: range.from || null,
        to: range.to || null,
      });
      if (!isCurrentRequest("history-transactions", requestId)) return false;
      const pageItems = Array.isArray(result) ? result : Array.isArray(result?.items) ? result.items : [];
      const byId = new Map(items.map((transaction) => [transaction.id, transaction]));
      pageItems.forEach((transaction) => byId.set(transaction.id, transaction));
      items = [...byId.values()].sort((left, right) => {
        const timeDiff = new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
        return timeDiff || String(right.id).localeCompare(String(left.id));
      });
      total = Array.isArray(result) ? Math.max(total, items.length) : Math.max(0, Number(result?.total ?? items.length));
      nextOffset = Array.isArray(result) ? (pageItems.length >= HISTORY_PAGE_SIZE ? items.length : null) : (result?.nextOffset ?? null);
      if (!loadAll) break;
    } while (nextOffset !== null);

    appState.cache.historyTransactions = items;
    appState.cache.historyMeta = { total, nextOffset, allLoaded: nextOffset === null, queryKey };
    appState.cache.loaded.historyTransactions = true;
    return true;
  } catch (error) {
    if (!silent) showToast("error", "Không tải được lịch sử", error.message);
    return false;
  } finally {
    if (isCurrentRequest("history-transactions", requestId)) {
      appState.loading.historyTransactions = false;
      if (render) renderApp();
    }
  }
}

async function loadAccountData({ render = false, silent = false } = {}) {
  if (!hasPermission(PERMISSIONS.manageAccounts)) return false;
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
    return true;
  } catch (error) {
    if (!silent) showToast("error", "Không tải được dữ liệu tài khoản", error.message);
    return false;
  } finally {
    if (isCurrentRequest("accounts", requestId)) {
      appState.loading.accounts = false;
      if (render) renderApp();
    }
  }
}

async function refreshInventoryAndHistory({ render = true } = {}) {
  await loadBootstrap({ render: false });
  if (appState.auth.status === "signedIn") {
    await loadTransactions({ render: false, limit: 50 });
    if (appState.screen === SCREENS.history && hasPermission(PERMISSIONS.viewHistory)) {
      if (appState.filters.history.view === "analysis") await loadMonthlyAnalysis({ render: false, silent: true, force: true });
      else await loadHistoryTransactions({ reset: true, loadAll: Boolean(appState.filters.history.search), render: false, silent: true });
    }
  }
  if (render) renderApp();
}

function realtimeStatusMeta() {
  if (dataService.mode !== "supabase") return { hidden: true, state: "local", label: "" };
  if (!navigator.onLine || appState.realtime.status === "offline") return { hidden: false, state: "offline", label: "Mất mạng" };
  if (appState.realtime.status === "error") return { hidden: false, state: "error", label: "Đang kết nối lại" };
  return { hidden: true, state: "online", label: "" };
}

function renderRealtimeStatusLine() {
  const meta = realtimeStatusMeta();
  return `<div class="status-line" data-realtime-status="true" data-state="${meta.state}" ${meta.hidden ? "hidden" : ""}><span class="status-dot"></span><span>${escapeHTML(meta.label)}</span></div>`;
}

function updateRealtimeStatusLine() {
  const line = $("[data-realtime-status='true']");
  if (!line) return;
  const meta = realtimeStatusMeta();
  line.dataset.state = meta.state;
  line.hidden = meta.hidden;
  const label = line.querySelector("span:last-child");
  if (label) label.textContent = meta.label;
}

function setRealtimeStatus(status) {
  appState.realtime.status = status;
  updateRealtimeStatusLine();
}

function scheduleRealtimeRefresh(wait = 180) {
  if (appState.auth.status !== "signedIn" || dataService.mode !== "supabase") return;
  appState.realtime.refreshPending = true;
  if (appState.realtime.refreshInFlight || appState.realtime.refreshTimer) return;
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
    appState.realtime.refreshPending = true;
    return;
  }

  appState.realtime.refreshPending = false;
  appState.realtime.refreshInFlight = true;
  let ok = true;
  let retryAfter = 0;
  try {
    ok = Boolean(await loadBootstrap({ render: false, silent: true }));
    if (!ok || appState.auth.status !== "signedIn") {
      if (appState.auth.status !== "signedIn") {
        closeModal(true);
        renderApp();
      } else {
        setRealtimeStatus("error");
        retryAfter = 4000;
      }
      return;
    }
    if (hasPermission(PERMISSIONS.viewHistory)) {
      ok = Boolean(await loadTransactions({ render: false, limit: 50, silent: true })) && ok;
      if (appState.screen === SCREENS.history) {
        if (appState.filters.history.view === "analysis") ok = Boolean(await loadMonthlyAnalysis({ render: false, silent: true, force: true })) && ok;
        else ok = Boolean(await loadHistoryTransactions({ reset: true, loadAll: Boolean(appState.filters.history.search), render: false, silent: true })) && ok;
      }
    }
    if (appState.screen === SCREENS.manage && appState.manageTab === MANAGE_TABS.accounts && hasPermission(PERMISSIONS.manageAccounts)) {
      ok = Boolean(await loadAccountData({ render: false, silent: true })) && ok;
    }
    setRealtimeStatus(ok ? "connected" : "error");
    if (!ok) retryAfter = 4000;
    renderApp();
    if (appState.ui.modalName === "transaction-form") updateTransactionPreview();
  } finally {
    appState.realtime.refreshInFlight = false;
    if (appState.auth.status === "signedIn") {
      if (appState.realtime.refreshPending) scheduleRealtimeRefresh(120);
      else if (retryAfter) scheduleRealtimeRefresh(retryAfter);
    }
  }
}

function clearRealtimeReconnectTimer() {
  clearTimeout(appState.realtime.reconnectTimer);
  appState.realtime.reconnectTimer = null;
}

function scheduleRealtimeReconnect(wait = 1800) {
  if (dataService.mode !== "supabase" || appState.auth.status !== "signedIn" || !navigator.onLine || appState.realtime.stopping || appState.realtime.reconnectTimer) return;
  appState.realtime.reconnectTimer = window.setTimeout(async () => {
    appState.realtime.reconnectTimer = null;
    if (appState.auth.status !== "signedIn" || !navigator.onLine || appState.realtime.stopping) return;

    const unsubscribe = appState.realtime.unsubscribe;
    appState.realtime.unsubscribe = null;
    appState.realtime.stopping = true;
    try {
      if (unsubscribe) await unsubscribe();
      else if (typeof dataService.unsubscribeRealtime === "function") await dataService.unsubscribeRealtime();
    } catch { /* Reconnect cleanup is best-effort. */ }
    finally { appState.realtime.stopping = false; }

    if (appState.auth.status === "signedIn" && navigator.onLine) startRealtimeSync();
  }, wait);
}

function handleRealtimeStatus(status) {
  if (appState.realtime.stopping) return;
  if (status === "SUBSCRIBED") {
    clearRealtimeReconnectTimer();
    appState.realtime.hasSubscribed = true;
    setRealtimeStatus("connected");
    // Refetch ngay sau khi subscribe de dong khe ho event giua lan tai dau va luc WebSocket san sang.
    scheduleRealtimeRefresh(60);
    return;
  }
  if (status === "DISABLED") {
    clearRealtimeReconnectTimer();
    setRealtimeStatus("idle");
    return;
  }
  if (["CHANNEL_ERROR", "TIMED_OUT", "CLOSED"].includes(status)) {
    appState.realtime.hasSubscribed = false;
    setRealtimeStatus(navigator.onLine ? "error" : "offline");
    if (navigator.onLine) scheduleRealtimeReconnect(status === "CLOSED" ? 900 : 1800);
  }
}

async function stopRealtimeSync() {
  clearTimeout(appState.realtime.refreshTimer);
  appState.realtime.refreshTimer = null;
  clearRealtimeReconnectTimer();
  appState.realtime.refreshPending = false;
  appState.realtime.hasSubscribed = false;
  appState.realtime.stopping = true;
  const unsubscribe = appState.realtime.unsubscribe;
  appState.realtime.unsubscribe = null;
  try {
    if (unsubscribe) await unsubscribe();
    else if (typeof dataService.unsubscribeRealtime === "function") await dataService.unsubscribeRealtime();
  } catch { /* Cleanup only. */ }
  finally { appState.realtime.stopping = false; }
  setRealtimeStatus(navigator.onLine ? "idle" : "offline");
}

function startRealtimeSync() {
  if (dataService.mode !== "supabase" || appState.auth.status !== "signedIn" || typeof dataService.subscribeRealtime !== "function") return;
  if (appState.realtime.unsubscribe || !navigator.onLine) {
    if (!navigator.onLine) setRealtimeStatus("offline");
    return;
  }
  setRealtimeStatus("connecting");
  appState.realtime.unsubscribe = dataService.subscribeRealtime({
    onEvent: () => scheduleRealtimeRefresh(140),
    onStatus: handleRealtimeStatus,
  });
}

function invalidatePendingDataRequests() {
  ["bootstrap", "transactions", "history-transactions", "monthly-analysis", "accounts", "accountAudit"].forEach((key) => nextRequestId(key));
}

function bindRealtimeLifecycle() {
  window.addEventListener("offline", () => {
    appState.realtime.hasSubscribed = false;
    clearRealtimeReconnectTimer();
    setRealtimeStatus("offline");
  });
  window.addEventListener("online", () => {
    if (appState.auth.status !== "signedIn") return;
    if (!appState.realtime.unsubscribe) startRealtimeSync();
    else if (!appState.realtime.hasSubscribed) scheduleRealtimeReconnect(100);
    scheduleRealtimeRefresh(80);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden || appState.auth.status !== "signedIn" || !navigator.onLine) return;
    if (!appState.realtime.unsubscribe) startRealtimeSync();
    else if (!appState.realtime.hasSubscribed) scheduleRealtimeReconnect(150);
    scheduleRealtimeRefresh(120);
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
    [SCREENS.inventory]: ["Kho", "Kho Khuôn Bế"],
    [SCREENS.history]: ["Lịch sử", "Giao dịch kho"],
    [SCREENS.manage]: ["Cài đặt", roleLabel(appState.currentUser.role)],
  };
  return map[appState.screen] || map[SCREENS.inventory];
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
            <button class="icon-btn" type="button" data-action="open-faq" aria-label="Hướng dẫn sử dụng">
              ${icon("help")}
            </button>
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
  if (appState.screen === SCREENS.history) return renderHistoryScreen();
  if (appState.screen === SCREENS.manage) return renderManageScreen();
  return renderInventoryScreen();
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
    [SCREENS.inventory, "inventory", "Kho"],
    [SCREENS.history, "history", "Lịch sử"],
    [SCREENS.manage, "manage", "Cài đặt"],
  ];
  return `<nav class="bottom-nav" aria-label="Điều hướng chính">
    ${items.map(([key, iconName, label]) => {
      const active = appState.screen === key;
      return `<button class="nav-item" type="button" data-nav="${key}" ${active ? 'aria-current="page"' : ""} aria-label="${escapeHTML(label)}">
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


const PDF_INVENTORY_FIELDS = Object.freeze([
  ["name", "Tên vật liệu"],
  ["quantity", "Tồn hiện tại"],
  ["unit", "Đơn vị"],
  ["status", "Tình trạng"],
  ["note", "Ghi chú"],
  ["updatedAt", "Ngày cập nhật"],
]);

const PDF_HISTORY_FIELDS = Object.freeze([
  ["createdAt", "Ngày giờ"],
  ["product", "Vật liệu"],
  ["type", "Thao tác"],
  ["amount", "Số lượng"],
  ["balance", "Tồn trước → sau"],
  ["actor", "Người thực hiện"],
  ["note", "Ghi chú"],
]);

const DEFAULT_PDF_PREFERENCES = Object.freeze({
  inventory: {
    scope: "filtered",
    orientation: "landscape",
    fields: ["name", "quantity", "unit", "status"],
    compactDetails: false,
    attributesByCategory: {},
  },
  history: {
    orientation: "landscape",
    fields: ["createdAt", "product", "type", "amount", "balance"],
    compactDetails: false,
    attributesByCategory: {},
  },
});

function clonePdfPreferencesDefaults() {
  return JSON.parse(JSON.stringify(DEFAULT_PDF_PREFERENCES));
}

function readPdfPreferences() {
  const fallback = clonePdfPreferencesDefaults();
  try {
    const parsed = JSON.parse(safeStorage.getItem(STORAGE_KEYS.pdfPreferences) || "null");
    if (!parsed || typeof parsed !== "object") return fallback;
    for (const kind of ["inventory", "history"]) {
      const source = parsed[kind];
      if (!source || typeof source !== "object") continue;
      fallback[kind] = {
        ...fallback[kind],
        ...source,
        fields: Array.isArray(source.fields) ? source.fields.filter((field) => typeof field === "string") : fallback[kind].fields,
        attributesByCategory: source.attributesByCategory && typeof source.attributesByCategory === "object" ? source.attributesByCategory : {},
      };
    }
  } catch {
    // Tùy chọn PDF chỉ là cài đặt trên thiết bị; lỗi đọc không được ảnh hưởng dữ liệu kho.
  }
  return fallback;
}

function writePdfPreferences(kind, value) {
  const preferences = readPdfPreferences();
  preferences[kind] = { ...preferences[kind], ...value };
  safeStorage.setItem(STORAGE_KEYS.pdfPreferences, JSON.stringify(preferences));
}

function pdfCheckbox({ name, value, label, checked = false, disabled = false }) {
  return `<label class="pdf-option"><input type="checkbox" name="${escapeHTML(name)}" value="${escapeHTML(value)}" ${checked ? "checked" : ""} ${disabled ? "disabled" : ""}><span>${escapeHTML(label)}</span></label>`;
}

function pdfRadio({ name, value, label, checked = false }) {
  return `<label class="pdf-option"><input type="radio" name="${escapeHTML(name)}" value="${escapeHTML(value)}" ${checked ? "checked" : ""}><span>${escapeHTML(label)}</span></label>`;
}

function pdfFieldSelection(fields, selected, { disabledFields = new Set() } = {}) {
  const selectedSet = new Set(selected || []);
  return fields.map(([value, label]) => pdfCheckbox({
    name: "fields",
    value,
    label,
    checked: selectedSet.has(value),
    disabled: disabledFields.has(value),
  })).join("");
}

function inventoryPdfProducts(scope = "filtered") {
  const products = scope === "all" ? visibleProducts() : filteredProducts();
  return [...products].sort((left, right) => productDisplayName(left).localeCompare(productDisplayName(right), "vi"));
}

function pdfSingleCategoryForProducts(products) {
  const categoryIds = [...new Set((products || []).map((product) => product.categoryId).filter(Boolean))];
  return categoryIds.length === 1 ? categoryById(categoryIds[0]) : null;
}

function pdfAttributeSelectionHTML(kind, category, preferences) {
  if (category && !hasPermission(PERMISSIONS.viewDetail, category.id)) return "";
  if (!category) {
    if (!hasPermission(PERMISSIONS.viewDetail)) return "";
    const checked = Boolean(preferences?.compactDetails);
    return `<div class="pdf-attribute-options"><div class="pdf-section-label">Thông số</div>${pdfCheckbox({ name: "compactDetails", value: "1", label: "Thông số chi tiết (gộp 1 cột)", checked })}</div>`;
  }
  const attributes = orderedCategoryAttributes(category, { activeOnly: kind !== "history" });
  if (!attributes.length && kind !== "history") return "";
  const selected = new Set(preferences?.attributesByCategory?.[category.id] || []);
  const compactOption = kind === "history"
    ? pdfCheckbox({ name: "compactDetails", value: "1", label: "Thông số chi tiết (gộp 1 cột)", checked: Boolean(preferences?.compactDetails) })
    : "";
  return `<div class="pdf-attribute-options"><div class="pdf-section-label">Thông số ${escapeHTML(category.name)}</div>${compactOption}${attributes.length ? `<div class="pdf-options-grid" style="margin-top:${kind === "history" ? "7px" : "0"}">${attributes.map((attribute) => pdfCheckbox({
    name: "attributes",
    value: attribute.id,
    label: attribute.name,
    checked: selected.has(attribute.id),
  })).join("")}</div>` : ""}</div>`;
}

function inventoryPdfProductMeta(product) {
  const category = categoryById(product.categoryId);
  const parts = [category?.name || "Chưa phân nhóm"];
  if (hasPermission(PERMISSIONS.viewQuantity, product.categoryId)) {
    parts.push(`${formatQuantity(product.quantity)} ${product.unit || ""}`.trim());
  }
  return parts.filter(Boolean).join(" · ");
}

function inventoryPdfProductSelectionHTML(products, selectedIds = null) {
  const source = Array.isArray(products) ? products : [];
  const selected = selectedIds === null
    ? new Set(source.map((product) => String(product.id)))
    : new Set((selectedIds || []).map(String));
  const selectedCount = source.filter((product) => selected.has(String(product.id))).length;
  return `<div class="pdf-product-selection">
    <div class="pdf-product-selection-head">
      <div><div class="pdf-section-label" style="margin-bottom:2px">Vật liệu cần xuất</div><div id="pdf-product-selection-count" class="pdf-selection-count">${selectedCount} / ${source.length} đã chọn</div></div>
      <div class="pdf-selection-actions">
        <button class="pdf-selection-action" type="button" data-action="pdf-select-all-products">Chọn tất cả</button>
        <button class="pdf-selection-action" type="button" data-action="pdf-clear-products">Bỏ chọn</button>
      </div>
    </div>
    <div id="pdf-inventory-products" class="pdf-product-list">
      ${source.length ? source.map((product) => `<label class="pdf-product-option">
        <input type="checkbox" name="productIds" value="${escapeHTML(product.id)}" ${selected.has(String(product.id)) ? "checked" : ""}>
        <span class="pdf-product-copy"><span class="pdf-product-name">${escapeHTML(productDisplayName(product))}</span><span class="pdf-product-meta">${escapeHTML(inventoryPdfProductMeta(product))}</span></span>
      </label>`).join("") : `<div class="pdf-product-empty">Không có vật liệu phù hợp với bộ lọc hiện tại.</div>`}
    </div>
  </div>`;
}

function updateInventoryPdfProductSelectionCount() {
  const form = $("#pdf-inventory-form");
  const count = $("#pdf-product-selection-count", form || document);
  if (!form || !count) return;
  const total = $$('input[name="productIds"]', form).length;
  const selected = $$('input[name="productIds"]:checked', form).length;
  count.textContent = `${selected} / ${total} đã chọn`;
}

function updateInventoryPdfProductOptions() {
  const form = $("#pdf-inventory-form");
  const container = $("#pdf-inventory-product-selection", form || document);
  if (!form || !container) return;
  const scope = String(new FormData(form).get("scope") || "filtered");
  container.innerHTML = inventoryPdfProductSelectionHTML(inventoryPdfProducts(scope));
}

function updateInventoryPdfAttributeOptions() {
  const form = $("#pdf-inventory-form");
  const container = $("#pdf-inventory-attributes", form || document);
  if (!form || !container) return;
  const scope = String(new FormData(form).get("scope") || "filtered");
  const category = pdfSingleCategoryForProducts(inventoryPdfProducts(scope));
  const preferences = readPdfPreferences().inventory;
  container.innerHTML = pdfAttributeSelectionHTML("inventory", category, preferences);
}

function openInventoryPdfModal() {
  const preferences = readPdfPreferences().inventory;
  const visible = visibleProducts();
  if (!visible.length) return showToast("info", "Không có vật liệu để xuất");
  const canViewAnyQuantity = visible.some((product) => hasPermission(PERMISSIONS.viewQuantity, product.categoryId));
  const disabledFields = canViewAnyQuantity ? new Set() : new Set(["quantity", "status"]);
  const initialProducts = inventoryPdfProducts("filtered");
  const initialCategory = pdfSingleCategoryForProducts(initialProducts);
  openModal({
    name: "pdf-inventory",
    title: "Xuất PDF tồn kho",
    subtitle: "Chọn vật liệu và thông tin cần xuất.",
    body: `<form id="pdf-inventory-form" class="field-grid pdf-form" novalidate>
      <div><div class="pdf-section-label">Phạm vi</div><div class="pdf-options-grid pdf-options-grid-two">
        ${pdfRadio({ name: "scope", value: "filtered", label: `Kết quả đang lọc (${filteredProducts().length})`, checked: true })}
        ${pdfRadio({ name: "scope", value: "all", label: `Toàn bộ kho (${visible.length})`, checked: false })}
      </div></div>
      <div id="pdf-inventory-product-selection">${inventoryPdfProductSelectionHTML(initialProducts)}</div>
      <div><div class="pdf-section-label">Thông tin</div><div class="pdf-options-grid">${pdfFieldSelection(PDF_INVENTORY_FIELDS, preferences.fields, { disabledFields })}</div></div>
      <div id="pdf-inventory-attributes">${pdfAttributeSelectionHTML("inventory", initialCategory, preferences)}</div>
      <div><div class="pdf-section-label">Khổ giấy</div><div class="pdf-options-grid pdf-options-grid-two">
        ${pdfRadio({ name: "orientation", value: "portrait", label: "A4 dọc", checked: preferences.orientation === "portrait" })}
        ${pdfRadio({ name: "orientation", value: "landscape", label: "A4 ngang", checked: preferences.orientation !== "portrait" })}
      </div></div>
    </form>`,
    footer: `<button class="btn btn-secondary" type="button" data-action="close-modal">Hủy</button><button class="btn btn-primary" type="submit" form="pdf-inventory-form">Xuất PDF</button>`,
  });
}

function historyPdfCategory() {
  const categoryId = appState.filters.history.category;
  if (!categoryId || categoryId === "all") return null;
  const category = categoryById(categoryId);
  return category && hasPermission(PERMISSIONS.viewHistory, category.id) ? category : null;
}

function openHistoryPdfModal() {
  const preferences = readPdfPreferences().history;
  const category = historyPdfCategory();
  openModal({
    name: "pdf-history",
    title: "Xuất PDF lịch sử",
    subtitle: `${formatMonthLabel(appState.filters.history.month)} · theo bộ lọc hiện tại`,
    body: `<form id="pdf-history-form" class="field-grid pdf-form" novalidate>
      <div><div class="pdf-section-label">Thông tin</div><div class="pdf-options-grid">${pdfFieldSelection(PDF_HISTORY_FIELDS, preferences.fields)}</div></div>
      <div id="pdf-history-attributes">${pdfAttributeSelectionHTML("history", category, preferences)}</div>
      <div><div class="pdf-section-label">Khổ giấy</div><div class="pdf-options-grid pdf-options-grid-two">
        ${pdfRadio({ name: "orientation", value: "portrait", label: "A4 dọc", checked: preferences.orientation === "portrait" })}
        ${pdfRadio({ name: "orientation", value: "landscape", label: "A4 ngang", checked: preferences.orientation !== "portrait" })}
      </div></div>
    </form>`,
    footer: `<button class="btn btn-secondary" type="button" data-action="close-modal">Hủy</button><button class="btn btn-primary" type="submit" form="pdf-history-form">Xuất PDF</button>`,
  });
}

function readPdfFormSelection(form, kind) {
  const data = new FormData(form);
  const fields = [...new Set(data.getAll("fields").map(String).filter(Boolean))];
  const attributes = [...new Set(data.getAll("attributes").map(String).filter(Boolean))];
  if (!fields.length && !attributes.length && data.get("compactDetails") !== "1") {
    throw new Error("Hãy chọn ít nhất một thông tin để xuất.");
  }
  const orientation = data.get("orientation") === "portrait" ? "portrait" : "landscape";
  const result = { fields, orientation, compactDetails: data.get("compactDetails") === "1", attributes };
  if (kind === "inventory") {
    result.scope = data.get("scope") === "all" ? "all" : "filtered";
    result.productIds = [...new Set(data.getAll("productIds").map(String).filter(Boolean))];
    if (!result.productIds.length) throw new Error("Hãy chọn ít nhất một vật liệu cần xuất.");
  }
  return result;
}

function savePdfFormPreferences(kind, selection, category = null) {
  const current = readPdfPreferences()[kind];
  const attributesByCategory = { ...(current.attributesByCategory || {}) };
  if (category) attributesByCategory[category.id] = [...selection.attributes];
  writePdfPreferences(kind, {
    ...(kind === "inventory" ? { scope: selection.scope } : {}),
    orientation: selection.orientation,
    fields: [...selection.fields],
    compactDetails: Boolean(selection.compactDetails),
    attributesByCategory,
  });
}

function formatPdfDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function inventoryPdfFilterSummary(scope) {
  if (scope === "all") return "Toàn bộ kho trong phạm vi tài khoản được phép xem";
  const filters = appState.filters.inventory;
  const parts = [];
  if (String(filters.search || "").trim()) parts.push(`Từ khóa: ${String(filters.search).trim()}`);
  if (filters.category !== "all") parts.push(`Nhóm: ${categoryById(filters.category)?.name || filters.category}`);
  if (filters.status !== "all") parts.push(`Tình trạng: ${({ ok: "Đủ hàng", low: "Sắp hết", out: "Hết hàng" })[filters.status] || filters.status}`);
  if (String(filters.quantityBelow ?? "").trim() !== "") parts.push(`Số lượng dưới: ${filters.quantityBelow}`);
  return parts.length ? parts.join(" · ") : "Tất cả vật liệu đang hiển thị";
}

function historyPdfFilterSummary() {
  const filters = appState.filters.history;
  const range = historyEffectiveRange();
  const parts = [`${formatDateOnlyForPdf(range.from)} – ${formatDateOnlyForPdf(range.to)}`];
  if (filters.type !== "all") parts.push(TRANSACTION_LABELS[filters.type] || filters.type);
  if (filters.category !== "all") parts.push(categoryById(filters.category)?.name || filters.category);
  if (String(filters.search || "").trim()) parts.push(`Từ khóa: ${String(filters.search).trim()}`);
  return parts.join(" · ");
}

function formatDateOnlyForPdf(value) {
  if (!value) return "—";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
  return match ? `${match[3]}/${match[2]}/${match[1]}` : String(value);
}

function compactProductDetailsForPdf(product) {
  if (!product || !hasPermission(PERMISSIONS.viewDetail, product.categoryId)) return "—";
  const category = categoryById(product.categoryId);
  if (!category) return "—";
  const entries = orderedCategoryAttributes(category)
    .map((attribute) => {
      const value = product.attributes?.[attribute.id];
      if (value === "" || value === null || value === undefined) return "";
      return `${attribute.name}: ${attributeDisplayValue(attribute, value)}`;
    })
    .filter(Boolean);
  return entries.length ? entries.join(" · ") : "—";
}

function compactTransactionDetailsForPdf(transaction) {
  if (!transaction || !hasPermission(PERMISSIONS.viewDetail, transaction.categoryId)) return "—";
  const attributes = Array.isArray(transaction.productSnapshot?.attributes) ? transaction.productSnapshot.attributes : [];
  const entries = attributes
    .filter((attribute) => attribute?.value !== "" && attribute?.value !== null && attribute?.value !== undefined)
    .map((attribute) => `${attribute.name || "Thông số"}: ${attribute.value}${attribute.unit ? ` ${attribute.unit}` : ""}`);
  return entries.length ? entries.join(" · ") : "—";
}

function transactionPdfAmount(transaction) {
  const delta = normalizeQuantity(transaction.afterQuantity - transaction.beforeQuantity, 0);
  return `${delta > 0 ? "+" : delta < 0 ? "−" : ""}${formatQuantity(Math.abs(delta))} ${transaction.unit || ""}`.trim();
}

function buildInventoryPdfReport(products, selection) {
  const fields = new Set(selection.fields);
  const category = pdfSingleCategoryForProducts(products);
  const attributes = category && hasPermission(PERMISSIONS.viewDetail, category.id)
    ? orderedCategoryAttributes(category).filter((attribute) => selection.attributes.includes(attribute.id))
    : [];
  const columns = [{ key: "index", label: "STT" }];
  PDF_INVENTORY_FIELDS.forEach(([key, label]) => { if (fields.has(key)) columns.push({ key, label }); });
  if (selection.compactDetails && !attributes.length) columns.push({ key: "details", label: "Thông số" });
  attributes.forEach((attribute) => columns.push({ key: `attr:${attribute.id}`, label: attribute.name, attribute }));

  const rows = products.map((product, index) => columns.map((column) => {
    if (column.key === "index") return String(index + 1);
    if (column.key === "name") return productDisplayName(product);
    if (column.key === "quantity") return hasPermission(PERMISSIONS.viewQuantity, product.categoryId) ? formatQuantity(product.quantity) : "—";
    if (column.key === "unit") return product.unit || "—";
    if (column.key === "status") return hasPermission(PERMISSIONS.viewQuantity, product.categoryId) ? productStatus(product).label : "—";
    if (column.key === "note") return hasPermission(PERMISSIONS.viewDetail, product.categoryId) ? (product.note || "—") : "—";
    if (column.key === "updatedAt") return formatPdfDate(product.updatedAt || product.createdAt);
    if (column.key === "details") return compactProductDetailsForPdf(product);
    if (column.attribute) return hasPermission(PERMISSIONS.viewDetail, product.categoryId)
      ? attributeDisplayValue(column.attribute, product.attributes?.[column.attribute.id])
      : "—";
    return "—";
  }));

  const totals = new Map();
  if (fields.has("quantity")) {
    products.forEach((product) => {
      if (!hasPermission(PERMISSIONS.viewQuantity, product.categoryId)) return;
      const unit = String(product.unit || "Đơn vị");
      totals.set(unit, normalizeQuantity((totals.get(unit) || 0) + normalizeQuantity(product.quantity, 0), 0));
    });
  }
  const summary = totals.size
    ? `Tổng theo đơn vị: ${[...totals.entries()].map(([unit, value]) => `${formatQuantity(value)} ${unit}`).join(" · ")}`
    : "";
  return {
    title: "KHO KHUÔN BẾ – DANH SÁCH TỒN KHO",
    subtitle: inventoryPdfFilterSummary(selection.scope),
    columns,
    rows,
    summary,
  };
}

async function fetchAllHistoryForPdf() {
  const range = historyEffectiveRange();
  const filters = appState.filters.history;
  let offset = 0;
  let nextOffset = 0;
  let items = [];
  do {
    const result = await dataService.listTransactions({
      limit: 200,
      offset,
      categoryId: filters.category !== "all" ? filters.category : null,
      type: filters.type !== "all" ? filters.type : null,
      from: range.from || null,
      to: range.to || null,
    });
    const pageItems = Array.isArray(result) ? result : Array.isArray(result?.items) ? result.items : [];
    const byId = new Map(items.map((transaction) => [transaction.id, transaction]));
    pageItems.forEach((transaction) => byId.set(transaction.id, transaction));
    items = [...byId.values()];
    nextOffset = Array.isArray(result)
      ? (pageItems.length >= 200 ? offset + pageItems.length : null)
      : (result?.nextOffset ?? null);
    offset = nextOffset === null ? 0 : Number(nextOffset) || 0;
  } while (nextOffset !== null);

  items.sort((left, right) => {
    const timeDiff = new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    return timeDiff || String(right.id).localeCompare(String(left.id));
  });
  const tokens = searchTokens(filters.search);
  if (!tokens.length) return items;
  return items.filter((transaction) => {
    const haystack = transactionSearchText(transaction);
    return tokens.every((token) => haystack.includes(token));
  });
}

function buildHistoryPdfReport(transactions, selection) {
  const fields = new Set(selection.fields);
  const category = historyPdfCategory();
  const attributes = category && hasPermission(PERMISSIONS.viewDetail, category.id)
    ? orderedCategoryAttributes(category, { activeOnly: false }).filter((attribute) => selection.attributes.includes(attribute.id))
    : [];
  const columns = [{ key: "index", label: "STT" }];
  PDF_HISTORY_FIELDS.forEach(([key, label]) => { if (fields.has(key)) columns.push({ key, label }); });
  if (selection.compactDetails) columns.push({ key: "details", label: "Thông số" });
  attributes.forEach((attribute) => columns.push({ key: `attr:${attribute.id}`, label: attribute.name, attribute }));

  const rows = transactions.map((transaction, index) => columns.map((column) => {
    if (column.key === "index") return String(index + 1);
    if (column.key === "createdAt") return formatDateTime(transaction.createdAt);
    if (column.key === "product") return transaction.productName || "—";
    if (column.key === "type") return TRANSACTION_LABELS[transaction.type] || transaction.type || "—";
    if (column.key === "amount") return transactionPdfAmount(transaction);
    if (column.key === "balance") return `${formatQuantity(transaction.beforeQuantity)} → ${formatQuantity(transaction.afterQuantity)} ${transaction.unit || ""}`.trim();
    if (column.key === "actor") return transaction.actor || "—";
    if (column.key === "note") return transaction.note || "—";
    if (column.key === "details") return compactTransactionDetailsForPdf(transaction);
    if (column.attribute) {
      if (!hasPermission(PERMISSIONS.viewDetail, transaction.categoryId)) return "—";
      const snapshotAttribute = (transaction.productSnapshot?.attributes || []).find((attribute) => attribute?.id === column.attribute.id);
      if (!snapshotAttribute || snapshotAttribute.value === "" || snapshotAttribute.value === null || snapshotAttribute.value === undefined) return "—";
      return `${snapshotAttribute.value}${snapshotAttribute.unit ? ` ${snapshotAttribute.unit}` : ""}`;
    }
    return "—";
  }));
  return {
    title: "KHO KHUÔN BẾ – LỊCH SỬ GIAO DỊCH",
    subtitle: historyPdfFilterSummary(),
    columns,
    rows,
    summary: `${transactions.length} giao dịch`,
  };
}

function ensurePrintRoot() {
  let root = $("#kb2-print-root");
  if (!root) {
    root = document.createElement("section");
    root.id = "kb2-print-root";
    root.className = "kb2-print-root";
    root.setAttribute("aria-hidden", "true");
    document.body.appendChild(root);
  }
  return root;
}

function renderPdfReport(report) {
  const root = ensurePrintRoot();
  const generatedAt = formatDateTime(new Date());
  const head = report.columns.map((column) => `<th>${escapeHTML(column.label)}</th>`).join("");
  const body = report.rows.length
    ? report.rows.map((row) => `<tr>${row.map((value) => `<td>${escapeHTML(value ?? "—")}</td>`).join("")}</tr>`).join("")
    : `<tr><td colspan="${report.columns.length}">Không có dữ liệu phù hợp.</td></tr>`;
  root.innerHTML = `<div class="print-report">
    <header class="print-report-head"><h1>${escapeHTML(report.title)}</h1><div class="print-meta">Thời điểm xuất: ${escapeHTML(generatedAt)}</div><div class="print-filter">${escapeHTML(report.subtitle || "")}</div></header>
    <table class="print-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
    ${report.summary ? `<div class="print-summary">${escapeHTML(report.summary)}</div>` : ""}
    <footer class="print-footer">Kho Khuôn Bế · v${escapeHTML(APP_VERSION)}</footer>
  </div>`;
  return root;
}

function printPdfReport(report, orientation = "landscape") {
  if (!report?.columns?.length) throw new Error("Báo cáo chưa có cột dữ liệu.");
  renderPdfReport(report);
  let pageStyle = $("#kb2-print-page-style");
  if (!pageStyle) {
    pageStyle = document.createElement("style");
    pageStyle.id = "kb2-print-page-style";
    document.head.appendChild(pageStyle);
  }
  pageStyle.textContent = `@page { size: A4 ${orientation === "portrait" ? "portrait" : "landscape"}; margin: 10mm; }`;
  document.body.classList.add("kb2-printing");
  const finish = () => document.body.classList.remove("kb2-printing");
  window.addEventListener("afterprint", finish, { once: true });
  try {
    window.print();
  } finally {
    window.setTimeout(finish, 250);
  }
}

async function handleInventoryPdfSubmit(event, form) {
  event.preventDefault();
  const submitButton = document.querySelector(`button[type="submit"][form="${form.id}"]`);
  await withActionLock("pdf-inventory", submitButton, async () => {
    try {
      const selection = readPdfFormSelection(form, "inventory");
      const selectedIds = new Set(selection.productIds.map(String));
      const products = inventoryPdfProducts(selection.scope).filter((product) => selectedIds.has(String(product.id)));
      if (!products.length) throw new Error("Không có vật liệu đã chọn để xuất.");
      const category = pdfSingleCategoryForProducts(products);
      savePdfFormPreferences("inventory", selection, category);
      const report = buildInventoryPdfReport(products, selection);
      closeModal(true);
      printPdfReport(report, selection.orientation);
    } catch (error) {
      showToast("error", "Không thể xuất PDF", error.message);
    }
  });
}

async function handleHistoryPdfSubmit(event, form) {
  event.preventDefault();
  const submitButton = document.querySelector(`button[type="submit"][form="${form.id}"]`);
  await withActionLock("pdf-history", submitButton, async () => {
    try {
      const selection = readPdfFormSelection(form, "history");
      const category = historyPdfCategory();
      savePdfFormPreferences("history", selection, category);
      const transactions = await fetchAllHistoryForPdf();
      if (!transactions.length) throw new Error("Không có giao dịch phù hợp để xuất.");
      const report = buildHistoryPdfReport(transactions, selection);
      closeModal(true);
      printPdfReport(report, selection.orientation);
    } catch (error) {
      showToast("error", "Không thể xuất PDF", error.message);
    }
  });
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
  }).sort((a, b) => productDisplayName(a).localeCompare(productDisplayName(b), "vi"));
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
        <div class="toolbar-actions">
          <button class="icon-btn" type="button" data-action="open-inventory-pdf" aria-label="Xuất PDF tồn kho">${icon("pdf")}</button>
          ${categoriesWithPermission(PERMISSIONS.addProduct).length ? `<button class="icon-btn" type="button" data-action="add-product" aria-label="Thêm vật liệu">${icon("plus")}</button>` : ""}
        </div>
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
      <div class="row-title">${escapeHTML(productDisplayName(product))}</div>
      <div class="row-sub">${escapeHTML(category?.name || "Chưa phân nhóm")} · ${product.note ? escapeHTML(product.note) : "Không có ghi chú"}</div>
    </div>
    <div class="row-copy">
      <div class="row-value">${quantityText}</div>
      ${status ? `<div style="margin-top:5px;text-align:right"><span class="badge ${status.className}">${escapeHTML(status.label)}</span></div>` : ""}
    </div>
  </button>`;
}

function transactionSearchText(transaction) {
  const snapshotValues = Array.isArray(transaction?.productSnapshot?.attributes)
    ? transaction.productSnapshot.attributes.flatMap((attribute) => [attribute?.name, attribute?.value, attribute?.unit])
    : [];
  return normalizeSearchText([
    transaction?.productName,
    transaction?.note,
    transaction?.actor,
    TRANSACTION_LABELS[transaction?.type] || transaction?.type,
    transaction?.productSnapshot?.categoryName,
    ...snapshotValues,
  ].filter(Boolean).join(" "));
}

function filteredHistoryTransactions() {
  const tokens = searchTokens(appState.filters.history.search);
  const transactions = visibleHistoryTransactions();
  if (!tokens.length) return transactions;
  return transactions.filter((transaction) => {
    const haystack = transactionSearchText(transaction);
    return tokens.every((token) => haystack.includes(token));
  });
}

function historyDayLabel(value) {
  const key = formatISODate(value);
  const today = formatISODate(new Date());
  const yesterday = formatISODate(new Date(Date.now() - 86400000));
  if (key === today) return "Hôm nay";
  if (key === yesterday) return "Hôm qua";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Không rõ ngày" : new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function renderGroupedHistory(transactions) {
  if (!transactions.length) return renderEmptyState("history", "Không có giao dịch phù hợp", "Thử đổi tháng, từ khóa hoặc bộ lọc.");
  const groups = [];
  for (const transaction of transactions) {
    const key = formatISODate(transaction.createdAt) || "unknown";
    let group = groups[groups.length - 1];
    if (!group || group.key !== key) {
      group = { key, label: historyDayLabel(transaction.createdAt), items: [] };
      groups.push(group);
    }
    group.items.push(transaction);
  }
  return groups.map((group) => `<section class="history-day-group" aria-label="${escapeHTML(group.label)}">
    <div class="history-day-heading"><span>${escapeHTML(group.label)}</span><span>${group.items.length}</span></div>
    <div class="card list-card history-day-list">${group.items.map(renderTransactionRow).join("")}</div>
  </section>`).join("");
}

function historyResultCountText(transactions) {
  const meta = appState.cache.historyMeta;
  const hasSearch = Boolean(searchTokens(appState.filters.history.search).length);
  if (hasSearch) return `${transactions.length} kết quả trong ${meta.total} giao dịch`;
  if (meta.nextOffset !== null) return `${transactions.length} / ${meta.total} giao dịch`;
  return `${meta.total || transactions.length} giao dịch`;
}

const ANALYSIS_LOOKBACK_MONTHS = 3;

function invalidateMonthlyAnalysis() {
  appState.cache.monthlyAnalysis = { key: "", data: null, error: "" };
}

function analysisCategoryId() {
  return appState.filters.history.analysisCategory && appState.filters.history.analysisCategory !== "all"
    ? appState.filters.history.analysisCategory
    : null;
}

function monthlyAnalysisKey() {
  return JSON.stringify({
    month: appState.filters.history.month || currentMonthKey(),
    category: analysisCategoryId() || "all",
    user: appState.currentUser?.id || "",
  });
}

function monthDays(monthKey) {
  const date = parseMonthKey(monthKey);
  return date ? new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() : 30;
}

function analysisMonthElapsedDays(monthKey) {
  const total = monthDays(monthKey);
  if (monthKey !== currentMonthKey()) return total;
  return Math.max(1, Math.min(total, new Date().getDate()));
}

function analysisTransactionIsReversed(transaction) {
  return Boolean(transaction?.reversalTransactionId || transaction?.reversedAt);
}

function analysisEffectiveTransactions(transactions) {
  return (transactions || []).filter((transaction) => transaction?.type !== TRANSACTION_TYPES.reverse && !analysisTransactionIsReversed(transaction));
}

function sumTransactionAmounts(transactions, type) {
  return normalizeQuantity((transactions || [])
    .filter((transaction) => transaction.type === type)
    .reduce((sum, transaction) => sum + normalizeQuantity(transaction.amount, 0), 0), 0);
}

function sumPositiveInventoryInputs(transactions) {
  return normalizeQuantity((transactions || []).reduce((sum, transaction) => {
    if (transaction.type === TRANSACTION_TYPES.import) return sum + normalizeQuantity(transaction.amount, 0);
    if ([TRANSACTION_TYPES.initial, TRANSACTION_TYPES.adjust].includes(transaction.type)) {
      return sum + Math.max(0, normalizeQuantity(transaction.afterQuantity - transaction.beforeQuantity, 0));
    }
    return sum;
  }, 0), 0);
}

function analysisGroupKey(productId, unit) {
  return `${String(productId || "unknown")}::${String(unit || "")}`;
}

function categoryNameForAnalysis(categoryId, fallback = "") {
  return categoryById(categoryId)?.name || fallback || "Nhóm khác";
}

function transactionCategoryName(transaction) {
  return transaction?.productSnapshot?.categoryName || categoryNameForAnalysis(transaction?.categoryId);
}

function analysisProductCreatedMonth(product, transactions) {
  const productMonth = product?.createdAt ? currentMonthKey(product.createdAt) : "";
  if (productMonth) return productMonth;
  const dates = (transactions || []).map((transaction) => new Date(transaction.createdAt)).filter((date) => !Number.isNaN(date.getTime()));
  if (!dates.length) return "";
  dates.sort((left, right) => left - right);
  return currentMonthKey(dates[0]);
}

function formatAnalysisPercent(value) {
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(Math.abs(Number(value) || 0));
}

function analysisTrend(currentValue, priorAverage, { projected = false } = {}) {
  const current = Math.max(0, normalizeQuantity(currentValue, 0));
  const average = Math.max(0, normalizeQuantity(priorAverage, 0));
  if (average <= 0) {
    if (current > 0) return { key: "new", label: projected ? "Ước tính có sử dụng" : "Có sử dụng", percent: null };
    return { key: "none", label: "Chưa có dữ liệu", percent: null };
  }
  const percent = ((current - average) / average) * 100;
  if (percent >= 20) return { key: "up", label: `${projected ? "Ước tính tăng" : "Tăng"} ${formatAnalysisPercent(percent)}%`, percent };
  if (percent <= -20) return { key: "down", label: `${projected ? "Ước tính giảm" : "Giảm"} ${formatAnalysisPercent(percent)}%`, percent };
  return { key: "steady", label: "Ổn định", percent };
}

function purchaseRecommendation({ quantity, warningLevel, referenceUsage, daysInMonth, hasUsageHistory }) {
  const stock = Math.max(0, normalizeQuantity(quantity, 0));
  const warning = Math.max(0, normalizeQuantity(warningLevel, 0));
  const usage = Math.max(0, normalizeQuantity(referenceUsage, 0));

  // Không đưa ra số lượng mua cụ thể khi chưa có lịch sử sử dụng làm nền.
  if (!hasUsageHistory) {
    if (stock <= warning) return { key: "buy", label: "Nên bổ sung", amount: null, coverDays: null, note: usage > 0 ? "Mới phát sinh sử dụng; cần thêm dữ liệu" : "Tồn đang ở mức cảnh báo" };
    if (usage > 0) return { key: "watch", label: "Theo dõi", amount: null, coverDays: null, note: "Mới phát sinh sử dụng; chưa đủ dữ liệu để tính lượng mua" };
    return { key: "stable", label: "Ổn định", amount: 0, coverDays: null, note: "Chưa ghi nhận mức dùng đáng kể" };
  }

  if (usage <= 0) {
    return stock <= warning
      ? { key: "watch", label: "Theo dõi", amount: null, coverDays: null, note: "Tồn ở mức cảnh báo nhưng chưa có mức dùng tham chiếu" }
      : { key: "stable", label: "Ổn định", amount: 0, coverDays: null, note: "Chưa ghi nhận mức dùng đáng kể" };
  }

  const coverDays = normalizeQuantity((stock / usage) * daysInMonth, 0);
  const target = normalizeQuantity(usage + warning, 0);
  const amount = normalizeQuantity(Math.max(0, target - stock), 0);
  if (stock <= 0 || coverDays < 14) return { key: "critical", label: "Cần bổ sung sớm", amount, coverDays, note: "Tồn thấp so với mức sử dụng" };
  if (stock <= warning || coverDays < 30) return { key: "buy", label: "Nên bổ sung", amount, coverDays, note: "Mức tồn chưa đủ khoảng 1 tháng" };
  if (coverDays < 45) return { key: "watch", label: "Theo dõi", amount, coverDays, note: "Mức tồn đang giảm" };
  return { key: "stable", label: "Ổn định", amount: 0, coverDays, note: "Mức tồn hiện tại phù hợp" };
}

async function fetchTransactionsForMonthlyAnalysis({ monthKey, categoryId = null, requestId }) {
  const startMonth = shiftMonthKey(monthKey, -ANALYSIS_LOOKBACK_MONTHS);
  const from = monthDateRange(startMonth).from;
  const to = monthDateRange(monthKey).to;
  let offset = 0;
  let items = [];
  while (offset !== null) {
    const result = await dataService.listTransactions({ limit: 200, offset: offset || 0, categoryId, from, to });
    if (!isCurrentRequest("monthly-analysis", requestId)) return null;
    const pageItems = Array.isArray(result) ? result : Array.isArray(result?.items) ? result.items : [];
    const byId = new Map(items.map((transaction) => [transaction.id, transaction]));
    pageItems.forEach((transaction) => byId.set(transaction.id, transaction));
    items = [...byId.values()];
    offset = Array.isArray(result) ? (pageItems.length >= 200 ? items.length : null) : (result?.nextOffset ?? null);
  }
  return items;
}

function buildMonthlyAnalysis(transactions, monthKey, categoryId = null) {
  const currentSelected = monthKey === currentMonthKey();
  const selectedMonthDays = monthDays(monthKey);
  const elapsedDays = analysisMonthElapsedDays(monthKey);
  const priorMonths = Array.from({ length: ANALYSIS_LOOKBACK_MONTHS }, (_, index) => shiftMonthKey(monthKey, -(ANALYSIS_LOOKBACK_MONTHS - index)));
  const monthKeys = [...priorMonths, monthKey];
  const allTransactions = (transactions || []).filter((transaction) => !categoryId || transaction.categoryId === categoryId);
  const effective = analysisEffectiveTransactions(allTransactions);
  const allByGroup = new Map();
  const effectiveByGroupMonth = new Map();

  for (const transaction of allTransactions) {
    const key = analysisGroupKey(transaction.productId, transaction.unit);
    if (!allByGroup.has(key)) allByGroup.set(key, []);
    allByGroup.get(key).push(transaction);
  }
  for (const transaction of effective) {
    const txMonth = currentMonthKey(transaction.createdAt);
    if (!monthKeys.includes(txMonth)) continue;
    const key = analysisGroupKey(transaction.productId, transaction.unit);
    const monthMap = effectiveByGroupMonth.get(key) || new Map();
    const list = monthMap.get(txMonth) || [];
    list.push(transaction);
    monthMap.set(txMonth, list);
    effectiveByGroupMonth.set(key, monthMap);
  }

  const activeProducts = visibleProducts(PERMISSIONS.viewInventory).filter((product) => {
    if (categoryId && product.categoryId !== categoryId) return false;
    return hasPermission(PERMISSIONS.viewHistory, product.categoryId);
  });
  for (const product of activeProducts) {
    const key = analysisGroupKey(product.id, product.unit);
    if (!allByGroup.has(key)) allByGroup.set(key, []);
  }

  const rows = [];
  for (const [key, groupTransactions] of allByGroup.entries()) {
    const [productId, unit] = key.split("::");
    const currentProduct = productById(productId);
    const monthMap = effectiveByGroupMonth.get(key) || new Map();
    const selectedEffective = monthMap.get(monthKey) || [];
    const selectedAll = groupTransactions.filter((transaction) => currentMonthKey(transaction.createdAt) === monthKey)
      .sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt) || String(left.id).localeCompare(String(right.id)));
    const latestTransaction = [...groupTransactions].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))[0] || null;
    const categoryIdForRow = currentProduct?.categoryId || latestTransaction?.categoryId || "";
    if (categoryId && categoryIdForRow !== categoryId) continue;
    if (!hasPermission(PERMISSIONS.viewHistory, categoryIdForRow)) continue;

    const exports = sumTransactionAmounts(selectedEffective, TRANSACTION_TYPES.export);
    const imports = sumTransactionAmounts(selectedEffective, TRANSACTION_TYPES.import);
    const exportCount = selectedEffective.filter((transaction) => transaction.type === TRANSACTION_TYPES.export).length;
    const opening = selectedAll.length
      ? normalizeQuantity(selectedAll[0].beforeQuantity, 0)
      : currentSelected && currentProduct && String(currentProduct.unit || "") === unit && hasPermission(PERMISSIONS.viewQuantity, categoryIdForRow)
        ? normalizeQuantity(currentProduct.quantity, 0)
        : null;
    const closing = currentSelected && currentProduct && String(currentProduct.unit || "") === unit && hasPermission(PERMISSIONS.viewQuantity, categoryIdForRow)
      ? normalizeQuantity(currentProduct.quantity, 0)
      : selectedAll.length ? normalizeQuantity(selectedAll[selectedAll.length - 1].afterQuantity, 0) : null;
    const available = opening === null ? null : normalizeQuantity(opening + sumPositiveInventoryInputs(selectedEffective), 0);
    const usageRatio = available && available > 0 ? (exports / available) * 100 : null;

    const createdMonth = analysisProductCreatedMonth(currentProduct, groupTransactions);
    let priorTotal = 0;
    let priorMonthCount = 0;
    for (const priorMonth of priorMonths) {
      if (createdMonth && priorMonth < createdMonth) continue;
      priorTotal += sumTransactionAmounts(monthMap.get(priorMonth) || [], TRANSACTION_TYPES.export);
      priorMonthCount += 1;
    }
    const priorAverage = priorMonthCount ? normalizeQuantity(priorTotal / priorMonthCount, 0) : 0;
    const projectedUsage = currentSelected
      ? normalizeQuantity((exports / Math.max(1, elapsedDays)) * selectedMonthDays, 0)
      : exports;
    const trendReference = currentSelected ? projectedUsage : exports;
    const trend = analysisTrend(trendReference, priorAverage, { projected: currentSelected });
    const referenceUsage = priorAverage > 0
      ? Math.max(priorAverage, Math.min(projectedUsage, priorAverage * 1.5))
      : projectedUsage;
    const canViewQuantity = Boolean(currentProduct && hasPermission(PERMISSIONS.viewQuantity, categoryIdForRow) && String(currentProduct.unit || "") === unit);
    const recommendation = currentSelected && canViewQuantity
      ? purchaseRecommendation({
        quantity: currentProduct.quantity,
        warningLevel: currentProduct.warningLevel,
        referenceUsage,
        daysInMonth: selectedMonthDays,
        hasUsageHistory: priorAverage > 0,
      })
      : null;

    const displayName = currentProduct && String(currentProduct.unit || "") === unit
      ? productDisplayName(currentProduct)
      : latestTransaction?.productName || "Vật liệu";
    const categoryName = categoryNameForAnalysis(categoryIdForRow, transactionCategoryName(latestTransaction));

    const hasSelectedActivity = selectedAll.length > 0 || exports > 0 || imports > 0;
    const shouldInclude = hasSelectedActivity || (currentSelected && canViewQuantity && (recommendation?.key !== "stable" || priorAverage > 0));
    if (!shouldInclude) continue;

    rows.push({
      key,
      productId,
      categoryId: categoryIdForRow,
      categoryName,
      productName: displayName,
      unit,
      opening,
      imports,
      exports,
      closing,
      exportCount,
      usageRatio,
      priorAverage,
      priorMonthCount,
      projectedUsage,
      trend,
      recommendation,
      currentQuantity: canViewQuantity ? normalizeQuantity(currentProduct.quantity, 0) : null,
      warningLevel: canViewQuantity ? normalizeQuantity(currentProduct.warningLevel, 0) : null,
    });
  }

  const statusPriority = { critical: 0, buy: 1, watch: 2, stable: 3 };
  const recommendations = currentSelected
    ? rows.filter((row) => row.recommendation && row.recommendation.key !== "stable")
      .sort((left, right) => (statusPriority[left.recommendation.key] ?? 9) - (statusPriority[right.recommendation.key] ?? 9)
        || (right.recommendation.amount || 0) - (left.recommendation.amount || 0))
    : [];

  const rankingGroups = new Map();
  rows.filter((row) => row.exports > 0).forEach((row) => {
    const groupKey = `${row.categoryId}::${row.unit}`;
    const group = rankingGroups.get(groupKey) || { key: groupKey, categoryId: row.categoryId, categoryName: row.categoryName, unit: row.unit, rows: [] };
    group.rows.push(row);
    rankingGroups.set(groupKey, group);
  });
  const rankings = [...rankingGroups.values()]
    .map((group) => ({ ...group, rows: group.rows.sort((left, right) => right.exports - left.exports || right.exportCount - left.exportCount) }))
    .sort((left, right) => left.categoryName.localeCompare(right.categoryName, "vi") || left.unit.localeCompare(right.unit, "vi"));

  return {
    monthKey,
    currentSelected,
    elapsedDays,
    monthDays: selectedMonthDays,
    rows,
    recommendations,
    rankings,
    summary: {
      usedProducts: rows.filter((row) => row.exports > 0).length,
      attentionProducts: recommendations.length,
      increasedProducts: rows.filter((row) => row.trend?.key === "up").length,
    },
  };
}

async function loadMonthlyAnalysis({ render = true, silent = false, force = false } = {}) {
  if (appState.auth.status !== "signedIn" || !hasPermission(PERMISSIONS.viewHistory)) return false;
  const key = monthlyAnalysisKey();
  if (!force && appState.cache.monthlyAnalysis.key === key && appState.cache.monthlyAnalysis.data) {
    if (render) renderApp();
    return true;
  }
  const requestId = nextRequestId("monthly-analysis");
  appState.loading.monthlyAnalysis = true;
  appState.cache.monthlyAnalysis.error = "";
  if (render) renderApp();
  try {
    const transactions = await fetchTransactionsForMonthlyAnalysis({
      monthKey: appState.filters.history.month,
      categoryId: analysisCategoryId(),
      requestId,
    });
    if (!transactions || !isCurrentRequest("monthly-analysis", requestId)) return false;
    const data = buildMonthlyAnalysis(transactions, appState.filters.history.month, analysisCategoryId());
    appState.cache.monthlyAnalysis = { key, data, error: "" };
    return true;
  } catch (error) {
    if (!isCurrentRequest("monthly-analysis", requestId)) return false;
    appState.cache.monthlyAnalysis = { key: "", data: null, error: error.message || "Không tải được phân tích." };
    if (!silent) showToast("error", "Không tải được phân tích", error.message);
    return false;
  } finally {
    if (isCurrentRequest("monthly-analysis", requestId)) {
      appState.loading.monthlyAnalysis = false;
      if (render) renderApp();
    }
  }
}

function analysisMetric(label, value, note = "") {
  return `<div class="analysis-metric"><strong>${escapeHTML(value)}</strong><span>${escapeHTML(label)}</span>${note ? `<small>${escapeHTML(note)}</small>` : ""}</div>`;
}

function analysisStatusClass(key) {
  if (key === "critical") return "analysis-status-critical";
  if (key === "buy") return "analysis-status-buy";
  if (key === "watch") return "analysis-status-watch";
  return "analysis-status-stable";
}

function renderPurchaseRecommendations(data) {
  if (!data.currentSelected) return `<div class="card analysis-note"><strong>Đề xuất mua</strong><span>Chỉ hiển thị ở tháng hiện tại để không trộn tồn hiện tại với dữ liệu quá khứ.</span></div>`;
  if (!data.recommendations.length) return `<div class="card analysis-note analysis-note-success"><strong>Chưa có vật liệu cần bổ sung</strong><span>Đề xuất dựa trên tồn hiện tại, mức dùng tham chiếu và ngưỡng cảnh báo.</span></div>`;
  return `<div class="analysis-recommendation-list">${data.recommendations.map((row) => {
    const rec = row.recommendation;
    const amountText = rec.amount !== null && rec.amount > 0 ? `Đề xuất +${formatQuantity(rec.amount)} ${row.unit}` : "Chưa đủ dữ liệu để tính lượng mua";
    const coverText = rec.coverDays !== null ? `Ước tính đủ ~${Math.max(0, Math.round(rec.coverDays))} ngày` : rec.note;
    return `<article class="card analysis-recommendation ${analysisStatusClass(rec.key)}">
      <div class="analysis-recommendation-head"><div><strong>${escapeHTML(row.productName)}</strong><span>${escapeHTML(row.categoryName)} · ${escapeHTML(row.unit)}</span></div><span class="analysis-status-pill">${escapeHTML(rec.label)}</span></div>
      <div class="analysis-recommendation-values"><span>Tồn <strong>${formatQuantity(row.currentQuantity)} ${escapeHTML(row.unit)}</strong></span><span>Đã xuất tháng này <strong>${formatQuantity(row.exports)} ${escapeHTML(row.unit)}</strong></span><span>TB ${row.priorMonthCount || ANALYSIS_LOOKBACK_MONTHS} tháng <strong>${formatQuantity(row.priorAverage)} ${escapeHTML(row.unit)}/tháng</strong></span></div>
      <div class="analysis-recommendation-foot"><strong>${escapeHTML(amountText)}</strong><span>${escapeHTML(coverText)}</span></div>
    </article>`;
  }).join("")}</div>`;
}

function renderUsageRankings(data) {
  if (!data.rankings.length) return renderEmptyState("history", "Chưa có lượt xuất trong tháng", "Khi có giao dịch xuất, xếp hạng sử dụng sẽ xuất hiện tại đây.");
  return `<div class="analysis-ranking-list">${data.rankings.map((group) => `<section class="card analysis-ranking-group">
    <div class="analysis-ranking-heading"><strong>${escapeHTML(group.categoryName)}</strong><span>${escapeHTML(group.unit)} · xếp trong cùng nhóm/đơn vị</span></div>
    ${group.rows.slice(0, 5).map((row, index) => `<div class="analysis-ranking-row">
      <span class="analysis-rank">${index + 1}</span>
      <div class="analysis-ranking-main"><strong>${escapeHTML(row.productName)}</strong><span>${row.exportCount} lần xuất · ${row.trend?.label ? escapeHTML(row.trend.label) : ""}</span></div>
      <div class="analysis-ranking-value"><strong>${formatQuantity(row.exports)}</strong><span>${escapeHTML(row.unit)}</span></div>
    </div>`).join("")}
  </section>`).join("")}</div>`;
}

function renderUsageDetailRows(data) {
  if (!data.rows.length) return "";
  const rows = [...data.rows].sort((left, right) => right.exports - left.exports || left.productName.localeCompare(right.productName, "vi"));
  return `<details class="card analysis-detail"><summary>Chi tiết ${rows.length} vật liệu</summary><div class="analysis-detail-list">${rows.map((row) => {
    const ratioText = row.usageRatio === null ? "—" : `${formatAnalysisPercent(row.usageRatio)}%`;
    const averageLabel = row.priorMonthCount ? `TB ${row.priorMonthCount} tháng` : "TB 3 tháng";
    const openingText = row.opening === null ? "—" : formatQuantity(row.opening);
    const closingText = row.closing === null ? "—" : formatQuantity(row.closing);
    return `<div class="analysis-detail-row">
      <div class="analysis-detail-name"><strong>${escapeHTML(row.productName)}</strong><span>${escapeHTML(row.categoryName)} · ${escapeHTML(row.unit)}</span></div>
      <div class="analysis-detail-values"><span>Đầu tháng <strong>${escapeHTML(openingText)}</strong></span><span>Nhập <strong>${formatQuantity(row.imports)}</strong></span><span>Xuất <strong>${formatQuantity(row.exports)}</strong></span><span>Cuối/hiện tại <strong>${escapeHTML(closingText)}</strong></span><span>${escapeHTML(averageLabel)} <strong>${formatQuantity(row.priorAverage)}</strong></span><span>Tỷ lệ dùng <strong>${escapeHTML(ratioText)}</strong></span></div>
    </div>`;
  }).join("")}</div></details>`;
}

function renderMonthlyAnalysisScreen() {
  const loading = Boolean(appState.loading.monthlyAnalysis);
  const cache = appState.cache.monthlyAnalysis;
  const data = cache.key === monthlyAnalysisKey() ? cache.data : null;
  const categories = appState.cache.schema?.categories?.filter((category) => hasPermission(PERMISSIONS.viewHistory, category.id)) || [];
  if (loading && !data) return `<div class="card analysis-loading"><span class="spinner" aria-hidden="true"></span><strong>Đang phân tích ${escapeHTML(formatMonthLabel(appState.filters.history.month))}…</strong></div>`;
  if (cache.error && !data) return `<div class="card analysis-note"><strong>Không tải được phân tích</strong><span>${escapeHTML(cache.error)}</span><button class="btn btn-secondary btn-compact" type="button" data-action="reload-monthly-analysis">Thử lại</button></div>`;
  if (!data) return `<div class="card analysis-loading"><strong>Đang chuẩn bị dữ liệu…</strong></div>`;
  const monthProgressNote = data.currentSelected ? `Thực tế đến ngày ${data.elapsedDays}/${data.monthDays}` : "Dữ liệu thực tế của tháng";
  return `<div class="analysis-screen">
    <div class="analysis-toolbar">
      <label class="field analysis-category-field" for="analysis-category"><span class="field-label">Nhóm vật liệu</span><select id="analysis-category" class="select"><option value="all">Tất cả nhóm</option>${categories.map((category) => `<option value="${escapeHTML(category.id)}" ${category.id === appState.filters.history.analysisCategory ? "selected" : ""}>${escapeHTML(category.name)}</option>`).join("")}</select></label>
    </div>
    <div class="analysis-metric-grid">
      ${analysisMetric("Vật liệu đã dùng", String(data.summary.usedProducts), monthProgressNote)}
      ${analysisMetric("Cần chú ý", String(data.summary.attentionProducts), data.currentSelected ? "Theo tồn hiện tại" : "Không đánh giá mua")}
      ${analysisMetric("Sử dụng tăng", String(data.summary.increasedProducts), data.currentSelected ? "Ước tính so với TB 3 tháng trước" : "So với TB 3 tháng trước")}
    </div>
    <div class="analysis-disclaimer">${data.currentSelected ? "Thực tế lấy từ giao dịch còn trong Lịch sử. Dự báo là ước tính theo tốc độ sử dụng đến hôm nay." : "Số liệu thực tế lấy từ giao dịch còn trong Lịch sử."}</div>
    <div class="section-head analysis-section-head"><div class="section-copy"><h2 class="section-title">Đề xuất bổ sung</h2><p class="section-subtitle">Mức đề xuất tham khảo = khoảng 1 tháng sử dụng + ngưỡng cảnh báo.</p></div></div>
    ${renderPurchaseRecommendations(data)}
    <div class="section-head analysis-section-head"><div class="section-copy"><h2 class="section-title">Dùng nhiều trong tháng</h2><p class="section-subtitle">Không xếp chung các đơn vị khác nhau.</p></div></div>
    ${renderUsageRankings(data)}
    ${renderUsageDetailRows(data)}
  </div>`;
}

function renderHistoryScreen() {
  if (!hasPermission(PERMISSIONS.viewHistory)) return renderAccessDenied("Vai trò hiện tại chưa có quyền xem lịch sử giao dịch.");
  const filters = appState.filters.history;
  const isAnalysis = filters.view === "analysis";
  const transactions = isAnalysis ? [] : filteredHistoryTransactions();
  const customRange = Boolean(filters.from || filters.to);
  const canGoNext = filters.month < currentMonthKey();
  const categories = appState.cache.schema?.categories?.filter((category) => hasPermission(PERMISSIONS.viewHistory, category.id)) || [];
  const loading = Boolean(appState.loading.historyTransactions);
  return `<section class="screen" aria-label="Lịch sử giao dịch">
    <div class="history-month-bar card">
      <button class="icon-btn" type="button" data-action="history-shift-month" data-delta="-1" aria-label="Tháng trước">‹</button>
      <button class="history-month-current" type="button" data-action="history-current-month" aria-label="Về tháng hiện tại">
        <strong>${escapeHTML(formatMonthLabel(filters.month))}</strong>
        ${isAnalysis ? '<span>Phân tích theo tháng</span>' : customRange ? '<span>Khoảng ngày tùy chỉnh</span>' : '<span>Theo tháng</span>'}
      </button>
      <button class="icon-btn" type="button" data-action="history-shift-month" data-delta="1" aria-label="Tháng sau" ${canGoNext ? "" : "disabled"}>›</button>
    </div>

    <div class="history-view-tabs" role="tablist" aria-label="Chế độ lịch sử">
      <button class="history-view-tab" type="button" role="tab" data-action="set-history-view" data-view="transactions" aria-selected="${String(!isAnalysis)}">Giao dịch</button>
      <button class="history-view-tab" type="button" role="tab" data-action="set-history-view" data-view="analysis" aria-selected="${String(isAnalysis)}">Phân tích</button>
    </div>

    ${isAnalysis ? renderMonthlyAnalysisScreen() : `
    <div class="history-search-row">
      <label class="search-wrap" for="history-search">
        <span class="search-icon">${icon("search")}</span>
        <input id="history-search" class="input" type="search" inputmode="search" autocomplete="off" placeholder="Tìm vật liệu, thông số, ghi chú" value="${escapeHTML(filters.search)}">
      </label>
      <button class="btn btn-secondary history-filter-toggle ${filters.filtersOpen ? "is-active" : ""}" type="button" data-action="toggle-history-filters">${icon("filter")}<span>Bộ lọc</span></button>
      <button class="icon-btn history-pdf-button" type="button" data-action="open-history-pdf" aria-label="Xuất PDF lịch sử">${icon("pdf")}</button>
    </div>

    ${filters.filtersOpen ? `<div class="card history-filter-panel">
      <div class="field-grid two">
        <label class="field" for="history-type"><span class="field-label">Loại giao dịch</span><select id="history-type" class="select">
          <option value="all">Tất cả</option>
          ${Object.entries(TRANSACTION_LABELS).map(([value, label]) => `<option value="${value}" ${value === filters.type ? "selected" : ""}>${escapeHTML(label)}</option>`).join("")}
        </select></label>
        <label class="field" for="history-category"><span class="field-label">Nhóm vật liệu</span><select id="history-category" class="select"><option value="all">Tất cả nhóm</option>${categories.map((category) => `<option value="${escapeHTML(category.id)}" ${category.id === filters.category ? "selected" : ""}>${escapeHTML(category.name)}</option>`).join("")}</select></label>
      </div>
      <div class="field-grid two history-date-grid">
        <label class="field" for="history-from"><span class="field-label">Từ ngày</span><input id="history-from" class="input" type="date" value="${escapeHTML(filters.from)}"></label>
        <label class="field" for="history-to"><span class="field-label">Đến ngày</span><input id="history-to" class="input" type="date" value="${escapeHTML(filters.to)}"></label>
      </div>
      <div class="history-filter-actions"><button class="btn btn-compact btn-secondary" type="button" data-action="clear-history-filters">Xóa bộ lọc phụ</button></div>
    </div>` : ""}

    <div class="section-head history-section-head">
      <div class="section-copy"><h2 class="section-title">Giao dịch</h2><p id="history-result-count" class="section-subtitle">${escapeHTML(historyResultCountText(transactions))}</p></div>
      ${loading ? '<span class="history-loading">Đang tải…</span>' : ""}
    </div>

    <div id="history-list" class="history-group-list">${renderGroupedHistory(transactions)}</div>
    ${appState.cache.historyMeta.nextOffset !== null && !filters.search ? `<button class="btn btn-secondary btn-block history-load-more" type="button" data-action="load-more-history" ${loading ? "disabled" : ""}>${loading ? "Đang tải…" : "Tải thêm"}</button>` : ""}
    `}
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
  const reversedBadge = transaction.reversalTransactionId ? '<span class="badge badge-warning">Đã hoàn tác</span>' : "";
  const reversalLink = transaction.reversalOf ? '<span class="badge badge-purple">Hoàn tác</span>' : "";
  return `<button class="list-row list-row-button transaction-row ${transaction.reversalTransactionId ? "transaction-row-reversed" : ""}" type="button" data-action="open-transaction-detail" data-transaction-id="${escapeHTML(transaction.id)}">
    <div class="row-main">
      <div class="row-title">${escapeHTML(transaction.productName)}</div>
      <div class="row-sub">${formatTime(transaction.createdAt)}${transaction.note ? ` · ${escapeHTML(transaction.note)}` : ""}</div>
    </div>
    <div class="row-copy">
      <div class="row-value transaction-value ${presentation.className}">${quantityText} ${escapeHTML(transaction.unit)}</div>
      <div class="transaction-status"><span class="badge ${presentation.badge}">${escapeHTML(TRANSACTION_LABELS[transaction.type] || transaction.type)}</span>${reversedBadge}${reversalLink}</div>
    </div>
  </button>`;
}

function renderManageScreen() {
  if (!canOpenManageTab(appState.manageTab)) appState.manageTab = MANAGE_TABS.home;
  return `<section class="screen" aria-label="Cài đặt ứng dụng">${appState.manageTab === MANAGE_TABS.home ? renderSettingsHome() : renderManageSubscreen()}</section>`;
}

function renderSettingsHome() {
  const canManageAccounts = hasPermission(PERMISSIONS.manageAccounts);
  const canManageCategories = hasPermission(PERMISSIONS.manageSchema);
  const advanced = canSeeAdvancedSettings();
  return `<div class="screen">
    <div class="card list-card">
      <button class="list-row list-row-button" type="button" data-action="toggle-theme">
        <div class="row-main"><div class="row-title">Giao diện</div><div class="row-sub">Đang dùng chế độ ${appState.theme === "dark" ? "tối" : "sáng"}. Chạm để chuyển.</div></div><div class="row-actions">${icon(appState.theme === "dark" ? "sun" : "moon")}</div>
      </button>
      <button class="list-row list-row-button" type="button" data-action="open-faq">
        <div class="row-main"><div class="row-title">Hướng dẫn sử dụng</div><div class="row-sub">Cách nhập, xuất, điều chỉnh, PDF và xử lý lỗi thường gặp.</div></div><div class="row-actions">${icon("help")}</div>
      </button>
      <button class="list-row list-row-button" type="button" data-action="open-profile">
        <div class="row-main"><div class="row-title">Tài khoản của tôi</div><div class="row-sub">${escapeHTML(appState.currentUser.displayName)} · ${escapeHTML(roleLabel(appState.currentUser.role))}</div></div><div class="row-actions">${icon("account")}</div>
      </button>
    </div>

    ${(canManageAccounts || canManageCategories) ? `<div class="section-head"><div class="section-copy"><h2 class="section-title">Quản lý</h2><p class="section-subtitle">Các mục chỉ hiện khi tài khoản có quyền tương ứng.</p></div></div>
    <div class="card list-card">
      ${canManageAccounts ? `<button class="list-row list-row-button" type="button" data-manage-tab="${MANAGE_TABS.accounts}"><div class="row-main"><div class="row-title">Tài khoản</div><div class="row-sub">Tạo và quản lý tài khoản sử dụng ứng dụng.</div></div><div class="row-actions">${icon("account")}</div></button>` : ""}
      ${canManageCategories ? `<button class="list-row list-row-button" type="button" data-manage-tab="${MANAGE_TABS.categories}"><div class="row-main"><div class="row-title">Nhóm vật liệu</div><div class="row-sub">Quản lý nhóm, đơn vị và thuộc tính vật liệu.</div></div><div class="row-actions">${icon("category")}</div></button>` : ""}
    </div>` : ""}

    ${advanced ? `<div class="section-head"><div class="section-copy"><h2 class="section-title">Nâng cao</h2><p class="section-subtitle">Chỉ Admin và Super Admin nhìn thấy khu vực này.</p></div></div>
    <div class="card list-card">
      <button class="list-row list-row-button" type="button" data-manage-tab="${MANAGE_TABS.access}"><div class="row-main"><div class="row-title">Phân quyền</div><div class="row-sub">Xem quyền theo vai trò và phạm vi nhóm vật liệu.</div></div><div class="row-actions">${icon("shield")}</div></button>
      ${hasPermission(PERMISSIONS.manageData) ? `<button class="list-row list-row-button" type="button" data-manage-tab="${MANAGE_TABS.data}"><div class="row-main"><div class="row-title">Dữ liệu</div><div class="row-sub">Thông tin tầng dữ liệu và các công cụ quản trị ít dùng.</div></div><div class="row-actions">${icon("database")}</div></button>` : ""}
    </div>` : ""}
  </div>`;
}

function renderManageSubscreen() {
  const labels = {
    [MANAGE_TABS.accounts]: "Tài khoản",
    [MANAGE_TABS.categories]: "Nhóm vật liệu",
    [MANAGE_TABS.access]: "Phân quyền",
    [MANAGE_TABS.data]: "Dữ liệu",
  };
  return `<div class="screen">
    <div class="section-head"><button class="btn btn-compact btn-secondary" type="button" data-manage-tab="${MANAGE_TABS.home}">‹ Cài đặt</button><div class="section-copy"><h2 class="section-title">${escapeHTML(labels[appState.manageTab] || "Cài đặt")}</h2></div></div>
    <div role="tabpanel">${renderManagePanel()}</div>
  </div>`;
}

function renderManagePanel() {
  if (!canOpenManageTab(appState.manageTab)) return renderSettingsHome();
  if (appState.manageTab === MANAGE_TABS.categories) return renderCategoriesPanel();
  if (appState.manageTab === MANAGE_TABS.access) return renderAccessPanel();
  if (appState.manageTab === MANAGE_TABS.data) return renderDataPanel();
  if (appState.manageTab === MANAGE_TABS.accounts) return renderAccountsPanel();
  return renderSettingsHome();
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

function openModal({ name, title, subtitle = "", body, footer = "", size = "sheet", headerActions = "" }) {
  const root = $("#modal-root");
  if (!root) return;
  appState.ui.modalName = name;
  appState.ui.modalLastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const content = size === "dialog"
    ? `<div class="dialog-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="dialog-body"><h2 id="modal-title" class="sheet-title">${escapeHTML(title)}</h2>${subtitle ? `<p class="sheet-subtitle">${escapeHTML(subtitle)}</p>` : ""}<div style="margin-top:14px">${body}</div></div>${footer ? `<div class="dialog-actions">${footer}</div>` : ""}</div>`
    : `<section class="sheet" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div><div class="sheet-handle" aria-hidden="true"></div><header class="sheet-head"><div><h2 id="modal-title" class="sheet-title">${escapeHTML(title)}</h2>${subtitle ? `<p class="sheet-subtitle">${escapeHTML(subtitle)}</p>` : ""}</div><div class="sheet-head-actions">${headerActions}<button class="icon-btn" type="button" data-action="close-modal" aria-label="Đóng">${icon("close")}</button></div></header></div><div class="sheet-body">${body}</div>${footer ? `<footer class="sheet-footer">${footer}</footer>` : ""}</section>`;
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
      <div class="notice notice-warning"><div class="notice-icon">${icon("warning")}</div><div><div class="notice-title">Không dùng để sửa tồn kho</div><div class="notice-text">Giao dịch sai nên dùng Hoàn tác giao dịch. Xóa lịch sử chỉ dùng để dọn dữ liệu hiển thị.</div></div></div>
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

function formatRecentTransactionTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  if (formatISODate(date) === formatISODate(new Date())) return `Hôm nay ${formatTime(date)}`;
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(date);
}

function renderProductRecentTransaction(transaction) {
  const presentation = transactionPresentation(transaction);
  const quantityText = [TRANSACTION_TYPES.adjust, TRANSACTION_TYPES.initial, TRANSACTION_TYPES.reverse].includes(transaction.type)
    ? `${formatQuantity(transaction.beforeQuantity)} → ${formatQuantity(transaction.afterQuantity)}`
    : `${presentation.sign}${formatQuantity(transaction.amount)}`;
  return `<button class="product-recent-row" type="button" data-action="open-transaction-detail" data-transaction-id="${escapeHTML(transaction.id)}">
    <div class="product-recent-main">
      <div class="product-recent-title">${escapeHTML(TRANSACTION_LABELS[transaction.type] || transaction.type)}</div>
      <div class="product-recent-meta">${escapeHTML(formatRecentTransactionTime(transaction.createdAt))}${transaction.note ? ` · ${escapeHTML(transaction.note)}` : ""}</div>
    </div>
    <div class="product-recent-value ${presentation.className}">${quantityText} ${escapeHTML(transaction.unit)}</div>
  </button>`;
}

function openProductActions(productId) {
  const product = productById(productId);
  if (!product) return showToast("error", "Không tìm thấy vật liệu");
  const actions = [
    hasPermission(PERMISSIONS.editProduct, product.categoryId)
      ? `<button class="list-row list-row-button" type="button" data-action="edit-product" data-product-id="${escapeHTML(product.id)}"><div class="row-main"><div class="row-title">Sửa vật liệu</div><div class="row-sub">Tên, thông số, đơn vị, cảnh báo và ghi chú.</div></div><div class="row-actions">${icon("edit")}</div></button>`
      : "",
    hasPermission(PERMISSIONS.archiveProduct, product.categoryId)
      ? `<button class="list-row list-row-button" type="button" data-action="archive-product" data-product-id="${escapeHTML(product.id)}"><div class="row-main"><div class="row-title">Lưu trữ vật liệu</div><div class="row-sub">Ẩn khỏi kho, vẫn giữ lịch sử.</div></div><div class="row-actions">${icon("archive")}</div></button>`
      : "",
    canDeleteTestProduct()
      ? `<button class="list-row list-row-button danger-row" type="button" data-action="delete-test-product" data-product-id="${escapeHTML(product.id)}"><div class="row-main"><div class="row-title">Xóa vật liệu test</div><div class="row-sub">Xóa vĩnh viễn vật liệu thử nghiệm và giao dịch liên quan.</div></div><div class="row-actions">${icon("trash")}</div></button>`
      : "",
  ].filter(Boolean);
  if (!actions.length) return showToast("info", "Không có tùy chọn quản lý");
  openModal({
    name: "product-actions",
    title: "Tùy chọn vật liệu",
    subtitle: productDisplayName(product),
    body: `<div class="card list-card product-actions-list">${actions.join("")}</div>`,
    footer: `<button class="btn btn-secondary btn-block" type="button" data-action="back-product-detail" data-product-id="${escapeHTML(product.id)}">Quay lại</button>`,
  });
}

function openProductDetail(productId) {
  const product = productById(productId);
  if (!product) return showToast("error", "Không tìm thấy vật liệu");
  if (!hasPermission(PERMISSIONS.viewDetail, product.categoryId)) {
    if (canCreateAnyInventoryTransaction(product.categoryId) && hasPermission(PERMISSIONS.viewQuantity, product.categoryId)) {
      openTransactionModal(product.id);
      return;
    }
    showToast("error", "Không có quyền", "Tài khoản hiện tại không được xem chi tiết vật liệu trong nhóm này.");
    return;
  }
  const category = categoryById(product.categoryId);
  const canViewQuantity = hasPermission(PERMISSIONS.viewQuantity, product.categoryId);
  const status = canViewQuantity ? productStatus(product) : null;
  const attributeRows = orderedCategoryAttributes(category).map((attribute) => `<div class="detail-row"><div class="detail-key">${escapeHTML(attribute.name)}</div><div class="detail-value">${escapeHTML(attributeDisplayValue(attribute, product.attributes[attribute.id]))}</div></div>`).join("");
  const stockActions = [
    hasPermission(PERMISSIONS.importInventory, product.categoryId) ? `<button class="btn btn-primary" type="button" data-action="quick-transaction" data-type="${TRANSACTION_TYPES.import}" data-product-id="${escapeHTML(product.id)}">Nhập</button>` : "",
    hasPermission(PERMISSIONS.exportInventory, product.categoryId) ? `<button class="btn btn-secondary" type="button" data-action="quick-transaction" data-type="${TRANSACTION_TYPES.export}" data-product-id="${escapeHTML(product.id)}">Xuất</button>` : "",
    hasPermission(PERMISSIONS.countInventory, product.categoryId) ? `<button class="btn btn-secondary" type="button" data-action="quick-transaction" data-type="${TRANSACTION_TYPES.adjust}" data-product-id="${escapeHTML(product.id)}">Điều chỉnh</button>` : "",
  ].filter(Boolean).join("");
  const canViewRecentHistory = hasPermission(PERMISSIONS.viewHistory, product.categoryId);
  const recentTransactions = canViewRecentHistory ? visibleTransactions().filter((transaction) => transaction.productId === product.id).slice(0, 5) : [];
  const canManageProduct = hasPermission(PERMISSIONS.editProduct, product.categoryId)
    || hasPermission(PERMISSIONS.archiveProduct, product.categoryId)
    || canDeleteTestProduct();

  openModal({
    name: "product-detail",
    title: productDisplayName(product),
    subtitle: category?.name || "Chưa phân nhóm",
    headerActions: canManageProduct ? `<button class="icon-btn" type="button" data-action="open-product-actions" data-product-id="${escapeHTML(product.id)}" aria-label="Tùy chọn vật liệu">${icon("more")}</button>` : "",
    body: `<div class="product-stock-card">
        <div class="product-stock-label">Tồn hiện tại</div>
        <div class="product-stock-value">${canViewQuantity ? `${formatQuantity(product.quantity)} <span>${escapeHTML(product.unit)}</span>` : "Đã ẩn"}</div>
        ${status ? `<span class="badge ${status.className}">${escapeHTML(status.label)}</span>` : ""}
      </div>
      ${stockActions ? `<div class="stock-action-grid product-detail-actions" aria-label="Thao tác tồn kho">${stockActions}</div>` : ""}
      ${canViewRecentHistory ? `<section class="product-detail-section" aria-labelledby="product-recent-title">
        <div class="product-detail-section-head"><h3 id="product-recent-title">Gần đây</h3><span>${recentTransactions.length ? `${recentTransactions.length} giao dịch` : ""}</span></div>
        <div class="product-recent-list">${recentTransactions.length ? recentTransactions.map(renderProductRecentTransaction).join("") : `<div class="product-recent-empty">Chưa có giao dịch gần đây.</div>`}</div>
      </section>` : ""}
      <details class="product-more-info">
        <summary>Thông tin thêm</summary>
        <div class="detail-grid product-more-info-grid">
          <div class="detail-row"><div class="detail-key">Đơn vị</div><div class="detail-value">${escapeHTML(product.unit)}</div></div>
          ${canViewQuantity ? `<div class="detail-row"><div class="detail-key">Mức cảnh báo</div><div class="detail-value">${formatQuantity(product.warningLevel)} ${escapeHTML(product.unit)}</div></div>` : ""}
          ${attributeRows}
          <div class="detail-row"><div class="detail-key">Ghi chú</div><div class="detail-value">${escapeHTML(product.note || "—")}</div></div>
          <div class="detail-row"><div class="detail-key">Cập nhật</div><div class="detail-value">${formatDateTime(product.updatedAt)}</div></div>
        </div>
      </details>`,
  });
}

function productFormBody(product = null, categoryId = null) {
  const categories = product ? appState.cache.schema.categories.filter((category) => category.id === product.categoryId && hasPermission(PERMISSIONS.editProduct, category.id)) : categoriesWithPermission(PERMISSIONS.addProduct);
  const selectedCategory = categoryById(categoryId || product?.categoryId || categories[0]?.id);
  if (!selectedCategory) return renderEmptyState("warning", "Chưa có nhóm vật liệu", "Hãy tạo nhóm trước khi thêm vật liệu.");
  const attributes = product?.attributes || {};
  const automaticName = buildProductDisplayName(selectedCategory, attributes);
  const previewName = String(product?.customName || "").trim() ? productDisplayName(product) : automaticName;
  const categoryField = product
    ? `<div class="product-edit-category"><span>Nhóm vật liệu</span><strong>${escapeHTML(selectedCategory.icon)} ${escapeHTML(selectedCategory.name)}</strong><input type="hidden" name="categoryId" value="${escapeHTML(selectedCategory.id)}"></div>`
    : `<label class="field" for="product-category"><span class="field-label">Nhóm vật liệu</span><select id="product-category" name="categoryId" class="select">${categories.map((category) => `<option value="${escapeHTML(category.id)}" ${category.id === selectedCategory.id ? "selected" : ""}>${escapeHTML(category.icon)} ${escapeHTML(category.name)}</option>`).join("")}</select></label>`;

  return `<form id="product-form" class="field-grid" novalidate>
    <input type="hidden" name="id" value="${escapeHTML(product?.id || "")}">
    <input type="hidden" name="expectedRevision" value="${escapeHTML(product?.revision ?? "")}">
    ${product ? `<div class="product-name-preview"><span>Tên sau khi lưu</span><strong id="generated-product-name">${escapeHTML(previewName)}</strong></div>` : ""}
    ${categoryField}

    <div id="product-attribute-fields" class="field-grid">
      ${orderedCategoryAttributes(selectedCategory).map((attribute) => renderProductAttributeField(attribute, attributes[attribute.id])).join("")}
    </div>

    <label class="field" for="product-custom-name"><span class="field-label">Tên riêng <span class="optional-label">(không bắt buộc)</span></span><input id="product-custom-name" name="customName" class="input" type="text" autocomplete="off" value="${escapeHTML(product?.customName || "")}" placeholder="Để trống để dùng tên tự động">${product ? "" : `<span class="field-help">Tên tự động: <strong id="generated-product-name">${escapeHTML(automaticName)}</strong></span>`}</label>

    <div class="field-grid two">
      <label class="field" for="product-unit"><span class="field-label">Đơn vị</span><select id="product-unit" name="unit" class="select">${selectedCategory.units.map((unit) => `<option value="${escapeHTML(unit)}" ${unit === (product?.unit || selectedCategory.defaultUnit) ? "selected" : ""}>${escapeHTML(unit)}</option>`).join("")}</select></label>
      <label class="field" for="product-warning"><span class="field-label">Cảnh báo khi còn</span><input id="product-warning" name="warningLevel" class="input" type="number" inputmode="decimal" min="0" step="any" value="${escapeHTML(product?.warningLevel ?? selectedCategory.warningDefault)}"></label>
    </div>

    ${product ? "" : `<label class="field" for="product-initial-stock"><span class="field-label">Tồn khởi tạo</span><input id="product-initial-stock" name="initialStock" class="input" type="number" inputmode="decimal" min="0" step="any" value="0"></label>`}

    <label class="field" for="product-note"><span class="field-label">Ghi chú <span class="optional-label">(không bắt buộc)</span></span><textarea id="product-note" name="note" class="textarea" rows="2" placeholder="">${escapeHTML(product?.note || "")}</textarea></label>
    ${product ? '<div class="helper-block">Tồn kho không thay đổi khi sửa thông tin. Lịch sử cũ vẫn giữ thông tin tại thời điểm giao dịch.</div>' : ""}
  </form>`;
}

function renderProductAttributeField(attribute, value = "") {
  const required = attribute.required ? "required" : "";
  const unitLabel = attribute.unit ? ` <span class="optional-label">(${escapeHTML(attribute.unit)})</span>` : "";
  const label = `${escapeHTML(attribute.name)}${unitLabel}${attribute.required ? " *" : ""}`;
  if (attribute.type === "select") {
    return `<label class="field" for="attr-${escapeHTML(attribute.id)}"><span class="field-label">${label}</span><select id="attr-${escapeHTML(attribute.id)}" name="attr:${escapeHTML(attribute.id)}" class="select" ${required}><option value="">Chọn ${escapeHTML(attribute.name.toLowerCase())}</option>${attribute.options.map((option) => `<option value="${escapeHTML(option)}" ${String(value) === String(option) ? "selected" : ""}>${escapeHTML(option)}</option>`).join("")}</select></label>`;
  }
  return `<label class="field" for="attr-${escapeHTML(attribute.id)}"><span class="field-label">${label}</span><input id="attr-${escapeHTML(attribute.id)}" name="attr:${escapeHTML(attribute.id)}" class="input" type="${attribute.type === "number" ? "number" : "text"}" ${attribute.type === "number" ? 'inputmode="decimal" min="0" step="any"' : 'autocomplete="off"'} value="${escapeHTML(value)}" ${required}></label>`;
}

function openProductForm(productId = null) {
  const product = productId ? productById(productId) : null;
  if (product && !hasPermission(PERMISSIONS.editProduct, product.categoryId)) return showToast("error", "Không có quyền sửa vật liệu");
  if (!product && !categoriesWithPermission(PERMISSIONS.addProduct).length) return showToast("error", "Không có quyền thêm vật liệu");
  closeModal(true);
  openModal({
    name: "product-form",
    title: product ? "Sửa vật liệu" : "Thêm vật liệu",
    subtitle: product ? "Sửa thông số, đơn vị, cảnh báo hoặc ghi chú." : "Thêm quy cách vật liệu mới.",
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
  const customName = String(formData.get("customName") || "").trim();
  setText("#generated-product-name", customName || buildProductDisplayName(category, attributes), form);
}

function transactionTypeOptionsForCategory(categoryId) {
  return [
    hasPermission(PERMISSIONS.importInventory, categoryId) ? [TRANSACTION_TYPES.import, "Nhập kho"] : null,
    hasPermission(PERMISSIONS.exportInventory, categoryId) ? [TRANSACTION_TYPES.export, "Xuất kho"] : null,
    hasPermission(PERMISSIONS.countInventory, categoryId) ? [TRANSACTION_TYPES.adjust, "Điều chỉnh tồn"] : null,
  ].filter(Boolean);
}

function renderTransactionTypeButtons(categoryId, selectedType = "") {
  const options = transactionTypeOptionsForCategory(categoryId);
  const effectiveType = options.some(([type]) => type === selectedType) ? selectedType : options[0]?.[0] || "";
  return options.map(([type, label]) => `<button class="segmented-item" type="button" data-action="select-transaction-type" data-type="${type}" aria-pressed="${type === effectiveType}">${label}</button>`).join("");
}

function transactionSubmitLabel(type, amount = null, unit = "") {
  const hasAmount = amount !== null && amount !== undefined && String(amount).trim() !== "";
  const normalizedAmount = hasAmount ? normalizeQuantity(amount, Number.NaN) : Number.NaN;
  const suffix = Number.isFinite(normalizedAmount)
    ? ` ${formatQuantity(normalizedAmount)}${unit ? ` ${unit}` : ""}`
    : "";
  if (type === TRANSACTION_TYPES.import) return `Nhập${suffix}`;
  if (type === TRANSACTION_TYPES.export) return `Xuất${suffix}`;
  if (type === TRANSACTION_TYPES.adjust) return Number.isFinite(normalizedAmount) ? `Lưu tồn ${formatQuantity(normalizedAmount)}${unit ? ` ${unit}` : ""}` : "Lưu tồn";
  return "Lưu";
}

function transactionFormBody(productId = null, preferredType = null) {
  const products = appState.cache.products.filter((product) => !product.archived && canCreateAnyInventoryTransaction(product.categoryId));
  const selected = products.find((product) => product.id === productId) || products[0];
  if (!selected) return renderEmptyState("inventory", "Chưa có vật liệu", "Vai trò hiện tại chưa có vật liệu nào được phép giao dịch.");
  const allowedTypes = transactionTypeOptionsForCategory(selected.categoryId);
  const fixedProduct = Boolean(productId && products.some((product) => product.id === productId));
  const requestedType = String(preferredType || "");
  const firstType = allowedTypes.some(([type]) => type === requestedType) ? requestedType : allowedTypes[0]?.[0] || "";
  const fixedType = fixedProduct && Boolean(preferredType) && allowedTypes.some(([type]) => type === requestedType);
  const productField = fixedProduct
    ? `<input type="hidden" name="productId" value="${escapeHTML(selected.id)}">`
    : `<label class="field" for="transaction-product"><span class="field-label">Vật liệu</span><select id="transaction-product" name="productId" class="select">${products.map((product) => `<option value="${escapeHTML(product.id)}" ${product.id === selected.id ? "selected" : ""}>${escapeHTML(productDisplayName(product))}</option>`).join("")}</select></label>`;
  const typeField = fixedType
    ? `<input id="transaction-type" type="hidden" name="type" value="${firstType}">`
    : `<fieldset class="field"><legend class="field-label">Thao tác</legend><div id="transaction-type-buttons" class="segmented" role="group">${renderTransactionTypeButtons(selected.categoryId, firstType)}</div><input id="transaction-type" type="hidden" name="type" value="${firstType}"></fieldset>`;
  return `<form id="transaction-form" class="field-grid" novalidate>
    <input type="hidden" name="requestKey" value="${escapeHTML(makeId("request"))}">
    ${productField}
    ${typeField}
    <label class="field" for="transaction-amount"><span id="transaction-amount-label" class="field-label">${firstType === TRANSACTION_TYPES.adjust ? "Tồn thực tế" : "Số lượng"}</span>
      <div class="quantity-stepper">
        <button class="quantity-stepper-btn" type="button" data-action="transaction-step" data-delta="-1" aria-label="Giảm 1">−</button>
        <input id="transaction-amount" name="amount" class="input quantity-stepper-input" type="number" inputmode="decimal" min="0" max="${MAX_QUANTITY}" step="any" required value="${firstType === TRANSACTION_TYPES.adjust ? escapeHTML(String(normalizeQuantity(selected.quantity, 0))) : "1"}">
        <button class="quantity-stepper-btn" type="button" data-action="transaction-step" data-delta="1" aria-label="Tăng 1">+</button>
      </div>
      <span id="transaction-unit-help" class="field-help">${escapeHTML(selected.unit)}</span>
    </label>
    <div id="transaction-preview" class="helper-block">Tồn hiện tại: <strong>${formatQuantity(selected.quantity)} ${escapeHTML(selected.unit)}</strong></div>
    <label class="field" for="transaction-note"><span class="field-label">Ghi chú <span class="optional-label">(không bắt buộc)</span></span><textarea id="transaction-note" name="note" class="textarea" rows="2" placeholder=""></textarea></label>
  </form>`;
}

function openTransactionModal(productId = null, preferredType = null) {
  if (!canCreateAnyInventoryTransaction()) return showToast("error", "Không có quyền giao dịch");
  const product = productId ? productById(productId) : null;
  if (product && preferredType) {
    const permission = transactionPermission(preferredType);
    if (!permission || !hasPermission(permission, product.categoryId)) return showToast("error", "Không có quyền thực hiện thao tác này");
  }
  const title = preferredType ? (TRANSACTION_LABELS[preferredType] || "Giao dịch kho") : "Nhập / xuất kho";
  closeModal(true);
  openModal({
    name: "transaction-form",
    title,
    subtitle: product ? productDisplayName(product) : "",
    body: transactionFormBody(productId, preferredType),
    footer: `<button class="btn btn-secondary" type="button" data-action="close-modal">Hủy</button><button id="transaction-submit" class="btn btn-primary" type="submit" form="transaction-form">${transactionSubmitLabel(preferredType || $("#transaction-type")?.value)}</button>`,
  });
  updateTransactionPreview();
  window.setTimeout(() => $("#transaction-amount")?.focus(), 0);
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

  const amountInput = $("#transaction-amount", form);
  const stepperMinimum = type === TRANSACTION_TYPES.adjust ? 0 : 1;
  if (amountInput) amountInput.min = "0";

  const rawAmount = String(new FormData(form).get("amount") ?? "").trim();
  const hasAmount = rawAmount !== "";
  const amount = hasAmount ? normalizeQuantity(rawAmount, Number.NaN) : Number.NaN;
  const currentQuantity = normalizeQuantity(product.quantity, 0);
  let after = currentQuantity;
  if (hasAmount && Number.isFinite(amount)) {
    if (type === TRANSACTION_TYPES.import) after = normalizeQuantity(currentQuantity + amount, 0);
    if (type === TRANSACTION_TYPES.export) after = normalizeQuantity(currentQuantity - amount, 0);
    if (type === TRANSACTION_TYPES.adjust) after = amount;
  }

  const positiveTransaction = [TRANSACTION_TYPES.import, TRANSACTION_TYPES.export].includes(type);
  const invalidNumber = !hasAmount || !Number.isFinite(amount);
  const invalidMinimum = positiveTransaction ? amount <= 0 : amount < 0;
  const insufficientStock = type === TRANSACTION_TYPES.export && Number.isFinite(amount) && amount > currentQuantity;
  const exceedsMaximum = Number.isFinite(amount) && (amount > MAX_QUANTITY || after > MAX_QUANTITY);
  const invalid = invalidNumber || invalidMinimum || insufficientStock || exceedsMaximum || after < 0;

  setText("#transaction-amount-label", type === TRANSACTION_TYPES.adjust ? "Tồn thực tế" : "Số lượng", form);
  setText("#transaction-unit-help", product.unit, form);
  setText("#transaction-submit", transactionSubmitLabel(type, Number.isFinite(amount) ? amount : null, product.unit));

  const minusButton = $("[data-action='transaction-step'][data-delta='-1']", form);
  if (minusButton) minusButton.disabled = Number.isFinite(amount) && amount <= stepperMinimum;
  const submitButton = $("#transaction-submit");
  if (submitButton) submitButton.disabled = invalid;

  const preview = $("#transaction-preview", form);
  if (!preview) return;
  preview.classList.toggle("helper-danger", invalid);
  if (invalidNumber) {
    preview.innerHTML = `Tồn hiện tại: <strong>${formatQuantity(currentQuantity)} ${escapeHTML(product.unit)}</strong> · <strong>Nhập số lượng</strong>`;
  } else if (insufficientStock) {
    preview.innerHTML = `Tồn hiện tại: <strong>${formatQuantity(currentQuantity)} ${escapeHTML(product.unit)}</strong> · <strong>Chỉ còn ${formatQuantity(currentQuantity)} ${escapeHTML(product.unit)}</strong>`;
  } else if (invalidMinimum) {
    preview.innerHTML = `Tồn hiện tại: <strong>${formatQuantity(currentQuantity)} ${escapeHTML(product.unit)}</strong> · <strong>${positiveTransaction ? "Số lượng phải lớn hơn 0" : "Tồn không được âm"}</strong>`;
  } else if (exceedsMaximum || after < 0) {
    preview.innerHTML = `Tồn hiện tại: <strong>${formatQuantity(currentQuantity)} ${escapeHTML(product.unit)}</strong> · <strong>Số lượng không hợp lệ</strong>`;
  } else {
    preview.innerHTML = `Tồn hiện tại: <strong>${formatQuantity(currentQuantity)} ${escapeHTML(product.unit)}</strong> → <strong>${formatQuantity(after)} ${escapeHTML(product.unit)}</strong>`;
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

async function ensureLatestTransactionForProduct(productId) {
  const existing = latestTransactionForProduct(productId);
  if (existing) return existing;
  try {
    const result = await dataService.listTransactions({ limit: 1, offset: 0, productId });
    const latest = Array.isArray(result) ? result[0] : result?.items?.[0];
    if (!latest) return null;
    const byId = new Map(appState.cache.transactions.map((transaction) => [transaction.id, transaction]));
    byId.set(latest.id, latest);
    appState.cache.transactions = [...byId.values()].sort((left, right) => {
      const timeDiff = new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      return timeDiff || String(right.id).localeCompare(String(left.id));
    }).slice(0, 60);
    return latest;
  } catch (error) {
    console.warn("Không kiểm tra được giao dịch mới nhất của vật liệu.", error);
    return null;
  }
}

function transactionSnapshotRows(transaction) {
  const snapshot = transaction.productSnapshot;
  if (!snapshot?.attributes?.length) return "";
  return snapshot.attributes.map((attribute) => `<div class="detail-row"><div class="detail-key">${escapeHTML(attribute.name)}</div><div class="detail-value">${escapeHTML(`${attribute.value ?? ""}${attribute.unit ? ` ${attribute.unit}` : ""}` || "—")}</div></div>`).join("");
}

async function openTransactionDetail(transactionId) {
  const transaction = transactionById(transactionId);
  if (!transaction) return showToast("error", "Không tìm thấy giao dịch");
  if (!hasPermission(PERMISSIONS.viewHistory, transaction.categoryId)) return showToast("error", "Không có quyền xem lịch sử nhóm này");
  if (hasPermission(PERMISSIONS.reverseTransaction, transaction.categoryId) && ![TRANSACTION_TYPES.initial, TRANSACTION_TYPES.reverse].includes(transaction.type) && !transaction.reversalTransactionId && !transaction.reversedAt) {
    await ensureLatestTransactionForProduct(transaction.productId);
  }
  const delta = normalizeQuantity(transaction.afterQuantity - transaction.beforeQuantity, 0);
  const statusNotice = transaction.reversalTransactionId
    ? `<div class="notice notice-warning" style="margin-top:14px"><div class="notice-icon">${icon("warning")}</div><div><div class="notice-title">Đã hoàn tác</div><div class="notice-text">Giao dịch này đã được hoàn tác lúc ${formatDateTime(transaction.reversedAt)}.</div></div></div>`
    : transaction.reversalOf
      ? `<div class="notice notice-warning" style="margin-top:14px"><div class="notice-icon">${icon("history")}</div><div><div class="notice-title">Giao dịch hoàn tác</div><div class="notice-text">Bản ghi này đưa tồn về trạng thái trước giao dịch gốc.</div></div></div>`
      : "";
  const reverseButton = canReverseTransactionRecord(transaction)
    ? `<button class="btn btn-danger" type="button" data-action="open-reverse-transaction" data-transaction-id="${escapeHTML(transaction.id)}">Hoàn tác</button>`
    : "";
  openModal({
    name: "transaction-detail",
    title: TRANSACTION_LABELS[transaction.type] || "Chi tiết giao dịch",
    subtitle: transaction.productName,
    body: `<div class="transaction-detail-summary">
      <div class="transaction-detail-amount">${delta > 0 ? "+" : ""}${formatQuantity(delta)} <span>${escapeHTML(transaction.unit)}</span></div>
      <div>${formatDateTime(transaction.createdAt)}</div>
    </div>
    <div class="detail-grid">
      <div class="detail-row"><div class="detail-key">Tồn trước → sau</div><div class="detail-value">${formatQuantity(transaction.beforeQuantity)} → ${formatQuantity(transaction.afterQuantity)} ${escapeHTML(transaction.unit)}</div></div>
      ${transaction.note ? `<div class="detail-row"><div class="detail-key">Ghi chú</div><div class="detail-value">${escapeHTML(transaction.note)}</div></div>` : ""}
      <div class="detail-row"><div class="detail-key">Người thực hiện</div><div class="detail-value">${escapeHTML(transaction.actor || "—")}</div></div>
    </div>${statusNotice}`,
    footer: `<button class="btn btn-secondary" type="button" data-action="close-modal">Đóng</button>${reverseButton}`,
  });
}

function reverseReasonOptions(transaction) {
  const contextual = transaction?.type === TRANSACTION_TYPES.import
    ? "Nhập nhầm"
    : transaction?.type === TRANSACTION_TYPES.export
      ? "Xuất nhầm"
      : "Điều chỉnh nhầm";
  return [contextual, "Sai số lượng", "Nhầm vật liệu", "Khác"];
}

function updateReverseReasonState() {
  const form = $("#reverse-transaction-form");
  if (!form) return;
  const selected = $("[data-action='select-reverse-reason'][aria-pressed='true']", form);
  const preset = String(selected?.dataset.reason || "");
  const customWrap = $("#reverse-custom-reason-wrap", form);
  const customInput = $("#reverse-custom-reason", form);
  const reasonInput = $("#reverse-reason", form);
  const submitButton = $("[type='submit'][form='reverse-transaction-form']");
  const useCustom = preset === "Khác";
  if (customWrap) customWrap.hidden = !useCustom;
  const reason = useCustom ? String(customInput?.value || "").trim() : preset;
  if (reasonInput) reasonInput.value = reason;
  if (submitButton) submitButton.disabled = !reason;
}

function openReverseTransactionModal(transactionId) {
  const transaction = transactionById(transactionId);
  if (!canReverseTransactionRecord(transaction)) return showToast("error", "Không thể hoàn tác", "Chỉ giao dịch mới nhất, chưa được hoàn tác và còn khớp tồn hiện tại mới được phép hoàn tác.");
  const reasons = reverseReasonOptions(transaction);
  closeModal(true);
  openModal({
    name: "reverse-transaction-form",
    title: "Hoàn tác giao dịch",
    subtitle: `${transaction.productName} · ${TRANSACTION_LABELS[transaction.type]}`,
    body: `<form id="reverse-transaction-form" class="field-grid" novalidate>
      <input type="hidden" name="transactionId" value="${escapeHTML(transaction.id)}">
      <input type="hidden" name="requestKey" value="${escapeHTML(makeId("reverse-request"))}">
      <input id="reverse-reason" type="hidden" name="reason" value="">
      <div class="notice notice-danger"><div class="notice-icon">${icon("warning")}</div><div><div class="notice-title">Hoàn tác sẽ đổi lại tồn</div><div class="notice-text">Tồn sẽ từ ${formatQuantity(transaction.afterQuantity)} về ${formatQuantity(transaction.beforeQuantity)} ${escapeHTML(transaction.unit)}. Lịch sử cũ vẫn được giữ.</div></div></div>
      <fieldset class="field"><legend class="field-label">Lý do hoàn tác *</legend>
        <div class="quick-reason-grid" role="group" aria-label="Chọn lý do hoàn tác">${reasons.map((reason) => `<button class="quick-reason-btn" type="button" data-action="select-reverse-reason" data-reason="${escapeHTML(reason)}" aria-pressed="false">${escapeHTML(reason)}</button>`).join("")}</div>
      </fieldset>
      <label id="reverse-custom-reason-wrap" class="field" for="reverse-custom-reason" hidden><span class="field-label">Lý do khác</span><textarea id="reverse-custom-reason" class="textarea" rows="3" maxlength="300" placeholder="Nhập lý do ngắn gọn"></textarea></label>
    </form>`,
    footer: `<button class="btn btn-secondary" type="button" data-action="close-modal">Hủy</button><button class="btn btn-danger" type="submit" form="reverse-transaction-form" disabled>Hoàn tác</button>`,
  });
}

function openFaqModal() {
  openModal({
    name: "faq",
    title: "Hướng dẫn sử dụng",
    subtitle: "Cách dùng và xử lý các lỗi thường gặp.",
    body: `<div class="faq-list">
      <details open><summary>Bắt đầu sử dụng như thế nào?</summary><div><strong>1.</strong> Vào <strong>Kho</strong> để tìm vật liệu. <strong>2.</strong> Chạm vật liệu để xem tồn. <strong>3.</strong> Chọn <strong>Nhập / Xuất / Điều chỉnh</strong>. <strong>4.</strong> Xem lại giao dịch trong <strong>Lịch sử</strong>. Dấu <strong>?</strong> ở góc trên luôn mở lại hướng dẫn này.</div></details>
      <details><summary>Tìm và lọc vật liệu như thế nào?</summary><div>Gõ các phần bạn nhớ, không cần đúng thứ tự, không cần dấu tiếng Việt hoặc dấu phân cách. Ví dụ <strong>dao cat 0.7 23.8</strong>. Có thể lọc thêm theo nhóm, tình trạng và số lượng dưới một mức. Nếu tìm không ra, hãy xóa bớt từ khóa hoặc bỏ bộ lọc đang bật.</div></details>
      <details><summary>Nhập kho dùng như thế nào?</summary><div>Mở vật liệu → <strong>Nhập</strong>. Số lượng mặc định là <strong>1</strong>; bấm <strong>+</strong> hoặc <strong>−</strong> để tăng/giảm từng 1, hoặc chạm vào số để nhập trực tiếp. Nút − không giảm dưới 1; nếu cần số lẻ có thể chạm vào số và nhập trực tiếp. Ghi chú là tùy chọn.</div></details>
      <details><summary>Xuất kho dùng như thế nào? Khi nào bị lỗi?</summary><div>Mở vật liệu → <strong>Xuất</strong>. Số lượng mặc định là <strong>1</strong>; nút +/− thay đổi từng 1 và vẫn có thể nhập trực tiếp, kể cả số lẻ khi cần. App không cho xuất quá tồn. Nếu hiện <strong>Chỉ còn…</strong>, hãy giảm số xuất hoặc kiểm tra thực tế rồi dùng <strong>Điều chỉnh</strong> nếu tồn trên app đang sai.</div></details>
      <details><summary>Điều chỉnh tồn dùng khi nào?</summary><div>Dùng sau khi đếm thực tế và thấy tồn trên app không đúng. Khi mở, số mặc định chính là <strong>tồn hiện tại</strong>; dùng +/− từng 1 hoặc nhập trực tiếp <strong>số tồn thực tế cuối cùng</strong>. Ví dụ app có 12 nhưng thực tế còn 10 thì nhập 10, không nhập −2.</div></details>
      <details><summary>Ghi chú có bắt buộc không?</summary><div>Với <strong>Nhập / Xuất / Điều chỉnh</strong>, ghi chú là tùy chọn. <strong>Hoàn tác</strong> vẫn cần lý do, nhưng chỉ cần chạm một lý do nhanh như <strong>Xuất nhầm / Sai số lượng / Nhầm vật liệu</strong>. Chỉ khi chọn <strong>Khác</strong> mới phải nhập chữ.</div></details>
      <details><summary>Sửa vật liệu như thế nào?</summary><div>Mở vật liệu → nút <strong>⋯</strong> → <strong>Sửa vật liệu</strong>. Có thể sửa thông số, đơn vị, mức cảnh báo, ghi chú hoặc tên hiển thị. Tên sau khi lưu được xem trước ngay trong form. Tồn kho không thay đổi khi sửa thông tin.</div></details>
      <details><summary>Vì sao sửa vật liệu báo trùng quy cách?</summary><div>Hệ thống chống tạo hai vật liệu có cùng bộ thông số nhận diện. Nếu báo trùng, hãy tìm lại vật liệu đang có trước khi tạo hoặc sửa. Không nên đổi thông số chỉ để vượt kiểm tra trùng vì sẽ làm dữ liệu khó đối soát.</div></details>
      <details><summary>Lịch sử xem và tìm như thế nào?</summary><div>Vào <strong>Lịch sử</strong>, dùng ‹ › để chuyển tháng. Có thể tìm theo tên/thông số hoặc mở <strong>Bộ lọc</strong> để chọn loại giao dịch, nhóm và khoảng ngày. Nếu có nhiều giao dịch, bấm <strong>Tải thêm</strong>; khi tìm kiếm, app sẽ quét toàn bộ phạm vi đang chọn.</div></details>
      <details><summary>Hoàn tác giao dịch dùng khi nào? Vì sao không bấm được?</summary><div>Hoàn tác dùng khi giao dịch vừa ghi bị sai và cần đưa tồn về trạng thái trước đó. Chọn một <strong>lý do nhanh</strong>; chọn <strong>Khác</strong> mới cần gõ. Chỉ giao dịch mới nhất phù hợp, chưa từng hoàn tác và còn khớp tồn hiện tại mới được phép. Nếu không bấm được, thường là đã có giao dịch mới hơn, giao dịch đã hoàn tác hoặc tồn hiện tại đã thay đổi.</div></details>
      <details><summary>Xuất PDF tồn kho như thế nào?</summary><div>Ở <strong>Kho</strong>, bấm PDF → chọn phạm vi → tick đúng những vật liệu muốn xuất → chọn các cột/thông số cần có → chọn A4 dọc/ngang → xuất. Nếu không tick vật liệu hoặc không chọn cột nào, app sẽ không tạo báo cáo. PDF chỉ chứa thông tin tài khoản hiện tại được quyền xem.</div></details>
      <details><summary>Xuất PDF Lịch sử như thế nào?</summary><div>Chọn tháng hoặc bộ lọc Lịch sử trước, sau đó bấm PDF và chọn các thông tin muốn xuất. App lấy toàn bộ dữ liệu trong phạm vi đã chọn, không chỉ những dòng đầu đang hiện trên màn hình.</div></details>
      <details><summary>Phân tích tháng đọc như thế nào?</summary><div>Vào <strong>Lịch sử → Phân tích</strong>. Các số Nhập, Xuất và tồn là dữ liệu thực tế từ lịch sử; xu hướng và lượng đề xuất mua là <strong>ước tính</strong> dựa trên mức dùng trước đó. Không so trực tiếp vật liệu khác đơn vị. Nếu lịch sử cũ đã bị ẩn/xóa hoặc dữ liệu chưa đủ, kết quả phân tích có thể thiếu và app sẽ hạn chế đưa ra đề xuất.</div></details>
      <details><summary>Vì sao báo “Dữ liệu đã được người khác cập nhật”?</summary><div>Một thiết bị khác vừa sửa cùng vật liệu hoặc dữ liệu bạn đang mở đã cũ. Đóng form, chờ app đồng bộ hoặc mở lại vật liệu rồi thao tác lại. Đây là cơ chế bảo vệ để tránh ghi đè dữ liệu mới.</div></details>
      <details><summary>Vì sao báo “Không có quyền”?</summary><div>Tài khoản hiện tại không được cấp thao tác đó hoặc không được thao tác trên nhóm vật liệu đó. Hãy dùng chức năng khác được cấp hoặc liên hệ Admin/Super Admin. Các mục <strong>Nâng cao</strong> chỉ Admin/Super Admin nhìn thấy.</div></details>
      <details><summary>Vì sao báo mất kết nối hoặc không tải được dữ liệu?</summary><div>Kiểm tra Wi‑Fi/4G rồi mở lại app hoặc chờ kết nối trở lại. Khi có mạng, Realtime sẽ đồng bộ lại. Nếu vẫn lỗi trong khi mạng bình thường, thử đăng xuất/đăng nhập lại. Không nhập lặp nhiều lần khi chưa biết giao dịch trước đã thành công hay chưa; hãy kiểm tra <strong>Lịch sử</strong> trước.</div></details>
      <details><summary>Phiên đăng nhập không còn hợp lệ nghĩa là gì?</summary><div>Phiên có thể đã hết hạn, tài khoản bị khóa/ngừng sử dụng hoặc mật khẩu vừa được quản trị đặt lại. Đăng nhập lại. Nếu vẫn không vào được, liên hệ Super Admin kiểm tra trạng thái tài khoản.</div></details>
      <details><summary>Xóa vật liệu test và Lưu trữ khác nhau thế nào?</summary><div><strong>Lưu trữ</strong> chỉ ẩn vật liệu và vẫn giữ lịch sử; thường nên dùng cho vật liệu không còn sử dụng. <strong>Xóa vật liệu test</strong> xóa vĩnh viễn vật liệu cùng giao dịch liên quan và chỉ dành cho Admin/Super Admin. Không dùng xóa test cho dữ liệu thật.</div></details>
    </div>`,
    footer: `<button class="btn btn-primary" type="button" data-action="close-modal">Đóng hướng dẫn</button>`,
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
    <label class="field" for="account-scope-mode"><span class="field-label">Phạm vi nhóm vật liệu</span><select id="account-scope-mode" name="scopeMode" class="select"><option value="all" ${model.scopeMode !== "custom" ? "selected" : ""}>Tất cả nhóm theo vai trò</option><option value="custom" ${model.scopeMode === "custom" ? "selected" : ""}>Tùy chỉnh theo từng nhóm</option></select><span class="field-help">Quyền quản trị hệ thống vẫn theo vai trò. Quyền thao tác cần kèm Xem kho; quyền giao dịch cần kèm Xem số lượng; Hoàn tác giao dịch cần kèm Xem lịch sử.</span></label>
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
  const transactions = filteredHistoryTransactions();
  list.innerHTML = renderGroupedHistory(transactions);
  setText("#history-result-count", historyResultCountText(transactions));
}

async function refreshHistoryForFilters({ loadAllForSearch = false } = {}) {
  const { from, to } = appState.filters.history;
  if (from && to && from > to) {
    showToast("error", "Khoảng ngày không hợp lệ", "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.");
    return false;
  }
  const ok = await loadHistoryTransactions({ reset: true, loadAll: loadAllForSearch || Boolean(searchTokens(appState.filters.history.search).length), render: false });
  renderApp();
  return ok;
}

const debouncedInventoryFilter = debounce(updateInventoryListOnly, 160);
const debouncedHistoryFilter = debounce(async () => {
  if (appState.screen !== SCREENS.history) return;
  if (searchTokens(appState.filters.history.search).length && !appState.cache.historyMeta.allLoaded) {
    await loadHistoryTransactions({ reset: true, loadAll: true, render: false });
    renderApp();
    return;
  }
  updateHistoryListOnly();
}, 220);

async function switchScreen(screen, manageTarget = null) {
  if (!Object.values(SCREENS).includes(screen)) return;
  appState.screen = screen;
  if (screen === SCREENS.manage) {
    if (manageTarget && Object.values(MANAGE_TABS).includes(manageTarget) && canOpenManageTab(manageTarget)) appState.manageTab = manageTarget;
    else appState.manageTab = MANAGE_TABS.home;
    if (!canOpenManageTab(appState.manageTab)) appState.manageTab = MANAGE_TABS.home;
  }
  closeModal(true);
  if (screen === SCREENS.history) {
    if (appState.filters.history.view === "analysis") await loadMonthlyAnalysis({ render: false });
    else await loadHistoryTransactions({ reset: true, loadAll: Boolean(searchTokens(appState.filters.history.search).length), render: false });
  }
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
      appState.screen = SCREENS.inventory;
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
      appState.screen = SCREENS.inventory;
      appState.cache = {
        schema: null,
        products: [],
        transactions: [],
        historyTransactions: [],
        historyMeta: { total: 0, nextOffset: null, allLoaded: false, queryKey: "" },
        monthlyAnalysis: { key: "", data: null, error: "" },
        accounts: [],
        accountAudit: [],
        loaded: { bootstrap: false, transactions: false, historyTransactions: false, accounts: false, accountAudit: false },
      };
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
      showToast("success", result.duplicate ? "Giao dịch đã tồn tại" : "Đã lưu giao dịch", `${productDisplayName(result.product)}: ${formatQuantity(result.product.quantity)} ${result.product.unit}`);
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
  const reason = String(data.get("reason") || "").trim();
  const submitButton = $(`[type="submit"][form="${form.getAttribute("id")}"]`);
  if (!reason) {
    showToast("error", "Chọn lý do hoàn tác", "Chọn một lý do nhanh hoặc nhập lý do khác.");
    return;
  }
  await withActionLock(`reverse:${transactionId}`, submitButton, async () => {
    try {
      const result = await dataService.reverseTransaction({
        transactionId,
        reason,
        requestKey: data.get("requestKey"),
      });
      await refreshInventoryAndHistory({ render: false });
      closeModal(true);
      renderApp();
      showToast("success", result.duplicate ? "Hoàn tác đã tồn tại" : "Đã hoàn tác giao dịch", `${productDisplayName(result.product)}: ${formatQuantity(result.product.quantity)} ${result.product.unit}`);
      announce("Đã hoàn tác giao dịch và cập nhật tồn kho.");
    } catch (error) {
      showToast("error", "Không thể hoàn tác giao dịch", error.message);
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
      await loadTransactions({ render: false, limit: 50 });
      if (appState.screen === SCREENS.history) await loadHistoryTransactions({ reset: true, loadAll: Boolean(searchTokens(appState.filters.history.search).length), render: false });
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
    const nextTab = button.dataset.manageTab;
    if (!Object.values(MANAGE_TABS).includes(nextTab) || !canOpenManageTab(nextTab)) {
      showToast("error", "Không có quyền", "Mục này không dành cho tài khoản hiện tại.");
      return;
    }
    appState.manageTab = nextTab;
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
      invalidatePendingDataRequests();
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
  on(document, "click", "[data-action='open-product-actions']", (event, button) => openProductActions(button.dataset.productId));
  on(document, "click", "[data-action='back-product-detail']", (event, button) => openProductDetail(button.dataset.productId));
  on(document, "click", "[data-action='add-product']", () => openProductForm());
  on(document, "click", "[data-action='edit-product']", (event, button) => openProductForm(button.dataset.productId));
  on(document, "click", "[data-action='open-transaction']", (event, button) => openTransactionModal(button.dataset.productId));
  on(document, "click", "[data-action='quick-transaction']", (event, button) => openTransactionModal(button.dataset.productId, button.dataset.type));
  on(document, "click", "[data-action='open-transaction-detail']", async (event, button) => { await openTransactionDetail(button.dataset.transactionId); });
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
      message: `Vật liệu “${productDisplayName(product)}” sẽ ẩn khỏi kho nhưng lịch sử vẫn được giữ.`,
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

  on(document, "click", "[data-action='delete-test-product']", (event, button) => {
    const product = productById(button.dataset.productId);
    if (!product) return;
    if (!canDeleteTestProduct()) {
      showToast("error", "Không có quyền", "Chỉ Admin hoặc Super Admin được xóa vật liệu test.");
      return;
    }
    closeModal(true);
    openConfirm({
      title: "Xóa vật liệu test?",
      message: `Chỉ dùng cho dữ liệu thử nghiệm. “${productDisplayName(product)}” và toàn bộ giao dịch riêng của vật liệu này sẽ bị xóa vĩnh viễn. Không thể hoàn tác.`,
      confirmLabel: "Xóa vĩnh viễn",
      danger: true,
      onConfirm: async (confirmButton) => {
        await withActionLock(`delete-test-product:${product.id}`, confirmButton, async () => {
          try {
            const result = await dataService.deleteTestProduct(product.id, product.revision ?? null, makeId("delete-test-product"));
            await refreshInventoryAndHistory({ render: false });
            closeModal(true);
            renderApp();
            const count = toNumber(result?.transactionCount, 0);
            showToast("success", "Đã xóa vật liệu test", count ? `Đã xóa ${count} giao dịch liên quan.` : "Không còn dữ liệu của vật liệu trong kho.");
          } catch (error) {
            showToast("error", "Không thể xóa vật liệu", error.message);
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

  on(document, "click", "[data-action='transaction-step']", (event, button) => {
    const form = $("#transaction-form");
    const input = $("#transaction-amount", form || document);
    if (!form || !input) return;
    const delta = Number(button.dataset.delta || 0);
    const type = String(new FormData(form).get("type") || "");
    const product = productById(new FormData(form).get("productId"));
    const minimum = type === TRANSACTION_TYPES.adjust ? 0 : 1;
    const blankBase = type === TRANSACTION_TYPES.adjust ? normalizeQuantity(product?.quantity, 0) : 1;
    const current = String(input.value || "").trim() === "" ? blankBase : normalizeQuantity(input.value, blankBase);
    input.value = String(Math.min(MAX_QUANTITY, Math.max(minimum, normalizeQuantity(current + delta, minimum))));
    updateTransactionPreview();
    input.focus();
  });

  on(document, "click", "[data-action='select-transaction-type']", (event, button) => {
    const form = $("#transaction-form");
    if (!form) return;
    const typeInput = $("#transaction-type", form);
    const amountInput = $("#transaction-amount", form);
    const previousType = typeInput?.value || "";
    const nextType = String(button.dataset.type || "");
    $$("[data-action='select-transaction-type']", form).forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    setValue("#transaction-type", nextType, form);
    if (amountInput && nextType !== previousType) {
      const product = productById(new FormData(form).get("productId"));
      amountInput.value = nextType === TRANSACTION_TYPES.adjust ? String(normalizeQuantity(product?.quantity, 0)) : "1";
    }
    updateTransactionPreview();
  });

  on(document, "click", "[data-action='select-reverse-reason']", (event, button) => {
    const form = $("#reverse-transaction-form");
    if (!form) return;
    $$("[data-action='select-reverse-reason']", form).forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    updateReverseReasonState();
    if (button.dataset.reason === "Khác") window.setTimeout(() => $("#reverse-custom-reason", form)?.focus(), 0);
  });

  on(document, "click", "[data-action='open-faq']", () => openFaqModal());
  on(document, "click", "[data-action='open-inventory-pdf']", () => openInventoryPdfModal());
  on(document, "click", "[data-action='open-history-pdf']", () => openHistoryPdfModal());
  on(document, "click", "[data-action='pdf-select-all-products']", () => {
    const form = $("#pdf-inventory-form");
    if (!form) return;
    $$('input[name="productIds"]', form).forEach((input) => { input.checked = true; });
    updateInventoryPdfProductSelectionCount();
  });
  on(document, "click", "[data-action='pdf-clear-products']", () => {
    const form = $("#pdf-inventory-form");
    if (!form) return;
    $$('input[name="productIds"]', form).forEach((input) => { input.checked = false; });
    updateInventoryPdfProductSelectionCount();
  });

  on(document, "click", "[data-action='set-history-view']", async (event, button) => {
    const view = button.dataset.view === "analysis" ? "analysis" : "transactions";
    if (appState.filters.history.view === view) return;
    appState.filters.history.view = view;
    renderApp();
    if (view === "analysis") await loadMonthlyAnalysis({ render: true });
    else if (!appState.cache.loaded.historyTransactions || appState.cache.historyMeta.queryKey !== historyQueryKey()) await loadHistoryTransactions({ reset: true, loadAll: Boolean(appState.filters.history.search), render: true });
  });

  on(document, "click", "[data-action='reload-monthly-analysis']", async () => { await loadMonthlyAnalysis({ render: true, force: true }); });

  on(document, "click", "[data-action='toggle-history-filters']", () => {
    appState.filters.history.filtersOpen = !appState.filters.history.filtersOpen;
    renderApp();
  });

  on(document, "click", "[data-action='history-shift-month']", async (event, button) => {
    const delta = Number(button.dataset.delta || 0);
    const nextMonth = shiftMonthKey(appState.filters.history.month, delta);
    if (nextMonth > currentMonthKey()) return;
    appState.filters.history.month = nextMonth;
    appState.filters.history.from = "";
    appState.filters.history.to = "";
    if (appState.filters.history.view === "analysis") await loadMonthlyAnalysis({ render: true, force: true });
    else await refreshHistoryForFilters();
  });

  on(document, "click", "[data-action='history-current-month']", async () => {
    appState.filters.history.month = currentMonthKey();
    appState.filters.history.from = "";
    appState.filters.history.to = "";
    if (appState.filters.history.view === "analysis") await loadMonthlyAnalysis({ render: true, force: true });
    else await refreshHistoryForFilters();
  });

  on(document, "click", "[data-action='load-more-history']", async () => {
    await loadHistoryTransactions({ reset: false, loadAll: false, render: false });
    renderApp();
  });

  on(document, "click", "[data-action='clear-history-filters']", async () => {
    appState.filters.history.type = "all";
    appState.filters.history.category = "all";
    appState.filters.history.from = "";
    appState.filters.history.to = "";
    await refreshHistoryForFilters();
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
    const handledForms = new Set(["bootstrap-form", "login-form", "product-form", "transaction-form", "reverse-transaction-form", "history-cleanup-form", "account-form", "password-reset-form", "category-form", "pdf-inventory-form", "pdf-history-form"]);
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
    if (formId === "pdf-inventory-form") handleInventoryPdfSubmit(event, form);
    if (formId === "pdf-history-form") handleHistoryPdfSubmit(event, form);
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
    if (target.id === "reverse-custom-reason" && target.closest("#reverse-transaction-form")) updateReverseReasonState();
  });

  document.addEventListener("change", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
    if (target.name === "scope" && target.closest("#pdf-inventory-form")) {
      updateInventoryPdfProductOptions();
      updateInventoryPdfAttributeOptions();
      return;
    }
    if (target.name === "productIds" && target.closest("#pdf-inventory-form")) {
      updateInventoryPdfProductSelectionCount();
      return;
    }
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
      await refreshHistoryForFilters();
    }
    if (target.id === "history-category") {
      appState.filters.history.category = target.value;
      await refreshHistoryForFilters();
    }
    if (target.id === "analysis-category") {
      appState.filters.history.analysisCategory = target.value;
      await loadMonthlyAnalysis({ render: true, force: true });
    }
    if (target.id === "history-from") {
      appState.filters.history.from = target.value;
      await refreshHistoryForFilters();
    }
    if (target.id === "history-to") {
      appState.filters.history.to = target.value;
      await refreshHistoryForFilters();
    }
    if (target.id === "product-category") refreshProductFormForCategory(target.value);
    if (target.id === "transaction-product") {
      const form = target.closest("#transaction-form");
      const amountInput = $("#transaction-amount", form || document);
      const type = String($("#transaction-type", form || document)?.value || "");
      const product = productById(target.value);
      if (amountInput) amountInput.value = type === TRANSACTION_TYPES.adjust ? String(normalizeQuantity(product?.quantity, 0)) : "1";
      updateTransactionPreview();
    }
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
  appState.cache.historyTransactions = [];
  appState.cache.historyMeta = { total: 0, nextOffset: null, allLoaded: false, queryKey: "" };
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
    const registration = await navigator.serviceWorker.register(`./service-worker.js?v=${encodeURIComponent(APP_VERSION)}&b=${encodeURIComponent(BUILD_ID)}`);
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
