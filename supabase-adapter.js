"use strict";

(function attachSupabaseAdapter(global) {
  const SESSION_KEY = "kb2_supabase_session_token";
  const FRIENDLY_ERRORS = Object.freeze({
    AUTH_REQUIRED: "Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại.",
    ACCOUNT_LOCKED: "Tài khoản đã bị khóa. Hãy liên hệ Super Admin.",
    ACCOUNT_DISABLED: "Tài khoản đã ngừng sử dụng.",
    PERMISSION_DENIED: "Bạn không có quyền thực hiện thao tác này.",
    NOT_FOUND: "Không tìm thấy dữ liệu cần thao tác.",
    DUPLICATE_PRODUCT: "Quy cách vật liệu này đã tồn tại.",
    DUPLICATE_USERNAME: "Tên đăng nhập đã tồn tại.",
    STALE_REVISION: "Dữ liệu đã được người khác cập nhật. Hãy tải lại rồi thử lại.",
    INSUFFICIENT_STOCK: "Tồn kho không đủ để xuất.",
    DUPLICATE_REQUEST: "Yêu cầu này đã được xử lý trước đó.",
    REQUEST_KEY_CONFLICT: "Khóa thao tác đã được dùng cho một nội dung khác.",
    INVALID_SCHEMA_CHANGE: "Thay đổi danh mục không an toàn với dữ liệu hiện có.",
    LAST_SUPERADMIN: "Phải giữ ít nhất một Super Admin đang hoạt động.",
    CONFIRM_REQUIRED: "Cần xác nhận thao tác quản trị nguy hiểm.",
    PERMISSION_CAP_EXCEEDED: "Quyền được chọn vượt quá vai trò.",
    VALIDATION_ERROR: "Dữ liệu nhập chưa hợp lệ.",
    NOT_INITIALIZED: "Ứng dụng chưa có Super Admin đầu tiên.",
    ALREADY_INITIALIZED: "Ứng dụng đã được khởi tạo.",
    LOGIN_RATE_LIMITED: "Đăng nhập sai quá nhiều lần. Hãy thử lại sau.",
    NETWORK_ERROR: "Không thể kết nối Supabase. Hãy kiểm tra mạng và thử lại.",
  });

  function normalizeUsername(value) {
    const username = String(value || "").trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
      throw new Error("Tên đăng nhập chỉ gồm chữ thường không dấu, số, dấu chấm, gạch dưới hoặc gạch ngang; dài 3–32 ký tự.");
    }
    return username;
  }

  function validateConfig(config) {
    const url = String(config?.supabaseUrl || "").trim();
    const key = String(config?.supabasePublishableKey || "").trim();
    if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url) || !key || key.includes("YOUR_")) {
      throw new Error("Supabase chưa được cấu hình. Hãy điền URL và anon/publishable key trong app-config.js.");
    }
    if (!global.supabase?.createClient) throw new Error("Không tải được thư viện Supabase JS.");
    return { url, key };
  }

  function parseDatabaseError(error) {
    const raw = String(error?.message || error?.details || error || "").trim();
    const match = raw.match(/^([A-Z_]+):(.*)$/s);
    if (match) {
      const code = match[1];
      const detail = match[2].trim();
      const normalized = new Error(detail || FRIENDLY_ERRORS[code] || "Không thể hoàn tất thao tác.");
      normalized.code = code;
      return normalized;
    }
    if (/fetch|network|failed to fetch/i.test(raw)) {
      const normalized = new Error(FRIENDLY_ERRORS.NETWORK_ERROR);
      normalized.code = "NETWORK_ERROR";
      return normalized;
    }
    const normalized = new Error(raw || "Supabase trả về lỗi không xác định.");
    normalized.code = error?.code || "UNKNOWN_ERROR";
    return normalized;
  }

  function makeRequestKey(prefix) {
    const randomPart = global.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return `${prefix}:${randomPart}`;
  }

  function localDayBoundary(dateValue, addDays = 0) {
    const match = String(dateValue || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return dateValue || null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]) + addDays, 0, 0, 0, 0);
    const offsetMinutes = -date.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? "+" : "-";
    const absoluteOffset = Math.abs(offsetMinutes);
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T00:00:00${sign}${pad(Math.floor(absoluteOffset / 60))}:${pad(absoluteOffset % 60)}`;
  }

  function normalizeCategoryPayload(payload) {
    const units = Array.isArray(payload.units)
      ? payload.units
      : String(payload.units || "").split(",").map((item) => item.trim()).filter(Boolean);
    const attributes = (payload.attributes || []).map((attribute, index) => ({
      id: attribute.id || "",
      name: String(attribute.name || "").trim(),
      type: ["text", "number", "select"].includes(attribute.type) ? attribute.type : "text",
      options: Array.isArray(attribute.options)
        ? attribute.options
        : String(attribute.options || "").split(",").map((item) => item.trim()).filter(Boolean),
      unit: String(attribute.unit || "").trim(),
      required: Boolean(attribute.required),
      identity: Boolean(attribute.identity),
      list: Boolean(attribute.list),
      sortOrder: Number.isFinite(Number(attribute.sortOrder)) ? Number(attribute.sortOrder) : index,
      identityOrder: attribute.identityOrder === null || attribute.identityOrder === undefined || attribute.identityOrder === ""
        ? null
        : Number(attribute.identityOrder),
    }));
    return { ...payload, units, attributes };
  }

  function createSupabaseDataService(config) {
    const { url, key } = validateConfig(config);
    const client = global.supabase.createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    function getToken() {
      try { return global.localStorage.getItem(SESSION_KEY) || ""; } catch { return ""; }
    }
    function setToken(token) {
      try {
        if (token) global.localStorage.setItem(SESSION_KEY, token);
        else global.localStorage.removeItem(SESSION_KEY);
      } catch { /* Storage unavailable: session lasts only until reload. */ }
    }

    let realtimeChannel = null;
    const realtimeTopic = "kb2-sync-state";

    async function removeRealtimeChannel() {
      const channel = realtimeChannel;
      realtimeChannel = null;
      if (!channel) return;
      try { await client.removeChannel(channel); } catch { /* Realtime cleanup is best-effort. */ }
    }

    function subscribeRealtime({ onEvent, onStatus } = {}) {
      if (config?.realtimeEnabled === false) {
        onStatus?.("DISABLED");
        return () => Promise.resolve();
      }

      void removeRealtimeChannel();
      const channel = client
        .channel(realtimeTopic)
        .on("postgres_changes", {
          event: "UPDATE",
          schema: "public",
          table: "kb2_sync_state",
          filter: "id=eq.1",
        }, (payload) => onEvent?.(payload))
        .subscribe((status) => onStatus?.(status));
      realtimeChannel = channel;

      return async () => {
        if (realtimeChannel === channel) realtimeChannel = null;
        try { await client.removeChannel(channel); } catch { /* Realtime cleanup is best-effort. */ }
      };
    }

    async function rpc(name, args = {}) {
      const { data, error } = await client.rpc(name, args);
      if (error) throw parseDatabaseError(error);
      return data;
    }

    function authenticatedArgs(args = {}) {
      const token = getToken();
      if (!token) {
        const error = new Error(FRIENDLY_ERRORS.AUTH_REQUIRED);
        error.code = "AUTH_REQUIRED";
        throw error;
      }
      return { p_session_token: token, ...args };
    }

    return Object.freeze({
      mode: "supabase",
      label: "Supabase Cloud",
      capabilities: Object.freeze({ localBackup: false, cloud: true, bootstrap: true, realtime: config?.realtimeEnabled !== false }),
      client,
      subscribeRealtime,
      unsubscribeRealtime: removeRealtimeChannel,

      async getInitializationStatus() {
        return rpc("kb2_get_initialization_status_v1");
      },

      async bootstrapFirstSuperadmin(payload) {
        return rpc("kb2_bootstrap_first_superadmin_v1", {
          p_username: normalizeUsername(payload.username),
          p_display_name: String(payload.displayName || "").trim(),
          p_password: String(payload.password || ""),
          p_password_confirm: String(payload.passwordConfirm || ""),
        });
      },

      async login(usernameInput, password) {
        const result = await rpc("kb2_login_v1", {
          p_username: normalizeUsername(usernameInput),
          p_password: String(password || ""),
        });
        if (!result?.token || !result?.profile) throw new Error("Phản hồi đăng nhập không hợp lệ.");
        setToken(result.token);
        return result.profile;
      },

      async logout() {
        const token = getToken();
        try {
          if (token) await rpc("kb2_logout_v1", { p_session_token: token });
        } finally {
          setToken("");
        }
        return true;
      },

      async getSessionProfile() {
        const token = getToken();
        if (!token) return null;
        try {
          return await rpc("kb2_get_my_profile_v1", { p_session_token: token });
        } catch (error) {
          if (["AUTH_REQUIRED", "ACCOUNT_LOCKED", "ACCOUNT_DISABLED"].includes(error.code)) {
            setToken("");
            return null;
          }
          throw error;
        }
      },

      async loadBootstrap() {
        return rpc("kb2_load_bootstrap_v1", authenticatedArgs());
      },

      async listTransactions({ limit = 50, offset = 0, categoryId = null, productId = null, type = null, from = null, to = null } = {}) {
        const result = await rpc("kb2_list_inventory_transactions_v1", authenticatedArgs({
          p_limit: limit,
          p_offset: offset,
          p_category_code: categoryId || null,
          p_product_id: productId || null,
          p_type: type || null,
          p_from: localDayBoundary(from, 0),
          p_to: localDayBoundary(to, 1),
        }));
        return {
          items: Array.isArray(result?.items) ? result.items : [],
          total: Math.max(0, Number(result?.total || 0)),
          nextOffset: result?.nextOffset === null || result?.nextOffset === undefined ? null : Math.max(0, Number(result.nextOffset)),
        };
      },

      async listAccounts({ limit = 200, offset = 0 } = {}) {
        const result = await rpc("kb2_list_accounts_v1", authenticatedArgs({ p_limit: limit, p_offset: offset }));
        return Array.isArray(result) ? result : [];
      },

      async listAccountAudit({ limit = 50, offset = 0 } = {}) {
        const result = await rpc("kb2_list_account_audit_v1", authenticatedArgs({ p_limit: limit, p_offset: offset }));
        return Array.isArray(result) ? result : [];
      },

      async saveProduct(payload) {
        return rpc("kb2_save_product_v1", authenticatedArgs({ p_payload: payload }));
      },

      async archiveProduct(productId, expectedRevision = null) {
        await rpc("kb2_archive_product_v1", authenticatedArgs({ p_product_id: productId, p_expected_revision: expectedRevision }));
        return true;
      },

      async deleteTestProduct(productId, expectedRevision = null, requestKey = "") {
        return rpc("kb2_delete_test_product_v1", authenticatedArgs({
          p_product_id: productId,
          p_expected_revision: expectedRevision,
          p_request_key: requestKey || makeRequestKey("delete-test-product"),
          p_confirmation: "DELETE_TEST_PRODUCT",
        }));
      },

      async applyTransaction(payload) {
        return rpc("kb2_apply_inventory_transaction_v1", authenticatedArgs({ p_payload: payload }));
      },

      async reverseTransaction(payload) {
        return rpc("kb2_reverse_inventory_transaction_v1", authenticatedArgs({ p_payload: payload }));
      },

      async saveAccount(payload) {
        return rpc("kb2_save_account_v1", authenticatedArgs({
          p_payload: { ...payload, requestKey: payload.requestKey || makeRequestKey("account") },
        }));
      },

      async setAccountPassword(accountId, password, passwordConfirm) {
        await rpc("kb2_reset_account_password_v1", authenticatedArgs({
          p_target_account_id: accountId,
          p_password: String(password || ""),
          p_password_confirm: String(passwordConfirm || ""),
          p_request_key: makeRequestKey("password"),
        }));
        return true;
      },

      async archiveAccount(accountId) {
        await rpc("kb2_disable_account_v1", authenticatedArgs({
          p_target_account_id: accountId,
          p_request_key: makeRequestKey("disable"),
        }));
        return true;
      },

      async saveCategory(payload) {
        return rpc("kb2_save_category_v1", authenticatedArgs({ p_payload: normalizeCategoryPayload(payload) }));
      },

      async setCategoryActive(categoryId, active, expectedRevision = null) {
        await rpc("kb2_set_category_active_v1", authenticatedArgs({
          p_category_code: categoryId,
          p_active: Boolean(active),
          p_expected_revision: expectedRevision,
        }));
        return true;
      },

      async deleteInventoryHistory({ before = null, reason = "", confirmation = "" } = {}) {
        return rpc("kb2_delete_inventory_history_v1", authenticatedArgs({
          p_before: before ? localDayBoundary(before, 1) : null,
          p_reason: String(reason || "").trim(),
          p_confirmation: String(confirmation || "").trim(),
        }));
      },

      exportBackup() { throw new Error("Bản Supabase không xuất toàn bộ database từ trình duyệt. Hãy dùng backup của Supabase."); },
      async importBackup() { throw new Error("Không hỗ trợ ghi đè database cloud từ file JSON trên trình duyệt."); },
      async resetDemo() { throw new Error("Không có chức năng đặt lại dữ liệu trên Supabase."); },
      async restoreRollback() { throw new Error("Hãy dùng backup của Supabase để rollback."); },
    });
  }

  global.createSupabaseDataService = createSupabaseDataService;
})(window);
