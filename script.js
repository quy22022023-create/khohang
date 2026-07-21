// Kho khuôn bế Packaging v3.3.0 - phân quyền theo vai trò, nhóm và thuộc tính
'use strict';

const SUPABASE_URL = 'https://khoztrzdfadovsgmfggi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtob3p0cnpkZmFkb3ZzZ21mZ2dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NDU0MTgsImV4cCI6MjA5NTQyMTQxOH0.72V5ZbvzHOk6k5XViVaEEB3Aoz9AjyLt3AGx5L3gqCY';
const APP_SCHEMA_ROW = '__app_schema_khuon_be_v3__';
const SESSION_KEY = 'kho_session';
const THEME_KEY = 'kho_theme_v3';
const VIEW_MODE_KEY = 'kho_inventory_view_v3';
const ACCESS_POLICY_ROW = '__access_policy_khuon_be_v1__';
const ACCESS_PROFILE_VERSION = 1;

const DEFAULT_GUEST_POLICY = {
  enabled: false,
  visibleScreens: { inventory: true, history: false, settings: false },
  showName: true,
  showSpec: true,
  showQuantity: false,
  showWarning: false,
  allowSearch: true,
  allowFilter: true,
  allowDetail: true,
  allowExport: false,
  groups: {}
};

const ROLE_PRESETS = {
  viewer: ['xem_kho', 'xem_so_luong', 'xem_chi_tiet'],
  warehouse_staff: ['xem_kho', 'xem_so_luong', 'xem_chi_tiet', 'bao_cao', 'nhap_xuat'],
  group_manager: ['xem_kho', 'xem_so_luong', 'xem_chi_tiet', 'bao_cao', 'nhap_xuat', 'them_sp', 'sua_xoa', 'sua_canh_bao'],
  warehouse_manager: ['xem_kho', 'xem_so_luong', 'xem_chi_tiet', 'bao_cao', 'nhap_xuat', 'kiem_ke', 'dieu_chinh_ton', 'hoan_tac_giao_dich', 'them_sp', 'sua_xoa', 'sua_canh_bao', 'xoa_vat_lieu', 'thuoc_tinh', 'quan_ly_gia_tri', 'quy_tac_ten'],
  auditor: ['xem_kho', 'xem_so_luong', 'xem_chi_tiet', 'bao_cao', 'kiem_ke', 'dieu_chinh_ton'],
  superadmin: ['superadmin'],
  custom: []
};

const RESERVED_ATTRIBUTE_KEYS = new Set([
  '__category', '__unit', '__warning', '__signature', '__schemaVersion',
  '__nameMode', '__customName'
]);

const DEFAULT_SCHEMA = {
  version: 3,
  categories: [
    {
      id: 'dao',
      name: 'Dao',
      icon: '╱',
      units: ['m', 'cuộn'],
      defaultUnit: 'm',
      warningDefault: 20,
      naming: { style: 'knife', applyExisting: 'on-edit' },
      attributes: [
        { id: 'dao-loai', name: 'Loại dao', type: 'select', options: ['Dao cắt', 'Dao cấn', 'Dao răng', 'Dao đứt đoạn'], unit: '', required: true, identity: true, list: true, filter: true, nameRole: 'title', namePrefix: '' },
        { id: 'dao-chieu-cao', name: 'Chiều cao', type: 'number', options: [], unit: 'mm', required: true, identity: true, list: true, filter: true, nameRole: 'title', namePrefix: 'H' },
        { id: 'dao-do-day', name: 'Độ dày', type: 'number', options: [], unit: 'mm', required: true, identity: true, list: true, filter: true, nameRole: 'title', namePrefix: 'T' },
        { id: 'dao-kieu-luoi', name: 'Kiểu lưỡi', type: 'select', options: ['Lưỡi giữa', 'Lưỡi lệch', 'Một bên'], unit: '', required: false, identity: true, list: true, filter: true, nameRole: 'meta', namePrefix: '' }
      ]
    },
    {
      id: 'van-bang',
      name: 'Ván bằng',
      icon: '▭',
      units: ['tấm'],
      defaultUnit: 'tấm',
      warningDefault: 3,
      naming: { style: 'flat-board', applyExisting: 'on-edit' },
      attributes: [
        { id: 'vb-chieu-dai', name: 'Chiều dài', type: 'number', options: [], unit: 'mm', required: true, identity: true, list: true, filter: true, nameRole: 'title', namePrefix: '' },
        { id: 'vb-chieu-rong', name: 'Chiều rộng', type: 'number', options: [], unit: 'mm', required: true, identity: true, list: true, filter: true, nameRole: 'title', namePrefix: '' },
        { id: 'vb-do-day', name: 'Độ dày', type: 'number', options: [], unit: 'mm', required: true, identity: true, list: true, filter: true, nameRole: 'title', namePrefix: '' },
        { id: 'vb-loai', name: 'Loại ván', type: 'text', options: [], unit: '', required: false, identity: true, list: true, filter: true, nameRole: 'meta', namePrefix: '' }
      ]
    },
    {
      id: 'van-tron',
      name: 'Ván tròn',
      icon: '◯',
      units: ['bộ', 'tấm'],
      defaultUnit: 'bộ',
      warningDefault: 1,
      naming: { style: 'round-board', applyExisting: 'on-edit' },
      attributes: [
        { id: 'vt-loai', name: 'Loại hoặc máy', type: 'text', options: [], unit: '', required: true, identity: true, list: true, filter: true, nameRole: 'title', namePrefix: '' },
        { id: 'vt-duong-kinh', name: 'Đường kính', type: 'number', options: [], unit: 'mm', required: true, identity: true, list: true, filter: true, nameRole: 'title', namePrefix: 'Ø' },
        { id: 'vt-chieu-rong', name: 'Chiều rộng', type: 'number', options: [], unit: 'mm', required: false, identity: true, list: true, filter: true, nameRole: 'title', namePrefix: '' },
        { id: 'vt-do-day', name: 'Độ dày', type: 'number', options: [], unit: 'mm', required: false, identity: true, list: true, filter: true, nameRole: 'meta', namePrefix: 'T' }
      ]
    },
    {
      id: 'phu-lieu',
      name: 'Phụ liệu',
      icon: '◇',
      units: ['cái', 'hộp', 'm', 'tấm'],
      defaultUnit: 'cái',
      warningDefault: 5,
      naming: { style: 'generic', applyExisting: 'on-edit' },
      attributes: [
        { id: 'pl-ten', name: 'Tên vật liệu', type: 'text', options: [], unit: '', required: true, identity: true, list: true, filter: true, nameRole: 'title', namePrefix: '' },
        { id: 'pl-quy-cach', name: 'Quy cách', type: 'text', options: [], unit: '', required: false, identity: true, list: true, filter: true, nameRole: 'meta', namePrefix: '' }
      ]
    }
  ]
};

const state = {
  client: null,
  dbReady: false,
  products: [],
  logs: [],
  schema: structuredCloneSafe(DEFAULT_SCHEMA),
  schemaDraft: null,
  currentUser: 'Khách',
  permissions: [],
  accessProfile: null,
  guestPolicy: structuredCloneSafe(DEFAULT_GUEST_POLICY),
  users: [],
  editingUserProfile: null,
  permissionPanel: 'users',
  selectedProductId: null,
  currentScreen: 'inventory',
  categoryFilter: 'all',
  stockFilter: 'all',
  sortMode: 'smart',
  advancedFilters: {},
  draftAdvancedFilters: {},
  draftFilterCategoryId: null,
  viewMode: 'detailed',
  searchTimer: null,
  historyType: 'all',
  historySearch: '',
  transactionType: 'import',
  locks: new Set(),
  requestIds: { products: 0, history: 0, users: 0 },
  studioCategoryId: null,
  editingAttributeId: null,
  confirmResolver: null
};

function structuredCloneSafe(value) {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function byId(id) {
  return document.getElementById(id);
}

function all(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function parsePermissions(value) {
  const profile = parseAccessProfile(value);
  return profile.permissions;
}

function hasPermission(permission) {
  return state.permissions.includes('superadmin') || state.permissions.includes(permission);
}

function parseJsonValue(value) {
  if (value && typeof value === 'object') return value;
  try { return JSON.parse(value || 'null'); } catch { return null; }
}

function parseAccessProfile(value, username = '') {
  const parsed = parseJsonValue(value);
  if (Array.isArray(parsed)) {
    return { version: 0, mode: 'legacy', baseRole: parsed.includes('superadmin') ? 'superadmin' : 'custom', permissions: parsed, groups: null, attributes: {} };
  }
  if (parsed && typeof parsed === 'object' && Array.isArray(parsed.permissions)) {
    return {
      version: Number(parsed.version || ACCESS_PROFILE_VERSION),
      mode: parsed.mode || 'access-profile',
      baseRole: parsed.baseRole || (parsed.permissions.includes('superadmin') ? 'superadmin' : 'custom'),
      permissions: [...new Set(parsed.permissions.map(String))],
      groups: parsed.groups && typeof parsed.groups === 'object' ? structuredCloneSafe(parsed.groups) : {},
      attributes: parsed.attributes && typeof parsed.attributes === 'object' ? structuredCloneSafe(parsed.attributes) : {},
      username
    };
  }
  return { version: 0, mode: 'legacy', baseRole: 'custom', permissions: [], groups: null, attributes: {}, username };
}

function normalizeGuestPolicy(policy) {
  const source = policy && typeof policy === 'object' ? policy : {};
  return {
    ...structuredCloneSafe(DEFAULT_GUEST_POLICY),
    ...source,
    visibleScreens: { ...DEFAULT_GUEST_POLICY.visibleScreens, ...(source.visibleScreens || {}) },
    groups: source.groups && typeof source.groups === 'object' ? { ...source.groups } : {}
  };
}

function isGuestUser() {
  return state.currentUser === 'Khách';
}

function isStructuredProfile(profile = state.accessProfile) {
  return Boolean(profile && profile.mode === 'access-profile' && profile.groups && typeof profile.groups === 'object');
}

function legacyGroupScope(categoryId) {
  return {
    view: true,
    quantity: true,
    transact: hasPermission('nhap_xuat'),
    editProduct: hasPermission('them_sp') || hasPermission('sua_xoa'),
    manageAttributes: hasPermission('thuoc_tinh')
  };
}

function getEffectiveGroupScope(categoryId, profile = state.accessProfile) {
  if (state.permissions.includes('superadmin')) return { view: true, quantity: true, transact: true, editProduct: true, manageAttributes: true };
  if (isGuestUser()) {
    const allowed = state.guestPolicy.enabled && state.guestPolicy.groups?.[categoryId] !== false;
    return {
      view: allowed,
      quantity: allowed && Boolean(state.guestPolicy.showQuantity),
      transact: false,
      editProduct: false,
      manageAttributes: false
    };
  }
  if (!isStructuredProfile(profile)) return legacyGroupScope(categoryId);
  const scope = profile.groups?.[categoryId] || {};
  return {
    view: Boolean(scope.view) && hasPermission('xem_kho'),
    quantity: Boolean(scope.quantity) && hasPermission('xem_so_luong'),
    transact: Boolean(scope.transact) && hasPermission('nhap_xuat'),
    editProduct: Boolean(scope.editProduct) && (hasPermission('them_sp') || hasPermission('sua_xoa')),
    manageAttributes: Boolean(scope.manageAttributes) && hasPermission('thuoc_tinh')
  };
}

function canViewCategory(categoryId) { return getEffectiveGroupScope(categoryId).view; }
function canViewQuantity(categoryId) { return getEffectiveGroupScope(categoryId).quantity; }
function canTransactCategory(categoryId) { return getEffectiveGroupScope(categoryId).transact; }
function canEditProductCategory(categoryId, mode = 'edit') {
  const scope = getEffectiveGroupScope(categoryId);
  return scope.editProduct && hasPermission(mode === 'add' ? 'them_sp' : 'sua_xoa');
}
function canManageCategoryAttributes(categoryId) { return getEffectiveGroupScope(categoryId).manageAttributes; }

function getAttributeOverride(categoryId, attributeId, profile = state.accessProfile) {
  return profile?.attributes?.[categoryId]?.[attributeId] || null;
}

function canViewAttribute(categoryId, attributeId) {
  if (state.permissions.includes('superadmin')) return true;
  if (isGuestUser()) return canViewCategory(categoryId) && Boolean(state.guestPolicy.showSpec);
  const override = getAttributeOverride(categoryId, attributeId);
  if (override && typeof override.view === 'boolean') return override.view && canViewCategory(categoryId);
  return canViewCategory(categoryId);
}

function canEditAttributeValue(categoryId, attributeId) {
  if (state.permissions.includes('superadmin')) return true;
  const override = getAttributeOverride(categoryId, attributeId);
  if (override && typeof override.editValue === 'boolean') return override.editValue && canEditProductCategory(categoryId, 'edit');
  return canEditProductCategory(categoryId, 'edit');
}

function canManageAttributeOptions(categoryId, attributeId) {
  if (state.permissions.includes('superadmin')) return true;
  const override = getAttributeOverride(categoryId, attributeId);
  if (override && typeof override.manageOptions === 'boolean') return override.manageOptions && canManageCategoryAttributes(categoryId) && hasPermission('quan_ly_gia_tri');
  return canManageCategoryAttributes(categoryId) && hasPermission('quan_ly_gia_tri');
}

function canEditAttributeDefinition(categoryId, attributeId) {
  if (state.permissions.includes('superadmin')) return true;
  const override = getAttributeOverride(categoryId, attributeId);
  if (override && typeof override.editDefinition === 'boolean') return override.editDefinition && canManageCategoryAttributes(categoryId);
  return canManageCategoryAttributes(categoryId);
}

function canDeleteAttribute(categoryId, attributeId) {
  if (state.permissions.includes('superadmin')) return true;
  const override = getAttributeOverride(categoryId, attributeId);
  return Boolean(override?.delete) && canManageCategoryAttributes(categoryId);
}

function visibleCategories() {
  return state.schema.categories.filter(category => canViewCategory(category.id));
}

function manageableCategories() {
  return state.schema.categories.filter(category => canManageCategoryAttributes(category.id));
}


function attrKey(attributeId) {
  return `__attr:${attributeId}`;
}

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9.,-]+/g, ' ')
    .trim();
}

function normalizeSearchText(value) {
  return String(value ?? '')
    .replace(/[Øø]/g, ' phi ')
    .replace(/[×*]/g, ' x ')
    .replace(/(\d),(\d)/g, '$1.$2')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/([a-z])([0-9])/g, '$1 $2')
    .replace(/([0-9])([a-z])/g, '$1 $2')
    .replace(/[^a-z0-9.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function canonicalSearchTokens(value) {
  return normalizeSearchText(value)
    .split(' ')
    .map(token => {
      if (/^-?\d+(?:\.\d+)?$/.test(token)) {
        const number = Number(token);
        return Number.isFinite(number) ? String(number) : token;
      }
      return token;
    })
    .filter(Boolean);
}

function tokenMatchesSearch(indexToken, queryToken) {
  if (indexToken === queryToken) return true;
  const queryIsNumber = /^-?\d+(?:\.\d+)?$/.test(queryToken);
  const indexIsNumber = /^-?\d+(?:\.\d+)?$/.test(indexToken);
  if (queryIsNumber && indexIsNumber) return indexToken.startsWith(queryToken);
  return indexToken.includes(queryToken);
}

function normalizeIdentityValue(value, type) {
  if (type === 'number') {
    const number = parseFlexibleNumber(value);
    return Number.isFinite(number) ? String(number) : '';
  }
  return normalizeText(value).replace(/\s+/g, '-');
}

function parseFlexibleNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  const cleaned = String(value ?? '').trim().replace(/\s/g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
  if (!cleaned) return NaN;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function formatNumber(value, maximumFractionDigits = 2) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '0';
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits }).format(number);
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Không rõ thời gian';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date);
}

function makeNumericId() {
  return Date.now() * 1000 + Math.floor(Math.random() * 1000);
}

function makeSlug(value, prefix = 'item') {
  const base = normalizeText(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${prefix}-${base || Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function setBusy(button, busy, text = 'Đang xử lý…') {
  if (!button) return;
  if (busy) {
    button.dataset.label = button.textContent;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.textContent = text;
  } else {
    button.disabled = false;
    button.removeAttribute('aria-busy');
    if (button.dataset.label) {
      button.textContent = button.dataset.label;
      delete button.dataset.label;
    }
  }
}

async function runLocked(name, button, task, busyText) {
  if (state.locks.has(name)) return false;
  state.locks.add(name);
  setBusy(button, true, busyText);
  try {
    return await task();
  } finally {
    state.locks.delete(name);
    setBusy(button, false);
  }
}

function showToast(message, type = 'success', duration = 3200) {
  const region = byId('toast-region');
  const toast = createElement('div', `toast ${type}`);
  const icon = createElement('span', 'toast-icon', type === 'success' ? '✓' : type === 'error' ? '!' : '•');
  const text = createElement('span', '', message);
  toast.append(icon, text);
  region.appendChild(toast);
  window.setTimeout(() => toast.remove(), duration);
}

function renderSkeleton(containerId, count = 5) {
  const container = byId(containerId);
  container.replaceChildren();
  for (let i = 0; i < count; i += 1) container.appendChild(createElement('div', 'skeleton-row'));
}

function showLoadingState(type, loading) {
  const loadingId = type === 'history' ? 'history-loading' : 'inventory-loading';
  const emptyId = type === 'history' ? 'history-empty' : 'inventory-empty';
  byId(loadingId).hidden = !loading;
  if (loading) byId(emptyId).hidden = true;
}

function updateOverlayLock() {
  document.body.classList.toggle('overlay-open', Boolean(document.querySelector('.overlay:not([hidden])')));
}

window.closeOverlay = function closeOverlay(id) {
  const overlay = byId(id);
  if (!overlay) return;
  overlay.hidden = true;
  updateOverlayLock();
};

window.closeOverlayFromBackdrop = function closeOverlayFromBackdrop(event, id) {
  if (event.target === byId(id)) window.closeOverlay(id);
};

function openOverlay(id) {
  const overlay = byId(id);
  if (!overlay) return;
  overlay.hidden = false;
  updateOverlayLock();
}

async function confirmAction({ title = 'Xác nhận', message, acceptText = 'Xác nhận', danger = true, icon = '!' }) {
  if (state.confirmResolver) state.confirmResolver(false);
  byId('confirm-title').textContent = title;
  byId('confirm-message').textContent = message;
  byId('confirm-icon').textContent = icon;
  const accept = byId('confirm-accept-button');
  accept.textContent = acceptText;
  accept.className = danger ? 'button button-danger' : 'button button-primary';
  openOverlay('confirm-dialog');

  return new Promise(resolve => {
    state.confirmResolver = resolve;
    const finish = result => {
      if (!state.confirmResolver) return;
      const resolver = state.confirmResolver;
      state.confirmResolver = null;
      window.closeOverlay('confirm-dialog');
      resolver(result);
    };
    byId('confirm-cancel-button').onclick = () => finish(false);
    accept.onclick = () => finish(true);
  });
}

function inferNamingStyle(category) {
  const id = normalizeText(category?.id);
  const name = normalizeText(category?.name);
  if (id === 'dao' || name === 'dao' || name.includes('dao be')) return 'knife';
  if (id === 'van-bang' || name.includes('van bang')) return 'flat-board';
  if (id === 'van-tron' || name.includes('van tron')) return 'round-board';
  return 'generic';
}

function inferAttributeNameRole(attribute, index, categoryStyle) {
  if (['title', 'meta', 'hidden'].includes(attribute?.nameRole)) return attribute.nameRole;
  const name = normalizeText(attribute?.name);
  if (/ghi chu|mo ta|note/.test(name)) return 'meta';
  if (categoryStyle === 'knife') {
    if (/loai dao|ten dao|chieu cao|do day|be day/.test(name)) return 'title';
    return attribute?.list ? 'meta' : 'hidden';
  }
  if (categoryStyle === 'flat-board') {
    if (/chieu dai|chieu rong|do day|be day/.test(name)) return 'title';
    return attribute?.list ? 'meta' : 'hidden';
  }
  if (categoryStyle === 'round-board') {
    if (/loai|may|dong may|duong kinh|chieu rong/.test(name)) return 'title';
    return attribute?.list ? 'meta' : 'hidden';
  }
  if (index === 0 || /(^| )ten( |$)|(^| )loai( |$)/.test(name)) return 'title';
  return attribute?.list ? 'meta' : 'hidden';
}

function inferAttributePrefix(attribute, categoryStyle) {
  if (attribute?.namePrefix !== undefined && attribute?.namePrefix !== null) return String(attribute.namePrefix);
  const name = normalizeText(attribute?.name);
  if (categoryStyle === 'knife' && /chieu cao|(^| )cao( |$)/.test(name)) return 'H';
  if ((categoryStyle === 'knife' || categoryStyle === 'round-board') && /do day|be day/.test(name)) return 'T';
  if (categoryStyle === 'round-board' && /duong kinh/.test(name)) return 'Ø';
  return '';
}

function normalizeAttributeDefinition(attribute, index, categoryStyle, fallbackAttribute = null) {
  const source = { ...(fallbackAttribute || {}), ...(attribute || {}) };
  return {
    ...source,
    id: source.id || makeSlug(source.name || 'thuoc-tinh', 'attr'),
    name: String(source.name || `Thuộc tính ${index + 1}`).trim(),
    type: ['select', 'number', 'text'].includes(source.type) ? source.type : 'text',
    options: Array.isArray(source.options) ? source.options.map(String) : [],
    unit: String(source.unit || '').trim(),
    required: Boolean(source.required),
    identity: source.identity !== false,
    list: source.list !== false,
    filter: source.filter !== false,
    nameRole: inferAttributeNameRole(source, index, categoryStyle),
    namePrefix: inferAttributePrefix(source, categoryStyle),
    optionAliases: source.optionAliases && typeof source.optionAliases === 'object' && !Array.isArray(source.optionAliases)
      ? { ...source.optionAliases }
      : {}
  };
}

function normalizeSchema(schema) {
  const incoming = schema && Array.isArray(schema.categories) ? schema : structuredCloneSafe(DEFAULT_SCHEMA);
  const defaultsByCategory = new Map(DEFAULT_SCHEMA.categories.map(category => [category.id, category]));
  const categories = incoming.categories.map((category, categoryIndex) => {
    const fallback = defaultsByCategory.get(category.id) || {};
    const merged = { ...fallback, ...category };
    const style = merged.naming?.style || fallback.naming?.style || inferNamingStyle(merged);
    const defaultAttributes = new Map((fallback.attributes || []).map(attribute => [attribute.id, attribute]));
    const attributes = Array.isArray(category.attributes)
      ? category.attributes.map((attribute, index) => normalizeAttributeDefinition(attribute, index, style, defaultAttributes.get(attribute.id)))
      : (fallback.attributes || []).map((attribute, index) => normalizeAttributeDefinition(attribute, index, style, attribute));
    const units = Array.isArray(merged.units) ? merged.units.map(String).map(item => item.trim()).filter(Boolean) : [];
    return {
      ...merged,
      id: merged.id || makeSlug(merged.name || `nhom-${categoryIndex + 1}`, 'category'),
      name: String(merged.name || `Nhóm ${categoryIndex + 1}`).trim(),
      icon: merged.icon || '◇',
      units: units.length ? units : ['đơn vị'],
      defaultUnit: units.includes(merged.defaultUnit) ? merged.defaultUnit : (units[0] || 'đơn vị'),
      warningDefault: Number.isFinite(parseFlexibleNumber(merged.warningDefault)) ? Math.max(0, parseFlexibleNumber(merged.warningDefault)) : 0,
      naming: {
        style,
        applyExisting: merged.naming?.applyExisting || fallback.naming?.applyExisting || 'on-edit'
      },
      attributes
    };
  });
  return { ...incoming, version: 3, categories };
}

function getCategory(categoryId) {
  return state.schema.categories.find(category => category.id === categoryId) || state.schema.categories[0];
}

function inferCategory(product) {
  const attributes = product.attributes || {};
  const direct = attributes.__category || attributes['Nhóm vật liệu'] || attributes['Nhóm'];
  if (direct) {
    const directNormalized = normalizeText(direct);
    const matched = state.schema.categories.find(category => category.id === direct || normalizeText(category.name) === directNormalized);
    if (matched) return matched;
  }

  const name = normalizeText(product.name);
  if (name.includes('van bang')) return getCategory('van-bang');
  if (name.includes('van tron')) return getCategory('van-tron');
  if (name.includes('dao')) return getCategory('dao');
  return getCategory('phu-lieu');
}

function getProductCategory(product) {
  return getCategory(product.attributes?.__category) || inferCategory(product);
}

function getProductUnit(product) {
  const category = inferCategory(product);
  return product.attributes?.__unit || product.attributes?.['Đơn vị'] || category?.defaultUnit || 'đơn vị';
}

function getProductWarning(product) {
  const category = inferCategory(product);
  const value = parseFlexibleNumber(product.attributes?.__warning);
  return Number.isFinite(value) ? value : Number(category?.warningDefault || 0);
}

function getProductStatus(product) {
  const parsedQuantity = parseFlexibleNumber(product?.quantity);
  const quantity = Number.isFinite(parsedQuantity) ? parsedQuantity : 0;
  const warning = Math.max(0, getProductWarning(product));

  if (quantity <= 0) {
    return { key: 'out', label: 'Hết hàng' };
  }

  if (warning > 0 && quantity <= warning) {
    return { key: 'low', label: 'Sắp hết' };
  }

  return { key: 'ok', label: 'Còn hàng' };
}

function getAttributeValue(product, attribute) {
  const attributes = product.attributes || {};
  if (attributes[attrKey(attribute.id)] !== undefined) return attributes[attrKey(attribute.id)];
  if (attributes[attribute.name] !== undefined) return attributes[attribute.name];
  return '';
}

function getOptionAlias(attribute, value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  const aliases = attribute?.optionAliases || {};
  if (Object.prototype.hasOwnProperty.call(aliases, raw) && String(aliases[raw]).trim()) return String(aliases[raw]).trim();
  const normalized = normalizeText(raw);
  const matchingKey = Object.keys(aliases).find(key => normalizeText(key) === normalized);
  return matchingKey && String(aliases[matchingKey]).trim() ? String(aliases[matchingKey]).trim() : raw;
}

function formatAttributeValue(attribute, value, options = {}) {
  if (value === '' || value === null || value === undefined) return '';
  const { compact = false, includeUnit = true, includePrefix = false } = options;
  let display;
  if (attribute.type === 'number') {
    const parsed = parseFlexibleNumber(value);
    if (!Number.isFinite(parsed)) return '';
    display = formatNumber(parsed);
  } else {
    display = compact ? getOptionAlias(attribute, value) : String(value).trim();
  }
  const prefix = includePrefix ? String(attribute.namePrefix || '') : '';
  const unit = includeUnit && attribute.unit ? ` ${attribute.unit}` : '';
  return `${prefix}${display}${unit}`.trim();
}

function hasValue(value) {
  return value !== '' && value !== null && value !== undefined && String(value).trim() !== '';
}

function semanticAttribute(category, patterns, allowedRoles = null) {
  return category.attributes.find(attribute => {
    if (allowedRoles && !allowedRoles.includes(attribute.nameRole)) return false;
    const name = normalizeText(attribute.name);
    return patterns.some(pattern => pattern.test(name));
  }) || null;
}

function getPresentationValue(values, attribute, options = {}) {
  if (!attribute || !hasValue(values[attribute.id])) return '';
  return formatAttributeValue(attribute, values[attribute.id], options);
}

function ensureCategoryPrefix(category, value) {
  const clean = String(value || '').trim();
  if (!clean) return category.name;
  const categoryName = normalizeText(category.name);
  const normalizedValue = normalizeText(clean);
  if (normalizedValue.includes(categoryName)) return clean;
  if (categoryName === 'dao') return `Dao ${clean}`.trim();
  return clean;
}

function appendTitleExtras(title, category, values, consumed) {
  const extras = category.attributes
    .filter(attribute => attribute.nameRole === 'title' && !consumed.has(attribute.id) && hasValue(values[attribute.id]))
    .map(attribute => formatAttributeValue(attribute, values[attribute.id], {
      compact: true,
      includeUnit: true,
      includePrefix: Boolean(attribute.namePrefix)
    }))
    .filter(Boolean);
  return extras.length ? `${title} – ${extras.join(' · ')}` : title;
}

function buildKnifePresentation(category, values) {
  const consumed = new Set();
  const primary = semanticAttribute(category, [/loai dao/, /ten dao/, /cong dung/, /(^| )loai( |$)/, /(^| )ten( |$)/], ['title']);
  const height = semanticAttribute(category, [/chieu cao/, /(^| )cao( |$)/], ['title']);
  const thickness = semanticAttribute(category, [/do day/, /be day/], ['title']);
  [primary, height, thickness].filter(Boolean).forEach(attribute => consumed.add(attribute.id));

  let title = ensureCategoryPrefix(category, getPresentationValue(values, primary, { compact: true, includeUnit: false }));
  const dimensions = [];
  const heightValue = getPresentationValue(values, height, { compact: true, includeUnit: false, includePrefix: true });
  const thicknessValue = getPresentationValue(values, thickness, { compact: true, includeUnit: false, includePrefix: true });
  if (heightValue) dimensions.push(heightValue);
  if (thicknessValue) dimensions.push(thicknessValue);
  if (dimensions.length) title = `${title} ${dimensions.join(' × ')}`;
  title = appendTitleExtras(title, category, values, consumed);
  return { title: title.trim(), consumed };
}

function buildFlatBoardPresentation(category, values) {
  const consumed = new Set();
  const length = semanticAttribute(category, [/chieu dai/, /(^| )dai( |$)/], ['title']);
  const width = semanticAttribute(category, [/chieu rong/, /(^| )rong( |$)/], ['title']);
  const thickness = semanticAttribute(category, [/do day/, /be day/], ['title']);
  [length, width, thickness].filter(Boolean).forEach(attribute => consumed.add(attribute.id));

  const dimensions = [length, width, thickness]
    .map(attribute => getPresentationValue(values, attribute, { compact: true, includeUnit: false }))
    .filter(Boolean);
  const commonUnit = [length, width, thickness].find(attribute => attribute?.unit && hasValue(values[attribute.id]))?.unit || '';
  let title = category.name;
  if (dimensions.length) title += ` ${dimensions.join(' × ')}${commonUnit ? ` ${commonUnit}` : ''}`;
  title = appendTitleExtras(title, category, values, consumed);
  return { title: title.trim(), consumed };
}

function buildRoundBoardPresentation(category, values) {
  const consumed = new Set();
  const machine = semanticAttribute(category, [/loai hoac may/, /dong may/, /(^| )may( |$)/, /(^| )loai( |$)/], ['title']);
  const diameter = semanticAttribute(category, [/duong kinh/], ['title']);
  const width = semanticAttribute(category, [/chieu rong/, /(^| )rong( |$)/], ['title']);
  [machine, diameter, width].filter(Boolean).forEach(attribute => consumed.add(attribute.id));

  const machineValue = getPresentationValue(values, machine, { compact: true, includeUnit: false });
  let title = category.name;
  if (machineValue && !normalizeText(machineValue).includes(normalizeText(category.name))) title += ` ${machineValue}`;
  const dimensions = [];
  const diameterValue = getPresentationValue(values, diameter, { compact: true, includeUnit: false, includePrefix: true });
  const widthValue = getPresentationValue(values, width, { compact: true, includeUnit: false });
  if (diameterValue) dimensions.push(diameterValue);
  if (widthValue) dimensions.push(widthValue);
  const commonUnit = [diameter, width].find(attribute => attribute?.unit && hasValue(values[attribute.id]))?.unit || '';
  if (dimensions.length) title += ` – ${dimensions.join(' × ')}${commonUnit ? ` ${commonUnit}` : ''}`;
  title = appendTitleExtras(title, category, values, consumed);
  return { title: title.trim(), consumed };
}

function buildGenericPresentation(category, values) {
  const consumed = new Set();
  const titleAttributes = category.attributes.filter(attribute => attribute.nameRole === 'title' && hasValue(values[attribute.id]));
  if (!titleAttributes.length) return { title: category.name, consumed };
  const [first, ...rest] = titleAttributes;
  consumed.add(first.id);
  let title = getPresentationValue(values, first, { compact: true, includeUnit: true, includePrefix: Boolean(first.namePrefix) });
  const firstName = normalizeText(first.name);
  if (!/(^| )ten( |$)|(^| )loai( |$)/.test(firstName) && !normalizeText(title).includes(normalizeText(category.name))) {
    title = `${category.name} ${title}`;
  }
  if (rest.length) {
    const extraValues = rest.map(attribute => {
      consumed.add(attribute.id);
      return getPresentationValue(values, attribute, { compact: true, includeUnit: true, includePrefix: Boolean(attribute.namePrefix) });
    }).filter(Boolean);
    if (extraValues.length) title += ` – ${extraValues.join(' · ')}`;
  }
  return { title: title.trim(), consumed };
}

function buildProductPresentation(category, values) {
  const style = category.naming?.style || inferNamingStyle(category);
  let presentation;
  if (style === 'knife') presentation = buildKnifePresentation(category, values);
  else if (style === 'flat-board') presentation = buildFlatBoardPresentation(category, values);
  else if (style === 'round-board') presentation = buildRoundBoardPresentation(category, values);
  else presentation = buildGenericPresentation(category, values);

  const meta = category.attributes
    .filter(attribute => attribute.nameRole === 'meta' && attribute.list && hasValue(values[attribute.id]))
    .map(attribute => formatAttributeValue(attribute, values[attribute.id], {
      compact: true,
      includeUnit: true,
      includePrefix: Boolean(attribute.namePrefix)
    }))
    .filter(Boolean)
    .filter((value, index, array) => array.findIndex(item => normalizeText(item) === normalizeText(value)) === index)
    .join(' · ');

  return {
    title: presentation.title || category.name,
    meta,
    consumedAttributeIds: presentation.consumed
  };
}

function buildProductName(category, values) {
  return buildProductPresentation(category, values).title;
}

function buildProductMeta(product, category = inferCategory(product)) {
  const values = {};
  category.attributes.forEach(attribute => {
    values[attribute.id] = getAttributeValue(product, attribute);
  });
  return buildProductPresentation(category, values).meta;
}

function getProductDisplayPresentation(product, category = inferCategory(product)) {
  const values = {};
  let recognizedValueCount = 0;
  category.attributes.forEach(attribute => {
    values[attribute.id] = getAttributeValue(product, attribute);
    if (hasValue(values[attribute.id])) recognizedValueCount += 1;
  });

  const automatic = buildProductPresentation(category, values);
  const attributes = product.attributes || {};
  const customName = String(attributes.__customName || '').trim();
  const storedName = String(product.name || '').trim();
  const nameMode = attributes.__nameMode;

  let title = storedName || category.name;
  if (nameMode === 'custom' && customName) title = customName;
  else if (recognizedValueCount > 0 && (nameMode === 'auto' || !storedName)) {
    title = automatic.title || storedName || category.name;
  }

  return {
    title,
    meta: automatic.meta || '',
    automaticTitle: automatic.title || category.name,
    recognizedValueCount
  };
}

function buildProductSearchTokens(product, category = inferCategory(product)) {
  const presentation = getProductDisplayPresentation(product, category);
  const sources = [
    product.name,
    presentation.title,
    presentation.meta,
    category.name,
    category.id,
    getProductUnit(product),
    getProductStatus(product).label
  ];

  category.attributes.forEach(attribute => {
    const value = getAttributeValue(product, attribute);
    if (!hasValue(value)) return;
    sources.push(
      attribute.name,
      attribute.namePrefix,
      attribute.unit,
      value,
      formatAttributeValue(attribute, value, { compact: true, includeUnit: true, includePrefix: true })
    );
  });

  getLegacyAttributes(product, category).forEach(([key, value]) => sources.push(key, value));
  return new Set(canonicalSearchTokens(sources.join(' ')));
}

function productMatchesSearch(product, queryTokens) {
  if (!queryTokens.length) return true;
  const indexTokens = [...buildProductSearchTokens(product)];
  return queryTokens.every(queryToken => indexTokens.some(indexToken => tokenMatchesSearch(indexToken, queryToken)));
}

function buildSignature(category, values) {
  const parts = category.attributes
    .filter(attribute => attribute.identity)
    .slice()
    .sort((a, b) => String(a.id).localeCompare(String(b.id)))
    .map(attribute => `${attribute.id}:${normalizeIdentityValue(values[attribute.id], attribute.type)}`);
  return `${category.id}|${parts.join('|')}`;
}

function computeProductSignature(product) {
  const category = inferCategory(product);
  const values = {};
  let recognizedValueCount = 0;
  category.attributes.forEach(attribute => {
    values[attribute.id] = getAttributeValue(product, attribute);
    if (hasValue(values[attribute.id])) recognizedValueCount += 1;
  });
  if (recognizedValueCount > 0) return buildSignature(category, values);
  if (product.attributes?.__signature) return product.attributes.__signature;
  return `${category.id}|legacy:${normalizeText(product.name)}`;
}

function getLegacyAttributes(product, category) {
  const managedKeys = new Set(category.attributes.flatMap(attribute => [attrKey(attribute.id), attribute.name]));
  return Object.entries(product.attributes || {}).filter(([key, value]) => {
    return !RESERVED_ATTRIBUTE_KEYS.has(key) && !managedKeys.has(key) && value !== '' && value !== null && value !== undefined;
  });
}

async function initSupabase() {
  if (!window.supabase) throw new Error('Không tải được thư viện Supabase.');
  state.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  state.dbReady = true;
}

function assertDb() {
  if (!state.dbReady || !state.client) throw new Error('Chưa kết nối được cơ sở dữ liệu.');
}

async function dbFetchProducts() {
  assertDb();
  const { data, error } = await state.client.from('products').select('*');
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

async function dbUpsertProducts(products) {
  assertDb();
  const { data, error } = await state.client.from('products').upsert(products).select('*');
  if (error) throw error;
  return data || [];
}

async function dbDeleteProduct(id) {
  assertDb();
  const { error } = await state.client.from('products').delete().eq('id', id);
  if (error) throw error;
}

async function dbUpdateQuantity(product, newQuantity) {
  assertDb();
  const oldQuantity = Number(product.quantity || 0);
  const query = state.client
    .from('products')
    .update({ quantity: newQuantity })
    .eq('id', product.id)
    .eq('quantity', oldQuantity)
    .select('*');
  const { data, error } = await query;
  if (error) throw error;
  if (!data || data.length !== 1) {
    const conflict = new Error('Dữ liệu tồn kho đã được thay đổi trên thiết bị khác.');
    conflict.code = 'INVENTORY_CONFLICT';
    throw conflict;
  }
  return data[0];
}

async function dbAddLog(productName, action, amount, newTotal) {
  assertDb();
  const log = {
    id: makeNumericId(),
    timestamp: new Date().toISOString(),
    product_name: productName,
    action,
    amount,
    new_total: newTotal
  };
  const { error } = await state.client.from('logs').insert([log]);
  if (error) throw error;
  return log;
}

async function dbFetchLogs(monthValue = '') {
  assertDb();
  let query = state.client.from('logs').select('*').order('timestamp', { ascending: false });
  if (monthValue) {
    const [year, month] = monthValue.split('-').map(Number);
    const start = new Date(year, month - 1, 1, 0, 0, 0);
    const end = new Date(year, month, 1, 0, 0, 0);
    query = query.gte('timestamp', start.toISOString()).lt('timestamp', end.toISOString());
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(row => ({
    id: row.id,
    timestamp: row.timestamp,
    productName: row.product_name,
    action: row.action,
    amount: Number(row.amount || 0),
    newTotal: Number(row.new_total || 0)
  }));
}

async function dbFetchSchema() {
  assertDb();
  const { data, error } = await state.client.from('custom_columns').select('*');
  if (error) throw error;
  const rows = Array.isArray(data) ? data : [];
  const schemaRow = rows.find(row => row.name === APP_SCHEMA_ROW);
  if (schemaRow?.options?.length) {
    try {
      const parsed = JSON.parse(schemaRow.options[0]);
      if (parsed?.version === 3 && Array.isArray(parsed.categories)) return normalizeSchema(parsed);
    } catch (error) {
      console.warn('Không đọc được cấu hình ứng dụng:', error);
    }
  }

  const schema = structuredCloneSafe(DEFAULT_SCHEMA);
  const legacyRows = rows.filter(row => row.name && ![APP_SCHEMA_ROW, ACCESS_POLICY_ROW].includes(row.name));
  const accessory = schema.categories.find(category => category.id === 'phu-lieu');
  legacyRows.forEach(row => {
    if (accessory.attributes.some(attribute => normalizeText(attribute.name) === normalizeText(row.name))) return;
    accessory.attributes.push({
      id: makeSlug(row.name, 'legacy'),
      name: row.name,
      type: 'select',
      options: Array.isArray(row.options) ? row.options.map(String) : [],
      unit: '',
      required: false,
      identity: false,
      list: true,
      filter: true,
      nameRole: 'meta',
      namePrefix: '',
      optionAliases: {}
    });
  });
  return normalizeSchema(schema);
}

async function dbSaveSchema(schema) {
  assertDb();
  const normalized = normalizeSchema(schema);
  const row = { name: APP_SCHEMA_ROW, options: [JSON.stringify(normalized)] };
  const { error } = await state.client.from('custom_columns').upsert([row], { onConflict: 'name' });
  if (error) throw error;
}


async function dbFetchAccessPolicy() {
  assertDb();
  const { data, error } = await state.client.from('custom_columns').select('name,options').eq('name', ACCESS_POLICY_ROW).maybeSingle();
  if (error) throw error;
  if (!data?.options?.[0]) return normalizeGuestPolicy(DEFAULT_GUEST_POLICY);
  try { return normalizeGuestPolicy(JSON.parse(data.options[0])); }
  catch { return normalizeGuestPolicy(DEFAULT_GUEST_POLICY); }
}

async function dbSaveAccessPolicy(policy) {
  assertDb();
  const normalized = normalizeGuestPolicy(policy);
  const row = { name: ACCESS_POLICY_ROW, options: [JSON.stringify(normalized)] };
  const { error } = await state.client.from('custom_columns').upsert([row], { onConflict: 'name' });
  if (error) throw error;
  return normalized;
}

async function dbFetchUsers() {
  assertDb();
  const { data, error } = await state.client.from('users').select('username,password,role');
  if (error) throw error;
  return data || [];
}

async function dbFetchUser(username) {
  assertDb();
  const { data, error } = await state.client.from('users').select('username,password,role').eq('username', username).maybeSingle();
  if (error) throw error;
  return data;
}

async function dbCreateUser(user) {
  assertDb();
  const { error } = await state.client.from('users').insert([user]);
  if (error) throw error;
}

async function dbUpdateUser(username, changes) {
  assertDb();
  const { error } = await state.client.from('users').update(changes).eq('username', username);
  if (error) throw error;
}

async function dbDeleteUser(username) {
  assertDb();
  const { error } = await state.client.from('users').delete().eq('username', username);
  if (error) throw error;
}

function applyThemeFromStorage() {
  const theme = localStorage.getItem(THEME_KEY) || 'system';
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
  else document.documentElement.removeAttribute('data-theme');
  updateThemeUi(theme);
}

function updateThemeUi(theme) {
  const descriptions = { system: 'Theo thiết bị', light: 'Sáng', dark: 'Tối' };
  const description = byId('theme-setting-description');
  if (description) description.textContent = descriptions[theme] || descriptions.system;
  all('[data-theme-choice]').forEach(button => button.classList.toggle('active', button.dataset.themeChoice === theme));
}

window.setTheme = function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  applyThemeFromStorage();
  window.closeOverlay('appearance-sheet');
};

window.toggleTheme = function toggleTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'system';
  const isSystemDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const currentDark = saved === 'dark' || (saved === 'system' && isSystemDark);
  window.setTheme(currentDark ? 'light' : 'dark');
};

window.openAppearanceSheet = function openAppearanceSheet() {
  updateThemeUi(localStorage.getItem(THEME_KEY) || 'system');
  openOverlay('appearance-sheet');
};

function setOnlineStatus() {
  byId('offline-banner').hidden = navigator.onLine;
}

function updateCurrentUserUi() {
  const loggedIn = !isGuestUser();
  byId('profile-initial').textContent = (state.currentUser || 'K').trim().charAt(0).toUpperCase() || 'K';
  byId('settings-login-row').hidden = loggedIn;
  byId('settings-logout-row').hidden = !loggedIn;
  byId('current-user-label').textContent = loggedIn ? state.currentUser : 'Tài khoản hiện tại';
  applyPermissionUi();
}

function applyPermissionUi() {
  all('.permission-check').forEach(element => {
    const permission = element.dataset.permission;
    element.hidden = !hasPermission(permission);
  });

  const inventoryNav = document.querySelector('[data-screen-target="inventory"]');
  const historyNav = document.querySelector('[data-screen-target="history"]');
  const settingsNav = document.querySelector('[data-screen-target="settings"]');
  const canInventory = isGuestUser() ? state.guestPolicy.enabled && state.guestPolicy.visibleScreens.inventory : hasPermission('xem_kho') || state.permissions.includes('superadmin');
  const canHistory = isGuestUser() ? state.guestPolicy.enabled && state.guestPolicy.visibleScreens.history : hasPermission('bao_cao');
  const canSettings = isGuestUser() ? state.guestPolicy.enabled && state.guestPolicy.visibleScreens.settings : true;
  if (inventoryNav) inventoryNav.hidden = !canInventory;
  if (historyNav) historyNav.hidden = !canHistory;
  if (settingsNav) settingsNav.hidden = !canSettings;

  const searchRow = byId('search-input')?.closest('.search-row');
  if (searchRow && isGuestUser()) searchRow.hidden = !state.guestPolicy.allowSearch;
  const categoryTabs = byId('category-tabs');
  if (categoryTabs && isGuestUser()) categoryTabs.hidden = !state.guestPolicy.allowFilter;
  const stockTabs = byId('stock-filter-tabs');
  if (stockTabs && isGuestUser()) stockTabs.hidden = !state.guestPolicy.allowFilter;

  const floating = byId('floating-add-button');
  if (floating) floating.hidden = state.currentScreen !== 'inventory' || !visibleCategories().some(category => canEditProductCategory(category.id, 'add'));

  const activeScreenAllowed = state.currentScreen === 'inventory' ? canInventory : state.currentScreen === 'history' ? canHistory : canSettings;
  if (!activeScreenAllowed) {
    const fallback = canInventory ? 'inventory' : canHistory ? 'history' : canSettings ? 'settings' : null;
    if (fallback && fallback !== state.currentScreen) switchScreen(fallback);
  }
}

async function restoreSession() {
  state.guestPolicy = await dbFetchAccessPolicy();
  const raw = localStorage.getItem(SESSION_KEY);
  if (raw) {
    try {
      const session = JSON.parse(raw);
      const latest = await dbFetchUser(session.username);
      if (latest) {
        state.currentUser = latest.username;
        state.accessProfile = parseAccessProfile(latest.role, latest.username);
        state.permissions = state.accessProfile.permissions;
        localStorage.setItem(SESSION_KEY, JSON.stringify({ username: latest.username, role: latest.role }));
        updateCurrentUserUi();
        return;
      }
      localStorage.removeItem(SESSION_KEY);
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  state.currentUser = 'Khách';
  state.accessProfile = { version: ACCESS_PROFILE_VERSION, mode: 'access-profile', baseRole: 'viewer', permissions: state.guestPolicy.enabled ? ['xem_kho', 'xem_chi_tiet'] : [], groups: {}, attributes: {} };
  if (state.guestPolicy.showQuantity) state.accessProfile.permissions.push('xem_so_luong');
  if (state.guestPolicy.visibleScreens.history || state.guestPolicy.allowExport) state.accessProfile.permissions.push('bao_cao');
  state.permissions = state.accessProfile.permissions;
  updateCurrentUserUi();
}

window.showLoginScreen = function showLoginScreen() {
  openOverlay('login-screen');
  window.setTimeout(() => byId('login-username').focus(), 50);
};

window.hideLoginScreen = function hideLoginScreen() {
  byId('login-password').value = '';
  window.closeOverlay('login-screen');
};

window.handleLogin = async function handleLogin() {
  const username = byId('login-username').value.trim();
  const password = byId('login-password').value;
  if (!username || !password) {
    showToast('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.', 'warning');
    return;
  }

  await runLocked('login', byId('login-submit'), async () => {
    try {
      const user = await dbFetchUser(username);
      if (!user || user.password !== password) {
        showToast('Tên đăng nhập hoặc mật khẩu không đúng.', 'error');
        return;
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify({ username: user.username, role: user.role }));
      state.currentUser = user.username;
      state.accessProfile = parseAccessProfile(user.role, user.username);
      state.permissions = state.accessProfile.permissions;
      updateCurrentUserUi();
      window.hideLoginScreen();
      await window.refreshProducts();
      renderCategoryTabs();
      showToast(`Đã đăng nhập: ${user.username}`);
    } catch (error) {
      showToast(`Không thể đăng nhập: ${error.message}`, 'error');
    }
  }, 'Đang đăng nhập…');
};

window.handleLogout = function handleLogout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.reload();
};

window.openAccountSheet = function openAccountSheet() {
  byId('account-title').textContent = state.currentUser;
  const actions = byId('account-actions');
  actions.replaceChildren();
  if (state.currentUser === 'Khách') {
    const login = createElement('button');
    login.type = 'button';
    login.innerHTML = '<span>Đăng nhập</span><span>›</span>';
    login.onclick = () => {
      window.closeOverlay('account-sheet');
      window.showLoginScreen();
    };
    actions.appendChild(login);
  } else {
    const settings = createElement('button');
    settings.type = 'button';
    settings.innerHTML = '<span>Mở cài đặt</span><span>›</span>';
    settings.onclick = () => {
      window.closeOverlay('account-sheet');
      switchScreen('settings');
    };
    const logout = createElement('button');
    logout.type = 'button';
    logout.innerHTML = '<span>Đăng xuất</span><span>↪</span>';
    logout.style.color = 'var(--danger)';
    logout.onclick = window.handleLogout;
    actions.append(settings, logout);
  }
  openOverlay('account-sheet');
};

function bindStaticEvents() {
  all('[data-screen-target]').forEach(button => {
    button.addEventListener('click', () => switchScreen(button.dataset.screenTarget));
  });

  byId('search-input').addEventListener('input', event => {
    byId('clear-search-button').hidden = !event.target.value;
    window.clearTimeout(state.searchTimer);
    state.searchTimer = window.setTimeout(renderProducts, 90);
  });

  all('[data-view-mode]').forEach(button => {
    button.addEventListener('click', () => window.setInventoryViewMode(button.dataset.viewMode));
  });

  byId('filter-category-select').addEventListener('change', event => {
    state.draftFilterCategoryId = event.target.value;
    state.draftAdvancedFilters = {};
    renderAdvancedFilterFields(state.draftFilterCategoryId);
  });

  all('[data-stock-filter]').forEach(button => {
    button.addEventListener('click', () => {
      state.stockFilter = button.dataset.stockFilter;
      all('[data-stock-filter]').forEach(item => item.classList.toggle('active', item === button));
      renderProducts();
    });
  });

  byId('history-month-filter').addEventListener('change', () => loadHistory(true));
  byId('history-search-input').addEventListener('input', event => {
    state.historySearch = event.target.value;
    renderHistory();
  });

  all('[data-history-type]').forEach(button => {
    button.addEventListener('click', () => {
      state.historyType = button.dataset.historyType;
      all('[data-history-type]').forEach(item => item.classList.toggle('active', item === button));
      renderHistory();
    });
  });

  byId('product-category-select').addEventListener('change', () => {
    renderProductEditorFields();
    updateProductNamePreview();
  });
  byId('product-dynamic-fields').addEventListener('input', updateProductNamePreview);
  byId('product-dynamic-fields').addEventListener('change', updateProductNamePreview);
  byId('transaction-amount-input').addEventListener('input', updateTransactionPreview);
  byId('attribute-type-select').addEventListener('change', toggleAttributeOptionsField);

  byId('studio-category-name').addEventListener('input', syncStudioCategoryInputs);
  byId('studio-category-units').addEventListener('input', syncStudioCategoryInputs);
  byId('studio-category-warning').addEventListener('input', syncStudioCategoryInputs);
  bindPermissionManagerEvents();

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const openOverlays = all('.overlay:not([hidden])');
    const latest = openOverlays.at(-1);
    if (latest) window.closeOverlay(latest.id);
  });

  window.addEventListener('online', setOnlineStatus);
  window.addEventListener('offline', setOnlineStatus);
}

function switchScreen(screen) {
  const allowed = screen === 'inventory'
    ? (isGuestUser() ? state.guestPolicy.enabled && state.guestPolicy.visibleScreens.inventory : hasPermission('xem_kho') || state.permissions.includes('superadmin'))
    : screen === 'history'
      ? (isGuestUser() ? state.guestPolicy.enabled && state.guestPolicy.visibleScreens.history : hasPermission('bao_cao'))
      : (isGuestUser() ? state.guestPolicy.enabled && state.guestPolicy.visibleScreens.settings : true);
  if (!allowed) {
    showToast('Bạn không có quyền mở hạng mục này.', 'warning');
    return;
  }
  state.currentScreen = screen;
  all('.app-screen').forEach(section => {
    const active = section.dataset.screen === screen;
    section.hidden = !active;
    section.classList.toggle('active', active);
  });
  all('[data-screen-target]').forEach(button => button.classList.toggle('active', button.dataset.screenTarget === screen));
  const headings = { inventory: ['Kho vật liệu', 'Tồn kho'], history: ['Theo dõi biến động', 'Lịch sử'], settings: ['Thiết lập hệ thống', 'Cài đặt'] };
  byId('screen-eyebrow').textContent = headings[screen][0];
  byId('screen-title').textContent = headings[screen][1];
  applyPermissionUi();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (screen === 'history' && !state.logs.length) loadHistory();
}

function renderCategoryTabs() {
  const container = byId('category-tabs');
  container.replaceChildren();
  const allowed = visibleCategories();
  if (state.categoryFilter !== 'all' && !allowed.some(category => category.id === state.categoryFilter)) state.categoryFilter = 'all';
  const categories = [{ id: 'all', name: 'Tất cả', icon: '▦' }, ...allowed];
  categories.forEach(category => {
    const button = createElement('button', category.id === state.categoryFilter ? 'active' : '');
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', category.id === state.categoryFilter ? 'true' : 'false');
    button.textContent = `${category.icon || '◇'} ${category.name}`;
    button.onclick = () => {
      state.categoryFilter = category.id;
      state.advancedFilters = {};
      renderCategoryTabs();
      renderActiveFilterChips();
      renderProducts();
    };
    container.appendChild(button);
  });
}

function updateDashboardStats() {
  const products = state.products.filter(product => canViewCategory(inferCategory(product).id));
  byId('stat-total-items').textContent = formatNumber(products.length, 0);
  const showWarnings = !isGuestUser() || state.guestPolicy.showWarning;
  byId('stat-low-stock').textContent = showWarnings ? formatNumber(products.filter(product => getProductStatus(product).key === 'low').length, 0) : '—';
  byId('stat-out-stock').textContent = showWarnings ? formatNumber(products.filter(product => getProductStatus(product).key === 'out').length, 0) : '—';
}

function getFilteredProducts() {
  const queryTokens = canonicalSearchTokens(byId('search-input').value);
  let products = state.products.filter(product => {
    const category = inferCategory(product);
    if (!canViewCategory(category.id)) return false;
    if (state.categoryFilter !== 'all' && category.id !== state.categoryFilter) return false;

    const status = getProductStatus(product);
    if (state.stockFilter !== 'all' && status.key !== state.stockFilter) return false;
    if (!productMatchesSearch(product, queryTokens)) return false;

    for (const [attributeId, expected] of Object.entries(state.advancedFilters)) {
      if (!expected) continue;
      const attribute = category.attributes.find(item => item.id === attributeId);
      if (!attribute) return false;
      const value = getAttributeValue(product, attribute);
      if (normalizeIdentityValue(value, attribute.type) !== normalizeIdentityValue(expected, attribute.type)) return false;
    }
    return true;
  });

  products = products.sort(compareProducts);
  return products;
}

function smartCategoryIndex(product) {
  return state.schema.categories.findIndex(category => category.id === inferCategory(product).id);
}

function compareAttributeValues(a, b, category) {
  for (const attribute of category.attributes.filter(item => item.identity)) {
    const valueA = getAttributeValue(a, attribute);
    const valueB = getAttributeValue(b, attribute);
    if (attribute.type === 'number') {
      const numberA = parseFlexibleNumber(valueA);
      const numberB = parseFlexibleNumber(valueB);
      if (Number.isFinite(numberA) && Number.isFinite(numberB) && numberA !== numberB) return numberA - numberB;
    }
    const textCompare = String(valueA).localeCompare(String(valueB), 'vi', { numeric: true, sensitivity: 'base' });
    if (textCompare !== 0) return textCompare;
  }
  return String(a.name).localeCompare(String(b.name), 'vi', { numeric: true, sensitivity: 'base' });
}

function compareProducts(a, b) {
  if (state.sortMode === 'low') return Number(a.quantity || 0) - Number(b.quantity || 0);
  if (state.sortMode === 'high') return Number(b.quantity || 0) - Number(a.quantity || 0);
  if (state.sortMode === 'az') return String(a.name).localeCompare(String(b.name), 'vi', { numeric: true, sensitivity: 'base' });

  const categoryIndexA = smartCategoryIndex(a);
  const categoryIndexB = smartCategoryIndex(b);
  if (categoryIndexA !== categoryIndexB) return categoryIndexA - categoryIndexB;
  return compareAttributeValues(a, b, inferCategory(a));
}

function updateViewModeControls() {
  all('[data-view-mode]').forEach(button => {
    const active = button.dataset.viewMode === state.viewMode;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

window.setInventoryViewMode = function setInventoryViewMode(mode) {
  if (!['compact', 'detailed'].includes(mode)) return;
  state.viewMode = mode;
  localStorage.setItem(VIEW_MODE_KEY, mode);
  updateViewModeControls();
  renderProducts();
};

function renderProducts() {
  updateDashboardStats();
  const products = getFilteredProducts();
  const list = byId('product-list');
  list.replaceChildren();
  list.classList.toggle('view-compact', state.viewMode === 'compact');
  list.classList.toggle('view-detailed', state.viewMode === 'detailed');
  updateViewModeControls();

  byId('inventory-result-count').textContent = `${formatNumber(products.length, 0)} mặt hàng`;
  const activeCategory = state.categoryFilter === 'all' ? null : getCategory(state.categoryFilter);
  byId('inventory-list-title').textContent = activeCategory ? activeCategory.name : 'Tất cả vật liệu';
  byId('inventory-empty').hidden = products.length > 0;
  list.hidden = products.length === 0;

  products.forEach(product => {
    const category = inferCategory(product);
    const status = getProductStatus(product);
    const visibleCategory = { ...category, attributes: category.attributes.filter(attribute => canViewAttribute(category.id, attribute.id)) };
    const presentation = getProductDisplayPresentation(product, visibleCategory);
    const showName = !isGuestUser() || state.guestPolicy.showName;
    const showSpec = !isGuestUser() || state.guestPolicy.showSpec;
    const showQuantity = canViewQuantity(category.id);
    const showWarning = !isGuestUser() || state.guestPolicy.showWarning;
    const allowDetail = !isGuestUser() || state.guestPolicy.allowDetail;
    const row = createElement('button', `material-row status-${showWarning ? status.key : 'ok'}`);
    row.type = 'button';
    row.disabled = !allowDetail;
    if (allowDetail) row.onclick = () => openProductDetail(product.id);
    row.setAttribute('aria-label', showQuantity ? `${presentation.title}, tồn ${formatNumber(product.quantity)} ${getProductUnit(product)}` : presentation.title);

    const main = createElement('div', 'material-main');
    const topLine = createElement('div', 'material-topline');
    const dot = createElement('span', 'category-dot');
    const displayName = showName ? (presentation.title || category.name) : `Vật liệu ${category.name}`;
    const name = createElement('strong', '', displayName);
    topLine.append(dot, name);

    const meta = createElement('div', 'material-meta', showSpec ? presentation.meta : '');
    meta.hidden = !showSpec || !presentation.meta;

    const statusLine = createElement('div', 'material-status-line');
    statusLine.appendChild(createElement('span', 'mini-status category-status', category.name));
    if (showWarning && status.key !== 'ok') statusLine.appendChild(createElement('span', `mini-status ${status.key}`, status.label));
    main.append(topLine, meta, statusLine);

    const quantity = createElement('div', 'material-quantity');
    quantity.append(
      createElement('strong', '', showQuantity ? formatNumber(product.quantity) : '—'),
      createElement('span', '', showQuantity ? getProductUnit(product) : 'ẩn')
    );
    row.append(main, quantity);
    list.appendChild(row);
  });
}

window.clearSearch = function clearSearch() {
  window.clearTimeout(state.searchTimer);
  byId('search-input').value = '';
  byId('clear-search-button').hidden = true;
  renderProducts();
};

window.refreshProducts = async function refreshProducts() {
  const requestId = ++state.requestIds.products;
  showLoadingState('products', true);
  renderSkeleton('inventory-loading');
  try {
    const products = await dbFetchProducts();
    if (requestId !== state.requestIds.products) return;
    state.products = products;
    renderProducts();
  } catch (error) {
    showToast(`Không tải được kho: ${error.message}`, 'error');
  } finally {
    if (requestId === state.requestIds.products) showLoadingState('products', false);
  }
};

window.refreshCurrentView = function refreshCurrentView() {
  if (state.currentScreen === 'history') loadHistory(true);
  else window.refreshProducts();
};

window.openSortSheet = function openSortSheet() {
  const options = [
    ['smart', 'Theo nhóm và quy cách'],
    ['low', 'Tồn thấp trước'],
    ['high', 'Tồn cao trước'],
    ['az', 'Tên A–Z']
  ];
  const container = byId('sort-options');
  container.replaceChildren();
  options.forEach(([key, label]) => {
    const button = createElement('button', state.sortMode === key ? 'active' : '');
    button.type = 'button';
    const text = createElement('span', '', label);
    const check = createElement('span', 'choice-check', '✓');
    button.append(text, check);
    button.onclick = () => {
      state.sortMode = key;
      window.closeOverlay('sort-sheet');
      renderProducts();
    };
    container.appendChild(button);
  });
  openOverlay('sort-sheet');
};

function getFilterCategory(categoryId = state.categoryFilter) {
  if (!categoryId || categoryId === 'all') return null;
  return getCategory(categoryId);
}

function populateFilterCategorySelect(selectedId) {
  const select = byId('filter-category-select');
  select.replaceChildren();
  visibleCategories().forEach(category => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.name;
    option.selected = category.id === selectedId;
    select.appendChild(option);
  });
}

function sortFilterValues(attribute, values) {
  return [...values].sort((a, b) => {
    if (attribute.type === 'number') {
      const numberA = parseFlexibleNumber(a);
      const numberB = parseFlexibleNumber(b);
      if (Number.isFinite(numberA) && Number.isFinite(numberB)) return numberA - numberB;
    }
    return String(a).localeCompare(String(b), 'vi', { numeric: true, sensitivity: 'base' });
  });
}

function renderAdvancedFilterFields(categoryId) {
  const category = getFilterCategory(categoryId);
  const container = byId('advanced-filter-fields');
  container.replaceChildren();
  if (!category) return;

  byId('filter-context-note').textContent = `Đang lọc các thuộc tính riêng của nhóm ${category.name}.`;
  const attributes = category.attributes.filter(attribute => attribute.filter);
  if (!attributes.length) {
    const empty = createElement('div', 'filter-empty-state');
    empty.append(
      createElement('strong', '', 'Chưa có thuộc tính lọc'),
      createElement('span', '', 'Bạn có thể bật “Cho phép lọc” trong phần thiết lập thuộc tính.')
    );
    container.appendChild(empty);
    return;
  }

  attributes.forEach(attribute => {
    const group = createElement('div', 'filter-option-group');
    const label = createElement('label', '', attribute.name);
    const select = document.createElement('select');
    select.dataset.attributeId = attribute.id;
    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = `Tất cả ${attribute.name.toLowerCase()}`;
    select.appendChild(allOption);

    const values = new Set();
    state.products.filter(product => inferCategory(product).id === category.id).forEach(product => {
      const value = getAttributeValue(product, attribute);
      if (hasValue(value)) values.add(String(value));
    });

    sortFilterValues(attribute, values).forEach(value => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = formatAttributeValue(attribute, value);
      select.appendChild(option);
    });
    select.value = state.draftAdvancedFilters[attribute.id] || '';
    select.onchange = () => {
      if (select.value) state.draftAdvancedFilters[attribute.id] = select.value;
      else delete state.draftAdvancedFilters[attribute.id];
    };
    group.append(label, select);
    container.appendChild(group);
  });
}

window.openFilterSheet = function openFilterSheet() {
  const requestedCategoryId = state.categoryFilter !== 'all'
    ? state.categoryFilter
    : (state.draftFilterCategoryId || state.schema.categories[0]?.id);
  const defaultCategoryId = state.schema.categories.some(category => category.id === requestedCategoryId)
    ? requestedCategoryId
    : state.schema.categories[0]?.id;
  state.draftFilterCategoryId = defaultCategoryId;
  state.draftAdvancedFilters = state.categoryFilter === defaultCategoryId ? { ...state.advancedFilters } : {};
  populateFilterCategorySelect(defaultCategoryId);
  renderAdvancedFilterFields(defaultCategoryId);
  openOverlay('filter-sheet');
};

window.resetAdvancedFilters = function resetAdvancedFilters() {
  state.draftAdvancedFilters = {};
  all('#advanced-filter-fields select').forEach(select => { select.value = ''; });
};

window.applyAdvancedFilters = function applyAdvancedFilters() {
  if (!state.draftFilterCategoryId) return;
  state.categoryFilter = state.draftFilterCategoryId;
  state.advancedFilters = { ...state.draftAdvancedFilters };
  renderCategoryTabs();
  renderActiveFilterChips();
  renderProducts();
  window.closeOverlay('filter-sheet');
};

function renderActiveFilterChips() {
  const container = byId('active-filter-chips');
  container.replaceChildren();
  const category = getFilterCategory();
  if (!category) {
    container.hidden = true;
    return;
  }

  Object.entries(state.advancedFilters).forEach(([attributeId, value]) => {
    const attribute = category.attributes.find(item => item.id === attributeId);
    if (!attribute) return;
    const chip = createElement('span', 'filter-chip');
    chip.appendChild(createElement('span', '', `${attribute.name}: ${formatAttributeValue(attribute, value)}`));
    const remove = createElement('button', '', '×');
    remove.type = 'button';
    remove.setAttribute('aria-label', `Bỏ lọc ${attribute.name}`);
    remove.onclick = () => {
      delete state.advancedFilters[attributeId];
      renderActiveFilterChips();
      renderProducts();
    };
    chip.appendChild(remove);
    container.appendChild(chip);
  });
  container.hidden = container.childElementCount === 0;
}

function getSelectedProduct() {
  return state.products.find(product => String(product.id) === String(state.selectedProductId));
}

window.openProductDetail = function openProductDetail(productId) {
  state.selectedProductId = productId;
  const product = getSelectedProduct();
  if (!product) return;
  const category = inferCategory(product);
  if (!canViewCategory(category.id) || (isGuestUser() && !state.guestPolicy.allowDetail)) return;
  const status = getProductStatus(product);
  const visibleCategory = { ...category, attributes: category.attributes.filter(attribute => canViewAttribute(category.id, attribute.id)) };
  const presentation = getProductDisplayPresentation(product, visibleCategory);
  const showName = !isGuestUser() || state.guestPolicy.showName;
  const showSpec = !isGuestUser() || state.guestPolicy.showSpec;
  const showQuantity = canViewQuantity(category.id);
  const showWarning = !isGuestUser() || state.guestPolicy.showWarning;

  byId('detail-product-category').textContent = category.name;
  byId('detail-product-name').textContent = showName ? (presentation.title || category.name) : `Vật liệu ${category.name}`;
  const detailMeta = byId('detail-product-meta');
  detailMeta.textContent = showSpec ? presentation.meta : '';
  detailMeta.hidden = !showSpec || !presentation.meta;
  byId('detail-product-quantity').textContent = showQuantity ? formatNumber(product.quantity) : '—';
  byId('detail-product-unit').textContent = showQuantity ? getProductUnit(product) : 'Số lượng đã ẩn';
  const statusBadge = byId('detail-product-status');
  statusBadge.hidden = !showWarning;
  statusBadge.textContent = status.label;
  statusBadge.className = `status-badge ${status.key === 'ok' ? '' : status.key}`.trim();

  const detailGrid = byId('detail-product-attributes');
  detailGrid.replaceChildren();
  const details = [];
  if (showSpec) category.attributes.forEach(attribute => {
    if (!canViewAttribute(category.id, attribute.id)) return;
    const value = getAttributeValue(product, attribute);
    if (String(value ?? '').trim()) details.push([attribute.name, formatAttributeValue(attribute, value)]);
  });
  if (showQuantity) {
    details.push(['Đơn vị', getProductUnit(product)]);
    details.push(['Mức cảnh báo', `${formatNumber(getProductWarning(product))} ${getProductUnit(product)}`]);
  }
  details.forEach(([label, value]) => {
    const wrapper = createElement('div');
    wrapper.append(createElement('dt', '', label), createElement('dd', '', value));
    detailGrid.appendChild(wrapper);
  });
  applyPermissionUi();
  const transactionActions = document.querySelector('#product-detail-sheet .dual-actions');
  if (transactionActions) transactionActions.hidden = !canTransactCategory(category.id);
  const editButton = document.querySelector('#product-detail-sheet .button-secondary.permission-check');
  if (editButton) editButton.hidden = !canEditProductCategory(category.id, 'edit');
  openOverlay('product-detail-sheet');
};

window.editSelectedProduct = function editSelectedProduct() {
  const product = getSelectedProduct();
  if (!product || !hasPermission('sua_xoa')) return;
  window.closeOverlay('product-detail-sheet');
  window.openProductEditor(product.id);
};

function populateCategorySelect(selectedId, mode = 'edit') {
  const select = byId('product-category-select');
  select.replaceChildren();
  const categories = state.schema.categories.filter(category => canEditProductCategory(category.id, mode));
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.name;
    option.selected = category.id === selectedId;
    select.appendChild(option);
  });
}

function renderUnitOptions(category, selectedUnit) {
  const select = byId('product-unit-select');
  select.replaceChildren();
  const units = category.units?.length ? category.units : ['đơn vị'];
  units.forEach(unit => {
    const option = document.createElement('option');
    option.value = unit;
    option.textContent = unit;
    option.selected = unit === selectedUnit;
    select.appendChild(option);
  });
}

function createDynamicField(attribute, value = '') {
  const field = createElement('div', 'field');
  const inputId = `product-attr-${attribute.id}`;
  const label = createElement('label', '', `${attribute.name}${attribute.required ? ' *' : ''}`);
  label.htmlFor = inputId;
  let input;

  if (attribute.type === 'select') {
    input = document.createElement('select');
    const blank = document.createElement('option');
    blank.value = '';
    blank.textContent = '-- Chọn --';
    input.appendChild(blank);
    (attribute.options || []).forEach(optionValue => {
      const option = document.createElement('option');
      option.value = optionValue;
      option.textContent = optionValue;
      option.selected = String(value) === String(optionValue);
      input.appendChild(option);
    });
  } else {
    input = document.createElement('input');
    input.type = attribute.type === 'number' ? 'number' : 'text';
    if (attribute.type === 'number') {
      input.step = '0.01';
      input.inputMode = 'decimal';
    }
    input.value = value ?? '';
  }
  input.id = inputId;
  input.dataset.attributeId = attribute.id;
  input.dataset.attributeType = attribute.type;
  input.required = Boolean(attribute.required);
  const editorCategoryId = byId('product-category-select')?.value;
  const editingExisting = Boolean(byId('product-edit-id')?.value);
  if (editingExisting && editorCategoryId && !canEditAttributeValue(editorCategoryId, attribute.id)) {
    input.disabled = true;
    field.classList.add('field-readonly');
  }
  field.append(label, input);
  if (attribute.unit) field.appendChild(createElement('small', '', `Đơn vị: ${attribute.unit}`));
  return field;
}

function renderProductEditorFields(product = null) {
  const category = getCategory(byId('product-category-select').value);
  const container = byId('product-dynamic-fields');
  container.replaceChildren();
  category.attributes.forEach(attribute => {
    const value = product && inferCategory(product).id === category.id ? getAttributeValue(product, attribute) : '';
    container.appendChild(createDynamicField(attribute, value));
  });

  const selectedUnit = product && inferCategory(product).id === category.id ? getProductUnit(product) : category.defaultUnit;
  renderUnitOptions(category, selectedUnit);
  if (!product || inferCategory(product).id !== category.id) {
    byId('product-warning-input').value = category.warningDefault ?? 0;
  }
}

function readProductEditorValues() {
  const category = getCategory(byId('product-category-select').value);
  const values = {};
  category.attributes.forEach(attribute => {
    const input = byId(`product-attr-${attribute.id}`);
    let value = input?.value ?? '';
    if (attribute.type === 'number' && value !== '') {
      const parsed = parseFlexibleNumber(value);
      value = Number.isFinite(parsed) ? parsed : value;
    }
    values[attribute.id] = value;
  });
  return { category, values };
}

function updateProductNamePreview() {
  const { category, values } = readProductEditorValues();
  const presentation = buildProductPresentation(category, values);
  byId('product-name-preview').textContent = presentation.title || category.name;
  const metaPreview = byId('product-meta-preview');
  if (metaPreview) {
    metaPreview.textContent = presentation.meta || 'Thông số phụ sẽ hiển thị tại đây';
    metaPreview.hidden = !presentation.meta;
  }
}

window.openProductEditor = function openProductEditor(productId = null) {
  const product = productId !== null ? state.products.find(item => String(item.id) === String(productId)) : null;
  const mode = product ? 'edit' : 'add';
  const targetCategory = product ? inferCategory(product) : state.schema.categories.find(category => canEditProductCategory(category.id, mode));
  if (!targetCategory || !canEditProductCategory(targetCategory.id, mode)) {
    showToast('Bạn không có quyền sửa nhóm vật liệu này.', 'warning');
    return;
  }

  byId('product-edit-id').value = product?.id ?? '';
  byId('product-editor-title').textContent = product ? 'Chỉnh sửa vật liệu' : 'Thêm vật liệu';
  byId('delete-product-button').hidden = !product || !hasPermission('xoa_vat_lieu') || !canEditProductCategory(targetCategory.id, 'edit');
  populateCategorySelect(targetCategory.id, mode);
  byId('product-category-select').disabled = Boolean(product);
  byId('product-quantity-input').value = product ? Number(product.quantity || 0) : 0;
  byId('product-quantity-input').disabled = Boolean(product);
  byId('product-warning-input').value = product ? getProductWarning(product) : targetCategory.warningDefault;
  byId('product-warning-input').disabled = Boolean(product) && !hasPermission('sua_canh_bao');
  renderProductEditorFields(product);
  updateProductNamePreview();
  applyPermissionUi();
  openOverlay('product-editor-modal');
  window.setTimeout(() => byId('product-dynamic-fields').querySelector('input:not(:disabled),select:not(:disabled)')?.focus(), 60);
};

window.saveProduct = async function saveProduct() {
  const button = byId('save-product-button');
  const editId = byId('product-edit-id').value;
  const existing = editId ? state.products.find(product => String(product.id) === String(editId)) : null;
  const existingCategory = existing ? inferCategory(existing) : null;
  if (existing && (!hasPermission('sua_xoa') || !canEditProductCategory(existingCategory.id, 'edit'))) return;
  if (!existing && !hasPermission('them_sp')) return;

  const { category, values } = readProductEditorValues();
  if (!canEditProductCategory(category.id, existing ? 'edit' : 'add')) { showToast('Bạn không có quyền với nhóm này.', 'warning'); return; }
  for (const attribute of category.attributes) {
    if (attribute.required && !String(values[attribute.id] ?? '').trim()) {
      showToast(`Vui lòng nhập “${attribute.name}”.`, 'warning');
      byId(`product-attr-${attribute.id}`)?.focus();
      return;
    }
    if (attribute.type === 'number' && String(values[attribute.id] ?? '').trim() && !Number.isFinite(parseFlexibleNumber(values[attribute.id]))) {
      showToast(`Giá trị “${attribute.name}” không hợp lệ.`, 'warning');
      return;
    }
  }

  const quantity = parseFlexibleNumber(byId('product-quantity-input').value);
  const warning = parseFlexibleNumber(byId('product-warning-input').value);
  if (!Number.isFinite(quantity) || quantity < 0) {
    showToast('Số lượng tồn phải là số không âm.', 'warning');
    return;
  }
  if (!Number.isFinite(warning) || warning < 0) {
    showToast('Mức cảnh báo phải là số không âm.', 'warning');
    return;
  }

  const signature = buildSignature(category, values);
  const name = buildProductName(category, values);
  const unit = byId('product-unit-select').value || category.defaultUnit;

  await runLocked('save-product', button, async () => {
    try {
      const latestProducts = await dbFetchProducts();
      const duplicate = latestProducts.find(product => String(product.id) !== String(editId || '') && computeProductSignature(product) === signature);
      if (duplicate) {
        showToast(`Quy cách đã tồn tại: ${duplicate.name}`, 'warning', 5000);
        return;
      }

      const preserved = { ...(existing?.attributes || {}) };
      category.attributes.forEach(attribute => {
        preserved[attrKey(attribute.id)] = values[attribute.id];
      });
      Object.assign(preserved, {
        __category: category.id,
        __unit: unit,
        __warning: warning,
        __signature: signature,
        __schemaVersion: 3,
        __nameMode: 'auto'
      });

      const record = {
        id: existing?.id ?? makeNumericId(),
        name,
        quantity,
        attributes: preserved
      };
      const savedRows = await dbUpsertProducts([record]);
      const saved = savedRows[0] || record;
      const index = state.products.findIndex(product => String(product.id) === String(saved.id));
      if (index >= 0) state.products[index] = saved;
      else state.products.push(saved);

      if (!existing && quantity > 0) {
        try {
          await dbAddLog(name, 'import', quantity, quantity);
        } catch (logError) {
          showToast(`Đã lưu vật liệu nhưng chưa ghi được lịch sử: ${logError.message}`, 'warning', 5200);
        }
      }

      window.closeOverlay('product-editor-modal');
      renderProducts();
      showToast(existing ? 'Đã cập nhật vật liệu.' : 'Đã thêm vật liệu.');
    } catch (error) {
      showToast(`Không thể lưu vật liệu: ${error.message}`, 'error', 5200);
    }
  }, 'Đang lưu…');
};

window.deleteEditingProduct = async function deleteEditingProduct() {
  if (!hasPermission('sua_xoa')) return;
  const editId = byId('product-edit-id').value;
  const product = state.products.find(item => String(item.id) === String(editId));
  if (!product) return;
  const accepted = await confirmAction({
    title: 'Xóa vật liệu?',
    message: `“${product.name}” sẽ bị xóa khỏi danh sách kho. Lịch sử cũ vẫn còn nhưng không thể khôi phục vật liệu tự động.`,
    acceptText: 'Xóa vật liệu'
  });
  if (!accepted) return;

  try {
    await dbDeleteProduct(product.id);
    state.products = state.products.filter(item => String(item.id) !== String(product.id));
    window.closeOverlay('product-editor-modal');
    renderProducts();
    showToast('Đã xóa vật liệu.');
  } catch (error) {
    showToast(`Không thể xóa: ${error.message}`, 'error');
  }
};

window.openTransactionModal = function openTransactionModal(type) {
  const product = getSelectedProduct();
  if (!product || !hasPermission('nhap_xuat') || !canTransactCategory(inferCategory(product).id)) return;
  state.transactionType = type;
  byId('transaction-title').textContent = type === 'import' ? 'Nhập kho' : 'Xuất kho';
  byId('transaction-product-name').textContent = getProductDisplayPresentation(product).title;
  byId('transaction-current-quantity').textContent = `${formatNumber(product.quantity)} ${getProductUnit(product)}`;
  byId('transaction-unit-label').textContent = getProductUnit(product);
  byId('transaction-amount-input').value = '';
  byId('transaction-result-quantity').textContent = '—';
  const confirmButton = byId('confirm-transaction-button');
  confirmButton.textContent = type === 'import' ? 'Xác nhận nhập' : 'Xác nhận xuất';
  confirmButton.className = type === 'import' ? 'button button-primary' : 'button button-danger';
  window.closeOverlay('product-detail-sheet');
  openOverlay('transaction-modal');
  window.setTimeout(() => byId('transaction-amount-input').focus(), 60);
};

function updateTransactionPreview() {
  const product = getSelectedProduct();
  if (!product) return;
  const amount = parseFlexibleNumber(byId('transaction-amount-input').value);
  if (!Number.isFinite(amount) || amount <= 0) {
    byId('transaction-result-quantity').textContent = '—';
    return;
  }
  const current = Number(product.quantity || 0);
  const result = state.transactionType === 'import' ? current + amount : current - amount;
  byId('transaction-result-quantity').textContent = `${formatNumber(result)} ${getProductUnit(product)}`;
  byId('transaction-result-quantity').style.color = result < 0 ? 'var(--danger)' : '';
}

window.submitTransaction = async function submitTransaction() {
  const product = getSelectedProduct();
  if (!product || !hasPermission('nhap_xuat') || !canTransactCategory(inferCategory(product).id)) return;
  const amount = parseFlexibleNumber(byId('transaction-amount-input').value);
  if (!Number.isFinite(amount) || amount <= 0) {
    showToast('Số lượng giao dịch phải lớn hơn 0.', 'warning');
    return;
  }
  const oldQuantity = Number(product.quantity || 0);
  const newQuantity = state.transactionType === 'import' ? oldQuantity + amount : oldQuantity - amount;
  if (newQuantity < 0) {
    showToast(`Không đủ hàng. Tồn hiện tại chỉ còn ${formatNumber(oldQuantity)} ${getProductUnit(product)}.`, 'warning', 5000);
    return;
  }

  await runLocked('transaction', byId('confirm-transaction-button'), async () => {
    try {
      const updated = await dbUpdateQuantity(product, newQuantity);
      try {
        await dbAddLog(product.name, state.transactionType, amount, newQuantity);
      } catch (logError) {
        try {
          await state.client.from('products').update({ quantity: oldQuantity }).eq('id', product.id).eq('quantity', newQuantity);
        } catch {
          // Không thể đảm bảo rollback nếu kết nối tiếp tục lỗi.
        }
        throw new Error(`Không ghi được lịch sử giao dịch: ${logError.message}`);
      }

      const index = state.products.findIndex(item => String(item.id) === String(product.id));
      state.products[index] = updated;
      window.closeOverlay('transaction-modal');
      renderProducts();
      showToast(state.transactionType === 'import' ? 'Đã nhập kho.' : 'Đã xuất kho.');
    } catch (error) {
      if (error.code === 'INVENTORY_CONFLICT') {
        await window.refreshProducts();
        showToast('Tồn kho vừa được thay đổi trên thiết bị khác. Danh sách đã được làm mới.', 'warning', 5500);
      } else {
        showToast(`Giao dịch thất bại: ${error.message}`, 'error', 5500);
      }
    }
  }, 'Đang lưu…');
};

window.loadHistory = async function loadHistory(force = false) {
  const requestId = ++state.requestIds.history;
  showLoadingState('history', true);
  renderSkeleton('history-loading', 5);
  try {
    const month = byId('history-month-filter').value;
    const logs = await dbFetchLogs(month);
    if (requestId !== state.requestIds.history) return;
    state.logs = logs;
    renderHistory();
  } catch (error) {
    showToast(`Không tải được lịch sử: ${error.message}`, 'error');
  } finally {
    if (requestId === state.requestIds.history) showLoadingState('history', false);
  }
};

function renderHistory() {
  const query = normalizeText(state.historySearch);
  const visibleProducts = state.products.filter(product => canViewCategory(inferCategory(product).id));
  const productByName = new Map(visibleProducts.map(product => [product.name, product]));
  const visibleProductNames = new Set(productByName.keys());
  const logs = state.logs.filter(log => {
    if (!visibleProductNames.has(log.productName)) return false;
    if (state.historyType !== 'all' && log.action !== state.historyType) return false;
    if (query && !normalizeText(log.productName).includes(query)) return false;
    return true;
  });
  const list = byId('history-list');
  list.replaceChildren();
  byId('history-result-count').textContent = `${formatNumber(logs.length, 0)} giao dịch`;
  byId('history-import-count').textContent = formatNumber(logs.filter(log => log.action === 'import').length, 0);
  byId('history-export-count').textContent = formatNumber(logs.filter(log => log.action === 'export').length, 0);
  byId('history-product-count').textContent = formatNumber(new Set(logs.map(log => log.productName)).size, 0);
  byId('history-empty').hidden = logs.length > 0;
  list.hidden = logs.length === 0;

  logs.forEach(log => {
    const product = productByName.get(log.productName);
    const category = product ? inferCategory(product) : null;
    const showQuantity = category ? canViewQuantity(category.id) : hasPermission('xem_so_luong');
    const showName = !isGuestUser() || state.guestPolicy.showName;
    const row = createElement('article', `history-row ${log.action === 'export' ? 'export' : 'import'}`);
    const icon = createElement('div', 'history-action-icon', log.action === 'export' ? '−' : '+');
    const main = createElement('div', 'history-main');
    main.append(createElement('strong', '', showName ? log.productName : `Vật liệu ${category?.name || ''}`.trim()), createElement('span', '', formatDateTime(log.timestamp)));
    const amount = createElement('div', 'history-amount');
    amount.append(
      createElement('strong', '', showQuantity ? `${log.action === 'export' ? '−' : '+'}${formatNumber(log.amount)}` : '—'),
      createElement('span', '', showQuantity ? `Tồn sau: ${formatNumber(log.newTotal)}` : 'Số lượng đã ẩn')
    );
    row.append(icon, main, amount);
    list.appendChild(row);
  });
}

window.openAttributeStudio = function openAttributeStudio() {
  if (!hasPermission('thuoc_tinh')) return;
  const allowed = manageableCategories();
  if (!allowed.length) {
    showToast('Bạn chưa được cấp quyền quản lý thuộc tính cho nhóm nào.', 'warning');
    return;
  }
  state.schemaDraft = structuredCloneSafe(state.schema);
  state.studioCategoryId = allowed[0].id;
  renderAttributeStudio();
  openOverlay('attribute-studio-modal');
};

function getStudioCategory() {
  return state.schemaDraft?.categories.find(category => category.id === state.studioCategoryId) || null;
}

function renderAttributeStudio() {
  const categories = (state.schemaDraft?.categories || []).filter(category => canManageCategoryAttributes(category.id));
  const list = byId('studio-category-list');
  list.replaceChildren();
  categories.forEach(category => {
    const button = createElement('button', `studio-category-button ${category.id === state.studioCategoryId ? 'active' : ''}`);
    button.type = 'button';
    button.append(createElement('span', '', `${category.icon || '◇'} ${category.name}`), createElement('span', '', String(category.attributes.length)));
    button.onclick = () => {
      state.studioCategoryId = category.id;
      renderAttributeStudio();
    };
    list.appendChild(button);
  });

  const category = getStudioCategory();
  byId('attribute-studio-empty').hidden = Boolean(category);
  byId('attribute-studio-content').hidden = !category;
  byId('delete-category-button').hidden = !category || state.schemaDraft.categories.length <= 1;
  if (!category) return;

  byId('studio-category-name').value = category.name;
  byId('studio-category-units').value = (category.units || []).join(', ');
  byId('studio-category-warning').value = category.warningDefault ?? 0;
  renderStudioAttributes(category);
}

function syncStudioCategoryInputs() {
  const category = getStudioCategory();
  if (!category) return;
  category.name = byId('studio-category-name').value.trim() || 'Nhóm chưa đặt tên';
  category.units = byId('studio-category-units').value.split(',').map(item => item.trim()).filter(Boolean);
  if (!category.units.length) category.units = ['đơn vị'];
  category.defaultUnit = category.units.includes(category.defaultUnit) ? category.defaultUnit : category.units[0];
  const warning = parseFlexibleNumber(byId('studio-category-warning').value);
  category.warningDefault = Number.isFinite(warning) && warning >= 0 ? warning : 0;
  renderStudioCategoryButtonsOnly();
}

function renderStudioCategoryButtonsOnly() {
  const list = byId('studio-category-list');
  const scrollLeft = list.scrollLeft;
  list.replaceChildren();
  state.schemaDraft.categories.filter(category => canManageCategoryAttributes(category.id)).forEach(category => {
    const button = createElement('button', `studio-category-button ${category.id === state.studioCategoryId ? 'active' : ''}`);
    button.type = 'button';
    button.append(createElement('span', '', `${category.icon || '◇'} ${category.name}`), createElement('span', '', String(category.attributes.length)));
    button.onclick = () => {
      state.studioCategoryId = category.id;
      renderAttributeStudio();
    };
    list.appendChild(button);
  });
  list.scrollLeft = scrollLeft;
}

function renderStudioAttributes(category) {
  const container = byId('studio-attribute-list');
  container.replaceChildren();
  if (!category.attributes.length) {
    container.appendChild(createElement('div', 'empty-state', 'Nhóm này chưa có thuộc tính.'));
    return;
  }
  category.attributes.forEach((attribute, index) => {
    const card = createElement('article', 'attribute-card');
    const main = createElement('div', 'attribute-card-main');
    const tags = [attribute.type === 'select' ? 'Danh sách' : attribute.type === 'number' ? 'Số' : 'Văn bản'];
    if (attribute.unit) tags.push(attribute.unit);
    if (attribute.required) tags.push('Bắt buộc');
    if (attribute.identity) tags.push('Nhận diện');
    main.append(createElement('strong', '', attribute.name), createElement('span', '', tags.join(' · ')));
    const actions = createElement('div', 'attribute-card-actions');
    const up = createElement('button', '', '↑');
    up.type = 'button';
    up.disabled = index === 0 || !canEditAttributeDefinition(category.id, attribute.id);
    up.title = 'Đưa lên';
    up.onclick = () => moveAttribute(index, -1);
    const down = createElement('button', '', '↓');
    down.type = 'button';
    down.disabled = index === category.attributes.length - 1 || !canEditAttributeDefinition(category.id, attribute.id);
    down.title = 'Đưa xuống';
    down.onclick = () => moveAttribute(index, 1);
    const edit = createElement('button', '', '✎');
    edit.type = 'button';
    edit.title = 'Chỉnh sửa';
    edit.disabled = !canEditAttributeDefinition(category.id, attribute.id) && !canManageAttributeOptions(category.id, attribute.id);
    edit.onclick = () => openAttributeEditor(attribute.id);
    actions.append(up, down, edit);
    card.append(main, actions);
    container.appendChild(card);
  });
}

function moveAttribute(index, delta) {
  const category = getStudioCategory();
  if (!category) return;
  const target = index + delta;
  if (target < 0 || target >= category.attributes.length) return;
  [category.attributes[index], category.attributes[target]] = [category.attributes[target], category.attributes[index]];
  renderStudioAttributes(category);
}

window.addCategory = function addCategory() {
  if (!state.permissions.includes('superadmin')) { showToast('Chỉ Super Admin được tạo nhóm mới.', 'warning'); return; }
  const category = {
    id: makeSlug('nhom', 'category'),
    name: 'Nhóm mới',
    icon: '◇',
    units: ['cái'],
    defaultUnit: 'cái',
    warningDefault: 5,
    naming: { style: 'generic', applyExisting: 'on-edit' },
    attributes: []
  };
  state.schemaDraft.categories.push(category);
  state.studioCategoryId = category.id;
  renderAttributeStudio();
  byId('studio-category-name').focus();
  byId('studio-category-name').select();
};

window.deleteCurrentCategory = async function deleteCurrentCategory() {
  if (!state.permissions.includes('superadmin')) { showToast('Chỉ Super Admin được xóa nhóm.', 'warning'); return; }
  const category = getStudioCategory();
  if (!category) return;
  const used = state.products.filter(product => inferCategory(product).id === category.id).length;
  if (used > 0) {
    showToast(`Không thể xóa. Nhóm đang được dùng bởi ${used} mặt hàng.`, 'warning', 5000);
    return;
  }
  const accepted = await confirmAction({ title: 'Xóa nhóm vật liệu?', message: `Nhóm “${category.name}” và các thuộc tính bên trong sẽ bị xóa.`, acceptText: 'Xóa nhóm' });
  if (!accepted) return;
  state.schemaDraft.categories = state.schemaDraft.categories.filter(item => item.id !== category.id);
  state.studioCategoryId = state.schemaDraft.categories[0]?.id || null;
  renderAttributeStudio();
};

window.addAttribute = function addAttribute() {
  const category = getStudioCategory();
  if (!category || !canEditAttributeDefinition(category.id, '__new__')) { showToast('Bạn không có quyền thêm thuộc tính trong nhóm này.', 'warning'); return; }
  state.editingAttributeId = null;
  byId('attribute-editor-title').textContent = 'Thêm thuộc tính';
  byId('attribute-edit-id').value = '';
  byId('attribute-name-input').value = '';
  byId('attribute-type-select').value = 'select';
  byId('attribute-unit-input').value = '';
  byId('attribute-options-input').value = '';
  byId('attribute-required-checkbox').checked = false;
  byId('attribute-identity-checkbox').checked = true;
  byId('attribute-list-checkbox').checked = true;
  byId('attribute-filter-checkbox').checked = true;
  byId('attribute-name-input').disabled = false;
  byId('attribute-type-select').disabled = false;
  byId('attribute-unit-input').disabled = false;
  byId('attribute-options-input').disabled = false;
  byId('attribute-required-checkbox').disabled = false;
  byId('attribute-identity-checkbox').disabled = false;
  byId('attribute-list-checkbox').disabled = false;
  byId('attribute-filter-checkbox').disabled = false;
  byId('delete-attribute-button').hidden = true;
  toggleAttributeOptionsField();
  openOverlay('attribute-editor-modal');
  window.setTimeout(() => byId('attribute-name-input').focus(), 50);
};

function openAttributeEditor(attributeId) {
  const category = getStudioCategory();
  const attribute = category?.attributes.find(item => item.id === attributeId);
  if (!attribute) return;
  if (!canEditAttributeDefinition(category.id, attribute.id) && !canManageAttributeOptions(category.id, attribute.id)) return;
  state.editingAttributeId = attributeId;
  byId('attribute-editor-title').textContent = 'Chỉnh sửa thuộc tính';
  byId('attribute-edit-id').value = attribute.id;
  byId('attribute-name-input').value = attribute.name;
  byId('attribute-type-select').value = attribute.type;
  byId('attribute-unit-input').value = attribute.unit || '';
  byId('attribute-options-input').value = (attribute.options || []).join('\n');
  byId('attribute-required-checkbox').checked = Boolean(attribute.required);
  byId('attribute-identity-checkbox').checked = Boolean(attribute.identity);
  byId('attribute-list-checkbox').checked = Boolean(attribute.list);
  byId('attribute-filter-checkbox').checked = Boolean(attribute.filter);
  const canDefinition = canEditAttributeDefinition(category.id, attribute.id);
  const canOptions = canManageAttributeOptions(category.id, attribute.id);
  byId('attribute-name-input').disabled = !canDefinition;
  byId('attribute-type-select').disabled = !canDefinition;
  byId('attribute-unit-input').disabled = !canDefinition;
  byId('attribute-required-checkbox').disabled = !canDefinition;
  byId('attribute-identity-checkbox').disabled = !canDefinition;
  byId('attribute-list-checkbox').disabled = !canDefinition;
  byId('attribute-filter-checkbox').disabled = !canDefinition;
  byId('attribute-options-input').disabled = !canOptions && !canDefinition;
  byId('delete-attribute-button').hidden = !canDeleteAttribute(category.id, attribute.id);
  toggleAttributeOptionsField();
  openOverlay('attribute-editor-modal');
}

function toggleAttributeOptionsField() {
  byId('attribute-options-field').hidden = byId('attribute-type-select').value !== 'select';
}

window.commitAttributeEditor = function commitAttributeEditor() {
  const category = getStudioCategory();
  if (!category) return;
  const previous = category.attributes.find(item => item.id === state.editingAttributeId) || null;
  const canDefinition = canEditAttributeDefinition(category.id, state.editingAttributeId || '__new__');
  const canOptions = previous ? canManageAttributeOptions(category.id, previous.id) : canDefinition;
  if (!canDefinition && !canOptions) return;

  const name = canDefinition ? byId('attribute-name-input').value.trim() : previous?.name;
  if (!name) { showToast('Vui lòng nhập tên thuộc tính.', 'warning'); return; }
  const duplicate = category.attributes.find(attribute => normalizeText(attribute.name) === normalizeText(name) && attribute.id !== state.editingAttributeId);
  if (duplicate) { showToast('Tên thuộc tính đã tồn tại trong nhóm.', 'warning'); return; }

  const type = canDefinition ? byId('attribute-type-select').value : previous?.type;
  const options = type === 'select' && (canDefinition || canOptions)
    ? byId('attribute-options-input').value.split('\n').map(item => item.trim()).filter(Boolean)
    : (previous?.options || []);
  const attributeDraft = {
    ...(previous || {}),
    id: state.editingAttributeId || makeSlug(name, 'attr'),
    name,
    type,
    unit: canDefinition ? byId('attribute-unit-input').value.trim() : (previous?.unit || ''),
    options,
    required: canDefinition ? byId('attribute-required-checkbox').checked : Boolean(previous?.required),
    identity: canDefinition ? byId('attribute-identity-checkbox').checked : Boolean(previous?.identity),
    list: canDefinition ? byId('attribute-list-checkbox').checked : Boolean(previous?.list),
    filter: canDefinition ? byId('attribute-filter-checkbox').checked : Boolean(previous?.filter),
    nameRole: previous?.nameRole || (category.attributes.length === 0 ? 'title' : 'meta'),
    namePrefix: previous?.namePrefix || '',
    optionAliases: previous?.optionAliases || {}
  };
  const attribute = normalizeAttributeDefinition(attributeDraft, category.attributes.findIndex(item => item.id === attributeDraft.id), category.naming?.style || inferNamingStyle(category));
  const index = category.attributes.findIndex(item => item.id === attribute.id);
  if (index >= 0) category.attributes[index] = attribute;
  else category.attributes.push(attribute);
  renderStudioAttributes(category);
  window.closeOverlay('attribute-editor-modal');
};

window.deleteEditingAttribute = async function deleteEditingAttribute() {
  const category = getStudioCategory();
  const attribute = category?.attributes.find(item => item.id === state.editingAttributeId);
  if (!attribute || !canDeleteAttribute(category.id, attribute.id)) { showToast('Bạn không có quyền xóa thuộc tính này.', 'warning'); return; }
  const used = state.products.filter(product => String(getAttributeValue(product, attribute) ?? '').trim()).length;
  const accepted = await confirmAction({
    title: 'Ẩn thuộc tính khỏi cấu hình?',
    message: used > 0
      ? `Thuộc tính “${attribute.name}” đang có dữ liệu ở ${used} mặt hàng. Giá trị cũ không bị xóa khỏi database nhưng sẽ không còn hiển thị.`
      : `Thuộc tính “${attribute.name}” sẽ bị xóa khỏi nhóm.`,
    acceptText: 'Xóa thuộc tính'
  });
  if (!accepted) return;
  category.attributes = category.attributes.filter(item => item.id !== attribute.id);
  renderStudioAttributes(category);
  window.closeOverlay('attribute-editor-modal');
};

window.saveSchemaChanges = async function saveSchemaChanges() {
  if (!hasPermission('thuoc_tinh')) return;
  syncStudioCategoryInputs();
  const button = byId('save-schema-button');
  const invalidCategory = state.schemaDraft.categories.find(category => !category.name.trim() || !category.units.length);
  if (invalidCategory) {
    showToast('Mỗi nhóm cần có tên và ít nhất một đơn vị.', 'warning');
    return;
  }
  await runLocked('save-schema', button, async () => {
    try {
      const normalizedDraft = normalizeSchema(state.schemaDraft);
      await dbSaveSchema(normalizedDraft);
      state.schema = structuredCloneSafe(normalizedDraft);
      state.schemaDraft = structuredCloneSafe(normalizedDraft);
      renderCategoryTabs();
      renderProducts();
      window.closeOverlay('attribute-studio-modal');
      showToast('Đã lưu thiết lập thuộc tính.');
    } catch (error) {
      showToast(`Không thể lưu thiết lập: ${error.message}`, 'error');
    }
  }, 'Đang lưu…');
};

window.openUserManager = async function openUserManager(initialPanel = 'users') {
  if (!hasPermission('quan_tri')) return;
  resetUserForm();
  setPermissionManagerPanel(initialPanel === 'guest' ? 'guest' : 'users');
  openOverlay('user-manager-modal');
  renderPermissionGroupMatrix();
  renderPermissionAttributeCategoryOptions();
  renderGuestPolicyForm();
  await loadUsers();
};

function setPermissionManagerPanel(panel) {
  state.permissionPanel = panel;
  all('[data-permission-panel-target]').forEach(button => {
    const active = button.dataset.permissionPanelTarget === panel;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  all('[data-permission-panel]').forEach(section => {
    const active = section.dataset.permissionPanel === panel;
    section.hidden = !active;
    section.classList.toggle('active', active);
  });
}

function defaultScopeForRole(role) {
  const permissions = ROLE_PRESETS[role] || [];
  const full = role === 'superadmin' || role === 'warehouse_manager';
  const manager = role === 'group_manager';
  const staff = role === 'warehouse_staff';
  const viewer = role === 'viewer' || role === 'auditor';
  const groups = {};
  state.schema.categories.forEach(category => {
    groups[category.id] = {
      view: full || manager || staff || viewer,
      quantity: full || manager || staff || viewer,
      transact: full || manager || staff,
      editProduct: full || manager,
      manageAttributes: full
    };
  });
  return { permissions: [...permissions], groups, attributes: {} };
}

function currentUserDraftProfile() {
  const role = byId('user-role-select').value || 'custom';
  const permissions = role === 'superadmin' ? ['superadmin'] : all('[name="user-permission"]:checked').map(input => input.value);
  const groups = {};
  all('[data-group-permission-row]').forEach(row => {
    const categoryId = row.dataset.groupPermissionRow;
    groups[categoryId] = {};
    all('input[data-group-permission]', row).forEach(input => { groups[categoryId][input.dataset.groupPermission] = input.checked; });
  });
  const attributes = structuredCloneSafe(state.editingUserProfile?.attributes || {});
  all('[data-attribute-permission-row]').forEach(row => {
    const categoryId = row.dataset.categoryId;
    const attributeId = row.dataset.attributeId;
    attributes[categoryId] ||= {};
    attributes[categoryId][attributeId] ||= {};
    all('input[data-attribute-permission]', row).forEach(input => { attributes[categoryId][attributeId][input.dataset.attributePermission] = input.checked; });
  });
  return { version: ACCESS_PROFILE_VERSION, mode: 'access-profile', baseRole: role, permissions, groups, attributes };
}

function applyRolePreset(role, preserveScopes = false) {
  if (role === 'custom') return;
  const preset = defaultScopeForRole(role);
  all('[name="user-permission"]').forEach(input => { input.checked = preset.permissions.includes(input.value); });
  if (!preserveScopes) {
    state.editingUserProfile = { version: ACCESS_PROFILE_VERSION, mode: 'access-profile', baseRole: role, ...preset };
    renderPermissionGroupMatrix();
    renderPermissionAttributePanel();
  }
  renderUserPermissionSummary();
}

async function loadUsers() {
  const requestId = ++state.requestIds.users;
  const list = byId('user-list');
  list.replaceChildren();
  renderSkeletonInto(list, 4);
  try {
    const users = await dbFetchUsers();
    if (requestId !== state.requestIds.users) return;
    state.users = users.filter(user => user.username !== 'guest');
    renderUsers(state.users);
  } catch (error) {
    list.replaceChildren();
    showToast(`Không tải được tài khoản: ${error.message}`, 'error');
  }
}

function renderSkeletonInto(container, count) {
  const wrapper = createElement('div', 'skeleton-list');
  for (let index = 0; index < count; index += 1) wrapper.appendChild(createElement('div', 'skeleton-row'));
  container.appendChild(wrapper);
}

function roleLabel(role) {
  return ({ viewer: 'Chỉ xem', warehouse_staff: 'Nhân viên kho', group_manager: 'Quản lý nhóm', warehouse_manager: 'Quản trị kho', auditor: 'Kiểm kê', superadmin: 'Super Admin', custom: 'Tùy chỉnh' })[role] || 'Tùy chỉnh';
}

function permissionLabels(permissions) {
  const map = { superadmin: 'Toàn quyền', xem_kho: 'Xem kho', xem_so_luong: 'Xem tồn', nhap_xuat: 'Nhập xuất', them_sp: 'Thêm', sua_xoa: 'Sửa', thuoc_tinh: 'Thuộc tính', bao_cao: 'Báo cáo', quan_tri: 'Nhân sự' };
  return permissions.map(permission => map[permission] || permission).join(' · ') || 'Không có quyền';
}

function renderUsers(users) {
  const query = normalizeText(byId('user-search-input')?.value || '');
  const filtered = users.filter(user => !query || normalizeText(user.username).includes(query));
  const list = byId('user-list');
  list.replaceChildren();
  byId('user-count-label').textContent = `${filtered.length} tài khoản`;
  filtered.sort((a, b) => String(a.username).localeCompare(String(b.username), 'vi')).forEach(user => {
    const profile = parseAccessProfile(user.role, user.username);
    const assignedGroups = state.schema.categories.filter(category => profile.groups?.[category.id]?.view).map(category => category.name);
    const row = createElement('button', 'user-row');
    row.type = 'button';
    const content = createElement('div');
    content.append(
      createElement('strong', '', user.username),
      createElement('span', '', `${roleLabel(profile.baseRole)}${assignedGroups.length ? ` · ${assignedGroups.join(', ')}` : ''}`),
      createElement('small', '', permissionLabels(profile.permissions))
    );
    row.append(content, createElement('span', 'chevron', '›'));
    row.onclick = () => editUser(user);
    list.appendChild(row);
  });
  if (!filtered.length) list.appendChild(createElement('div', 'permission-matrix-empty', 'Không tìm thấy tài khoản.'));
}

function resetUserForm() {
  byId('user-edit-original-username').value = '';
  byId('user-username-input').value = '';
  byId('user-username-input').readOnly = false;
  byId('user-password-input').value = '';
  byId('user-role-select').value = 'viewer';
  const preset = defaultScopeForRole('viewer');
  state.editingUserProfile = { version: ACCESS_PROFILE_VERSION, mode: 'access-profile', baseRole: 'viewer', ...preset };
  all('[name="user-permission"]').forEach(input => { input.checked = preset.permissions.includes(input.value); });
  byId('save-user-button').textContent = 'Tạo tài khoản';
  byId('cancel-user-edit-button').hidden = true;
  renderPermissionGroupMatrix();
  renderPermissionAttributeCategoryOptions();
  renderPermissionAttributePanel();
  renderUserPermissionSummary();
}
window.resetUserForm = resetUserForm;

function editUser(user) {
  const profile = parseAccessProfile(user.role, user.username);
  if (!isStructuredProfile(profile)) {
    const fallback = defaultScopeForRole(profile.permissions.includes('superadmin') ? 'superadmin' : 'custom');
    profile.baseRole = profile.permissions.includes('superadmin') ? 'superadmin' : 'custom';
    profile.groups = fallback.groups;
    profile.attributes = {};
  }
  state.editingUserProfile = structuredCloneSafe(profile);
  byId('user-edit-original-username').value = user.username;
  byId('user-username-input').value = user.username;
  byId('user-username-input').readOnly = true;
  byId('user-password-input').value = '';
  byId('user-role-select').value = profile.baseRole || 'custom';
  all('[name="user-permission"]').forEach(input => { input.checked = profile.permissions.includes(input.value); });
  byId('save-user-button').textContent = 'Cập nhật';
  byId('cancel-user-edit-button').hidden = false;
  renderPermissionGroupMatrix();
  renderPermissionAttributeCategoryOptions();
  renderPermissionAttributePanel();
  renderUserPermissionSummary();
  document.querySelector('.permission-editor')?.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderPermissionGroupMatrix() {
  const container = byId('user-group-permission-matrix');
  if (!container) return;
  container.replaceChildren();
  const header = createElement('div', 'permission-matrix-row permission-matrix-header');
  ['Nhóm vật liệu', 'Xem', 'Số lượng', 'Nhập/Xuất', 'Sửa vật liệu', 'Thuộc tính'].forEach(text => header.appendChild(createElement('span', '', text)));
  container.appendChild(header);
  const profile = state.editingUserProfile || { groups: {} };
  state.schema.categories.forEach(category => {
    const scope = profile.groups?.[category.id] || { view: false, quantity: false, transact: false, editProduct: false, manageAttributes: false };
    const row = createElement('div', 'permission-matrix-row');
    row.dataset.groupPermissionRow = category.id;
    row.appendChild(createElement('strong', '', `${category.icon || '◇'} ${category.name}`));
    ['view', 'quantity', 'transact', 'editProduct', 'manageAttributes'].forEach(key => {
      const label = createElement('label', 'matrix-check');
      const input = document.createElement('input');
      input.type = 'checkbox'; input.checked = Boolean(scope[key]); input.dataset.groupPermission = key;
      input.addEventListener('change', () => { state.editingUserProfile = currentUserDraftProfile(); renderUserPermissionSummary(); });
      label.append(input, createElement('span', 'sr-only', key));
      row.appendChild(label);
    });
    container.appendChild(row);
  });
}

function renderPermissionAttributeCategoryOptions() {
  const select = byId('permission-attribute-category-select');
  if (!select) return;
  const current = select.value;
  select.replaceChildren();
  state.schema.categories.forEach(category => {
    const option = document.createElement('option'); option.value = category.id; option.textContent = category.name; select.appendChild(option);
  });
  select.value = state.schema.categories.some(category => category.id === current) ? current : (state.schema.categories[0]?.id || '');
}

function renderPermissionAttributePanel() {
  const container = byId('user-attribute-permission-panel');
  if (!container) return;
  const categoryId = byId('permission-attribute-category-select')?.value;
  const category = state.schema.categories.find(item => item.id === categoryId);
  const query = normalizeText(byId('permission-attribute-search')?.value || '');
  container.replaceChildren();
  if (!category) { container.appendChild(createElement('div', 'permission-matrix-empty', 'Chọn một nhóm để thiết lập quyền thuộc tính.')); return; }
  const profile = state.editingUserProfile || { attributes: {} };
  category.attributes.filter(attribute => !query || normalizeText(attribute.name).includes(query)).forEach(attribute => {
    const inheritedScope = profile.groups?.[category.id] || {};
    const current = profile.attributes?.[category.id]?.[attribute.id] || {
      view: Boolean(inheritedScope.view), editValue: Boolean(inheritedScope.editProduct), manageOptions: Boolean(inheritedScope.manageAttributes), editDefinition: Boolean(inheritedScope.manageAttributes), delete: false
    };
    const row = createElement('article', 'attribute-permission-row');
    row.dataset.attributePermissionRow = attribute.id; row.dataset.categoryId = category.id; row.dataset.attributeId = attribute.id;
    const title = createElement('div', 'attribute-permission-title');
    title.append(createElement('strong', '', attribute.name), createElement('span', '', `${attribute.type === 'number' ? 'Số' : attribute.type === 'select' ? 'Danh sách' : 'Văn bản'}${attribute.unit ? ` · ${attribute.unit}` : ''}`));
    row.appendChild(title);
    const grid = createElement('div', 'attribute-permission-checks');
    [['view','Xem'],['editValue','Sửa giá trị'],['manageOptions','Quản lý lựa chọn'],['editDefinition','Sửa cấu hình'],['delete','Xóa']].forEach(([key,labelText]) => {
      const label = createElement('label');
      const input = document.createElement('input'); input.type = 'checkbox'; input.checked = Boolean(current[key]); input.dataset.attributePermission = key;
      input.addEventListener('change', () => { state.editingUserProfile = currentUserDraftProfile(); renderUserPermissionSummary(); });
      label.append(input, createElement('span', '', labelText)); grid.appendChild(label);
    });
    row.appendChild(grid); container.appendChild(row);
  });
  if (!container.childElementCount) container.appendChild(createElement('div', 'permission-matrix-empty', 'Không có thuộc tính phù hợp.'));
}

function renderUserPermissionSummary() {
  const container = byId('user-permission-summary');
  if (!container) return;
  const profile = currentUserDraftProfile();
  state.editingUserProfile = structuredCloneSafe(profile);
  const groups = state.schema.categories.filter(category => profile.groups?.[category.id]?.view).map(category => category.name);
  const transactionGroups = state.schema.categories.filter(category => profile.groups?.[category.id]?.transact).map(category => category.name);
  const editGroups = state.schema.categories.filter(category => profile.groups?.[category.id]?.editProduct).map(category => category.name);
  const attributeGroups = state.schema.categories.filter(category => profile.groups?.[category.id]?.manageAttributes).map(category => category.name);
  container.replaceChildren();
  const list = document.createElement('ul');
  const summaries = [
    `Vai trò: ${roleLabel(profile.baseRole)}`,
    groups.length ? `Được xem: ${groups.join(', ')}` : 'Không được xem nhóm vật liệu nào',
    transactionGroups.length ? `Được nhập/xuất: ${transactionGroups.join(', ')}` : 'Không được nhập/xuất',
    editGroups.length ? `Được sửa vật liệu: ${editGroups.join(', ')}` : 'Không được sửa vật liệu',
    attributeGroups.length ? `Được quản lý thuộc tính: ${attributeGroups.join(', ')}` : 'Không được quản lý thuộc tính'
  ];
  summaries.forEach(text => list.appendChild(createElement('li', '', text)));
  container.appendChild(list);
}

function collectGuestPolicyFromForm() {
  const groups = {};
  all('#guest-group-permission-matrix input[data-guest-group]').forEach(input => { groups[input.dataset.guestGroup] = input.checked; });
  return normalizeGuestPolicy({
    enabled: byId('guest-access-enabled').checked,
    visibleScreens: { inventory: byId('guest-visible-inventory').checked, history: byId('guest-visible-history').checked, settings: byId('guest-visible-settings').checked },
    showName: byId('guest-show-name').checked,
    showSpec: byId('guest-show-spec').checked,
    showQuantity: byId('guest-show-quantity').checked,
    showWarning: byId('guest-show-warning').checked,
    allowSearch: byId('guest-allow-search').checked,
    allowFilter: byId('guest-allow-filter').checked,
    allowDetail: byId('guest-allow-detail').checked,
    allowExport: byId('guest-allow-export').checked,
    groups
  });
}

function renderGuestGroupMatrix() {
  const container = byId('guest-group-permission-matrix');
  if (!container) return;
  container.replaceChildren();
  state.schema.categories.forEach(category => {
    const label = createElement('label', 'guest-group-card');
    const input = document.createElement('input'); input.type = 'checkbox'; input.dataset.guestGroup = category.id; input.checked = state.guestPolicy.groups?.[category.id] !== false;
    input.addEventListener('change', renderGuestPolicySummary);
    label.append(input, createElement('span', '', `${category.icon || '◇'} ${category.name}`));
    container.appendChild(label);
  });
}

function renderGuestPolicyForm() {
  const policy = state.guestPolicy;
  byId('guest-access-enabled').checked = policy.enabled;
  byId('guest-visible-inventory').checked = policy.visibleScreens.inventory;
  byId('guest-visible-history').checked = policy.visibleScreens.history;
  byId('guest-visible-settings').checked = policy.visibleScreens.settings;
  byId('guest-show-name').checked = policy.showName;
  byId('guest-show-spec').checked = policy.showSpec;
  byId('guest-show-quantity').checked = policy.showQuantity;
  byId('guest-show-warning').checked = policy.showWarning;
  byId('guest-allow-search').checked = policy.allowSearch;
  byId('guest-allow-filter').checked = policy.allowFilter;
  byId('guest-allow-detail').checked = policy.allowDetail;
  byId('guest-allow-export').checked = policy.allowExport;
  byId('guest-policy-content').classList.toggle('disabled-content', !policy.enabled);
  renderGuestGroupMatrix(); renderGuestPolicySummary();
}

function renderGuestPolicySummary() {
  const policy = collectGuestPolicyFromForm();
  byId('guest-policy-content').classList.toggle('disabled-content', !policy.enabled);
  const selectedGroups = state.schema.categories.filter(category => policy.groups?.[category.id]).map(category => category.name);
  const screens = Object.entries(policy.visibleScreens).filter(([,enabled]) => enabled).map(([key]) => ({inventory:'Kho',history:'Lịch sử',settings:'Cài đặt'})[key]);
  const container = byId('guest-policy-summary');
  container.replaceChildren();
  const list = document.createElement('ul');
  [policy.enabled ? `Màn hình: ${screens.join(', ') || 'Không có'}` : 'Chế độ khách đang tắt', `Nhóm: ${selectedGroups.join(', ') || 'Không có'}`, policy.showQuantity ? 'Được xem số lượng tồn' : 'Số lượng tồn được ẩn', policy.allowDetail ? 'Được mở chi tiết' : 'Không được mở chi tiết'].forEach(text => list.appendChild(createElement('li', '', text)));
  container.appendChild(list);
}

window.saveUser = async function saveUser() {
  if (!hasPermission('quan_tri')) return;
  const original = byId('user-edit-original-username').value;
  const username = byId('user-username-input').value.trim();
  const password = byId('user-password-input').value;
  const profile = currentUserDraftProfile();
  if (!username || (!original && !password)) { showToast('Vui lòng nhập tên đăng nhập và mật khẩu cho tài khoản mới.', 'warning'); return; }
  if (username === 'guest') { showToast('Tên “guest” được dành riêng cho chính sách khách.', 'warning'); return; }
  await runLocked('save-user', byId('save-user-button'), async () => {
    try {
      if (original) {
        const changes = { role: JSON.stringify(profile) };
        if (password) changes.password = password;
        await dbUpdateUser(original, changes);
        showToast('Đã cập nhật tài khoản.');
      } else {
        const existing = await dbFetchUser(username);
        if (existing) { showToast('Tên đăng nhập đã tồn tại.', 'warning'); return; }
        await dbCreateUser({ username, password, role: JSON.stringify(profile) });
        showToast('Đã tạo tài khoản.');
      }
      resetUserForm(); await loadUsers();
    } catch (error) { showToast(`Không thể lưu tài khoản: ${error.message}`, 'error'); }
  }, 'Đang lưu…');
};

async function saveGuestPolicy() {
  const policy = collectGuestPolicyFromForm();
  await runLocked('save-guest-policy', byId('save-guest-policy-button'), async () => {
    try {
      state.guestPolicy = await dbSaveAccessPolicy(policy);
      renderGuestPolicyForm();
      showToast('Đã lưu quyền khách.');
    } catch (error) { showToast(`Không thể lưu quyền khách: ${error.message}`, 'error'); }
  }, 'Đang lưu…');
}

function bindPermissionManagerEvents() {
  all('[data-permission-panel-target]').forEach(button => button.addEventListener('click', () => setPermissionManagerPanel(button.dataset.permissionPanelTarget)));
  byId('user-role-select')?.addEventListener('change', event => applyRolePreset(event.target.value));
  all('[name="user-permission"]').forEach(input => input.addEventListener('change', () => { byId('user-role-select').value = 'custom'; renderUserPermissionSummary(); }));
  byId('permission-attribute-category-select')?.addEventListener('change', renderPermissionAttributePanel);
  byId('permission-attribute-search')?.addEventListener('input', renderPermissionAttributePanel);
  byId('user-search-input')?.addEventListener('input', () => renderUsers(state.users));
  byId('copy-group-permissions-button')?.addEventListener('click', () => {
    const first = document.querySelector('[data-group-permission-row]'); if (!first) return;
    const values = {}; all('input[data-group-permission]', first).forEach(input => { values[input.dataset.groupPermission] = input.checked; });
    all('[data-group-permission-row]').forEach(row => all('input[data-group-permission]', row).forEach(input => { input.checked = values[input.dataset.groupPermission]; }));
    state.editingUserProfile = currentUserDraftProfile(); renderUserPermissionSummary();
  });
  byId('guest-policy-form')?.addEventListener('submit', saveGuestPolicy);
  all('#guest-policy-form input').forEach(input => input.addEventListener('change', renderGuestPolicySummary));
  byId('reset-guest-policy-button')?.addEventListener('click', () => { state.guestPolicy = normalizeGuestPolicy(DEFAULT_GUEST_POLICY); renderGuestPolicyForm(); });
}

function csvEscape(value) {
  const text = String(value ?? '');
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

window.exportProductsCsv = function exportProductsCsv() {
  if (!hasPermission('bao_cao') || (isGuestUser() && !state.guestPolicy.allowExport)) return;
  const rows = [['Nhóm', 'Tên', 'Số lượng', 'Đơn vị', 'Cảnh báo', 'Thuộc tính JSON']];
  state.products.filter(product => canViewCategory(inferCategory(product).id)).forEach(product => {
    const category = inferCategory(product);
    const attributes = {};
    category.attributes.forEach(attribute => {
      const value = getAttributeValue(product, attribute);
      if (String(value ?? '').trim()) attributes[attribute.name] = value;
    });
    rows.push([
      category.name,
      product.name,
      product.quantity,
      getProductUnit(product),
      getProductWarning(product),
      JSON.stringify(attributes)
    ]);
  });
  const csv = '\ufeff' + rows.map(row => row.map(csvEscape).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `kho-khuon-be-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
  showToast('Đã tạo file CSV.');
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter(items => items.some(item => String(item).trim()));
}

function findCategoryByName(name) {
  const normalized = normalizeText(name);
  return state.schema.categories.find(category => normalizeText(category.name) === normalized) || getCategory('phu-lieu');
}

function valuesFromNamedAttributes(category, namedAttributes) {
  const values = {};
  category.attributes.forEach(attribute => {
    const matchingKey = Object.keys(namedAttributes).find(key => normalizeText(key) === normalizeText(attribute.name));
    values[attribute.id] = matchingKey ? namedAttributes[matchingKey] : '';
  });
  return values;
}

window.importProductsCsv = async function importProductsCsv(event) {
  const input = event.target;
  const file = input.files?.[0];
  input.value = '';
  if (!file || !hasPermission('bao_cao')) return;
  try {
    const rows = parseCsv(await file.text());
    if (rows.length < 2) throw new Error('File không có dữ liệu.');
    const headers = rows[0].map(header => String(header).replace(/^\ufeff/, '').trim());
    const headerMap = Object.fromEntries(headers.map((header, index) => [normalizeText(header), index]));
    const isV3 = headerMap['nhom'] !== undefined && headerMap['thuoc tinh json'] !== undefined;
    const records = [];

    for (const row of rows.slice(1)) {
      if (isV3) {
        const category = findCategoryByName(row[headerMap['nhom']]);
        const namedAttributes = JSON.parse(row[headerMap['thuoc tinh json']] || '{}');
        const values = valuesFromNamedAttributes(category, namedAttributes);
        const quantity = parseFlexibleNumber(row[headerMap['so luong']]);
        const warning = parseFlexibleNumber(row[headerMap['canh bao']]);
        const unit = row[headerMap['don vi']] || category.defaultUnit;
        const attributes = {
          __category: category.id,
          __unit: unit,
          __warning: Number.isFinite(warning) ? warning : category.warningDefault,
          __signature: buildSignature(category, values),
          __schemaVersion: 3
        };
        category.attributes.forEach(attribute => { attributes[attrKey(attribute.id)] = values[attribute.id]; });
        records.push({
          id: makeNumericId(),
          name: row[headerMap['ten']] || buildProductName(category, values),
          quantity: Number.isFinite(quantity) && quantity >= 0 ? quantity : 0,
          attributes
        });
      } else {
        const nameIndex = headerMap['ten san pham'] ?? headerMap['ten'] ?? 0;
        const quantityIndex = headerMap['so luong'] ?? 1;
        const name = String(row[nameIndex] || '').trim();
        if (!name) continue;
        const category = inferCategory({ name, attributes: {} });
        const attributes = { __category: category.id, __unit: category.defaultUnit, __warning: category.warningDefault, __schemaVersion: 3 };
        headers.forEach((header, index) => {
          if (index !== nameIndex && index !== quantityIndex && String(row[index] ?? '').trim()) attributes[header] = row[index];
        });
        attributes.__signature = `${category.id}|legacy:${normalizeText(name)}`;
        const quantity = parseFlexibleNumber(row[quantityIndex]);
        records.push({ id: makeNumericId(), name, quantity: Number.isFinite(quantity) && quantity >= 0 ? quantity : 0, attributes });
      }
    }

    if (!records.length) throw new Error('Không tìm thấy dòng dữ liệu hợp lệ.');
    const latest = await dbFetchProducts();
    const latestBySignature = new Map(latest.map(product => [computeProductSignature(product), product]));
    let newCount = 0;
    let updateCount = 0;
    records.forEach(record => {
      const existing = latestBySignature.get(record.attributes.__signature);
      if (existing) {
        record.id = existing.id;
        updateCount += 1;
      } else {
        newCount += 1;
      }
    });

    const accepted = await confirmAction({
      title: 'Nhập dữ liệu CSV?',
      message: `${records.length} dòng hợp lệ: ${newCount} mặt hàng mới và ${updateCount} mặt hàng sẽ được cập nhật theo quy cách.`,
      acceptText: 'Nhập dữ liệu',
      danger: false,
      icon: '⇩'
    });
    if (!accepted) return;

    const batchSize = 100;
    for (let index = 0; index < records.length; index += batchSize) {
      await dbUpsertProducts(records.slice(index, index + batchSize));
    }
    await window.refreshProducts();
    showToast(`Đã nhập ${records.length} dòng dữ liệu.`);
  } catch (error) {
    showToast(`Không thể nhập CSV: ${error.message}`, 'error', 6000);
  }
};

window.printInventory = function printInventory() {
  if (!hasPermission('bao_cao') || (isGuestUser() && !state.guestPolicy.allowExport)) return;
  window.print();
};

function initializeMonthFilter() {
  const now = new Date();
  byId('history-month-filter').value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

async function bootstrap() {
  applyThemeFromStorage();
  const savedViewMode = localStorage.getItem(VIEW_MODE_KEY);
  state.viewMode = ['compact', 'detailed'].includes(savedViewMode) ? savedViewMode : 'detailed';
  bindStaticEvents();
  updateViewModeControls();
  initializeMonthFilter();
  setOnlineStatus();
  renderSkeleton('inventory-loading');
  showLoadingState('products', true);

  try {
    await initSupabase();
    const schema = await dbFetchSchema();
    state.schema = normalizeSchema(schema);
    await restoreSession();
    const canLoadProducts = !isGuestUser() || state.guestPolicy.enabled;
    state.products = canLoadProducts ? await dbFetchProducts() : [];
    renderCategoryTabs();
    renderActiveFilterChips();
    renderProducts();
    byId('app-shell').hidden = false;
    byId('app-loading').hidden = true;
    applyPermissionUi();
    if (isGuestUser() && !state.guestPolicy.enabled) window.showLoginScreen();
  } catch (error) {
    console.error(error);
    byId('app-loading').innerHTML = '';
    const mark = createElement('div', 'boot-mark', '!');
    const title = createElement('strong', '', 'Không thể mở ứng dụng');
    const message = createElement('span', '', error.message || 'Đã xảy ra lỗi không xác định.');
    const retry = createElement('button', 'button button-primary', 'Tải lại');
    retry.type = 'button'; retry.onclick = () => window.location.reload();
    byId('app-loading').append(mark, title, message, retry);
  } finally { showLoadingState('products', false); }
}

window.addEventListener('DOMContentLoaded', bootstrap);


// PWA service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
      registration.update().catch(() => {});
    } catch (error) {
      console.warn('Không thể đăng ký service worker:', error);
    }
  });
}
