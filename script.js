// =========================================================================
// KHỞI TẠO CẤU HÌNH VÀ BIẾN TOÀN CỤC
// =========================================================================
const SUPABASE_URL = 'https://khoztrzdfadovsgmfggi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtob3p0cnpkZmFkb3ZzZ21mZ2dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NDU0MTgsImV4cCI6MjA5NTQyMTQxOH0.72V5ZbvzHOk6k5XViVaEEB3Aoz9AjyLt3AGx5L3gqCY';

window.appState = {
    supabaseClient: null,
    isDbReady: false,
    currentProducts: [],
    customColumns: [],
    appliedFilters: { stock: 'all', attributes: {} },
    selectedProductIds: new Set(),
    userPermissions: [], 
    activeAttributeIndex: null,
    currentUsername: null,
    // BIẾN QUẢN LÝ REALTIME
    realtimeChannel: null,
    refreshTimeout: null
};

// =========================================================================
// KẾT NỐI SUPABASE & KHỞI TẠO PHIÊN LÀM VIỆC (SESSION)
// =========================================================================
function initSupabase() {
    if (typeof window.supabase !== 'undefined') {
        try {
            window.appState.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            window.appState.isDbReady = true;
            console.log("✅ Supabase đã kết nối thành công.");
            
            checkSessionAndInit();
        } catch (error) {
            console.error("❌ Lỗi cấu hình Supabase:", error);
        }
    } else {
        console.warn("⏳ Đang đợi thư viện Supabase tải về...");
        setTimeout(initSupabase, 300);
    }
}
initSupabase();

function checkDB() {
    if (!window.appState.supabaseClient || !window.appState.isDbReady) {
        alert("Hệ thống đang kết nối cơ sở dữ liệu. Vui lòng chờ vài giây hoặc kiểm tra lại kết nối mạng!");
        return false;
    }
    return true;
}

async function checkSessionAndInit() {
    const sessionData = localStorage.getItem('kho_session');
    
    if (sessionData) {
        try {
            const session = JSON.parse(sessionData);
            window.appState.currentUsername = session.username;
            window.appState.userPermissions = JSON.parse(session.role || "[]");
            
            document.getElementById('menu-btn-login').style.display = 'none';
            document.getElementById('menu-btn-logout').style.display = 'block';
        } catch(e) {
            localStorage.removeItem('kho_session');
            await loadGuestMode();
        }
    } else {
        await loadGuestMode();
    }
    
    applyRoleUI();
    initApp();
}

async function loadGuestMode() {
    window.appState.currentUsername = 'Khách';
    document.getElementById('menu-btn-login').style.display = 'block';
    document.getElementById('menu-btn-logout').style.display = 'none';
    
    try {
        const { data } = await window.appState.supabaseClient
            .from('users')
            .select('*')
            .eq('username', 'guest')
            .maybeSingle();
            
        if (data) {
            window.appState.userPermissions = JSON.parse(data.role || "[]");
        } else {
            window.appState.userPermissions = [];
        }
    } catch(e) {
        window.appState.userPermissions = [];
    }
}

// =========================================================================
// CHỨC NĂNG: ĐĂNG NHẬP / ĐĂNG XUẤT
// =========================================================================
window.showLoginScreen = function() {
    closeAllDropdowns();
    document.getElementById('login-screen').style.display = 'flex';
};

window.hideLoginScreen = function() {
    document.getElementById('login-screen').style.display = 'none';
};

window.handleLogin = async function() {
    const user = document.getElementById('login-username').value.trim();
    const pass = document.getElementById('login-password').value;

    if (!user || !pass) return alert("Vui lòng nhập đầy đủ tài khoản và mật khẩu!");
    if (!checkDB()) return;

    try {
        const { data, error } = await window.appState.supabaseClient
            .from('users')
            .select('*')
            .eq('username', user)
            .maybeSingle();

        if (error) {
            alert("LỖI SUPABASE: " + error.message);
            return;
        }

        if (!data || data.password !== pass) {
            alert("Sai tên đăng nhập hoặc mật khẩu! Vui lòng kiểm tra lại.");
            return;
        }

        localStorage.setItem('kho_session', JSON.stringify({
            username: data.username,
            role: data.role
        }));

        window.location.reload(); 
    } catch (err) {
        alert("LỖI HỆ THỐNG: " + err.message);
    }
};

window.handleLogout = function() {
    localStorage.removeItem('kho_session');
    window.location.reload();
};

function applyRoleUI() {
    const perms = window.appState.userPermissions || [];
    const isSuper = perms.includes('superadmin');

    document.querySelectorAll('.permission-check, .admin-only').forEach(el => {
        const reqPerm = el.getAttribute('data-permission');
        let hasAccess = false;

        if (isSuper) {
            hasAccess = true;
        } else if (reqPerm) {
            hasAccess = perms.includes(reqPerm);
        } else if (el.classList.contains('admin-only')) {
            hasAccess = perms.includes('quan_tri'); 
        }

        if (hasAccess) {
            if (el.tagName.toLowerCase() === 'a' || el.tagName.toLowerCase() === 'div') {
                el.style.setProperty('display', 'block', 'important'); 
            } else if (el.tagName.toLowerCase() === 'td' || el.tagName.toLowerCase() === 'th') {
                el.style.setProperty('display', 'table-cell', 'important'); 
            } else {
                el.style.setProperty('display', 'inline-flex', 'important'); 
            }
        } else {
            el.style.setProperty('display', 'none', 'important');
        }
    });
}

function checkActionPermission(reqPerm) {
    const perms = window.appState.userPermissions || [];
    if (perms.includes('superadmin')) return true;
    if (perms.includes(reqPerm)) return true;
    
    if (window.appState.currentUsername === 'Khách') {
        alert("⛔ Bạn đang xem ở chế độ Khách. Vui lòng Đăng nhập để sử dụng chức năng này!");
    } else {
        alert("⛔ BẠN KHÔNG CÓ QUYỀN THỰC HIỆN CHỨC NĂNG NÀY!");
    }
    return false;
}

// =========================================================================
// CHỨC NĂNG: GIAO TIẾP DATABASE SUPABASE
// =========================================================================
async function db_fetchProducts() {
    if (!checkDB()) return [];
    const { data, error } = await window.appState.supabaseClient.from('products').select('*');
    if (error) { console.error("Lỗi tải SP:", error); return []; }
    return data || [];
}
async function db_saveProducts(products) {
    if (!checkDB()) return;
    const { error } = await window.appState.supabaseClient.from('products').upsert(products);
    if (error) console.error("Lỗi lưu SP:", error);
}
async function db_deleteProduct(id) {
    if (!checkDB()) return;
    const { error } = await window.appState.supabaseClient.from('products').delete().eq('id', id);
    if (error) console.error("Lỗi xóa SP:", error);
}
async function db_deleteProducts(ids) {
    if (!checkDB()) return;
    const { error } = await window.appState.supabaseClient.from('products').delete().in('id', ids);
    if (error) console.error("Lỗi xóa nhiều SP:", error);
}
async function db_fetchLogs() {
    if (!checkDB()) return [];
    const { data, error } = await window.appState.supabaseClient.from('logs').select('*');
    if (error) { console.error("Lỗi tải lịch sử:", error); return []; }
    return data.map(log => ({ 
        id: log.id, timestamp: log.timestamp, 
        productName: log.product_name, action: log.action, 
        amount: log.amount, newTotal: log.new_total 
    }));
}
async function db_addLog(productName, actionType, amount, newTotal) {
    if (!checkDB()) return;
    const newLog = { 
        id: Date.now(), timestamp: new Date().toISOString(), 
        product_name: productName, action: actionType, 
        amount: amount, new_total: newTotal 
    };
    const { error } = await window.appState.supabaseClient.from('logs').insert([newLog]);
    if (error) console.error("Lỗi lưu lịch sử:", error);
}
async function db_getCustomColumns() {
    if (!checkDB()) return [];
    const { data, error } = await window.appState.supabaseClient.from('custom_columns').select('*');
    if (error) { console.error("Lỗi tải thuộc tính:", error); return []; }
    return data.length > 0 ? data : [{ name: "Màu sắc", options: ["Đen", "Trắng"] }];
}
async function db_saveCustomColumns(cols) {
    if (!checkDB()) return;
    const { error } = await window.appState.supabaseClient.from('custom_columns').upsert(cols);
    if (error) console.error("Lỗi lưu thuộc tính:", error);
}
async function db_deleteCustomColumn(name) {
    if (!checkDB()) return;
    const { error } = await window.appState.supabaseClient.from('custom_columns').delete().eq('name', name);
    if (error) console.error("Lỗi xóa cột:", error);
}

// =========================================================================
// CHỨC NĂNG: XỬ LÝ REALTIME TỪ SUPABASE
// =========================================================================
window.debouncedRefreshData = function() {
    // Chống "bão" sự kiện: Chờ 500ms sau khi ngừng nhận tín hiệu mới tải lại UI
    if (window.appState.refreshTimeout) {
        clearTimeout(window.appState.refreshTimeout);
    }
    window.appState.refreshTimeout = setTimeout(async () => {
        console.log("🔄 Realtime: Có dữ liệu mới, đang tải lại giao diện...");
        await refreshData();
    }, 500);
};

function initRealtime() {
    if (!window.appState.supabaseClient) return;

    // Xóa kết nối cũ nếu có để tránh bị nhân đôi sự kiện
    if (window.appState.realtimeChannel) {
        window.appState.supabaseClient.removeChannel(window.appState.realtimeChannel);
    }

    // Đăng ký kênh lắng nghe
    window.appState.realtimeChannel = window.appState.supabaseClient.channel('warehouse-realtime')
        // Lắng nghe bảng Sản phẩm
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
            window.debouncedRefreshData();
        })
        // Lắng nghe bảng Lịch sử
        .on('postgres_changes', { event: '*', schema: 'public', table: 'logs' }, (payload) => {
            // Nếu người dùng đang mở Modal lịch sử thì render lại ngay
            if (document.getElementById('historyModal').classList.contains('show')) {
                setTimeout(() => window.renderHistory(), 500);
            }
        })
        // Lắng nghe bảng Thuộc tính
        .on('postgres_changes', { event: '*', schema: 'public', table: 'custom_columns' }, (payload) => {
            setTimeout(async () => {
                window.appState.customColumns = await db_getCustomColumns();
                window.debouncedRefreshData();
                // Nếu đang mở quản lý thuộc tính thì tải lại
                if (document.getElementById('attributeManagerModal').classList.contains('show')) {
                    renderAttributeMasterList();
                    renderAttributeDetailView();
                }
            }, 500);
        })
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log("🟢 Realtime channel đã kết nối thành công!");
            }
        });
}

// =========================================================================
// CHỨC NĂNG: RENDER VÀ KHỞI TẠO APP
// =========================================================================
async function initApp() {
    window.appState.customColumns = await db_getCustomColumns();
    document.getElementById('history-month-filter').value = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    await refreshData();
    
    // Kích hoạt Realtime sau khi đã tải xong dữ liệu ban đầu
    initRealtime();
}

async function refreshData() {
    window.appState.currentProducts = await db_fetchProducts();
    window.appState.selectedProductIds.clear(); 
    updateFloatingBar();
    window.renderTable(); 
    updateDashboardStats();
}

function updateDashboardStats() {
    document.getElementById('stat-total-items').innerText = window.appState.currentProducts.length;
    document.getElementById('stat-total-qty').innerText = window.appState.currentProducts.reduce((sum, item) => sum + (item.quantity || 0), 0).toLocaleString('vi-VN');
    document.getElementById('stat-low-stock').innerText = window.appState.currentProducts.filter(item => item.quantity < 10).length;
}

window.renderTable = function() {
    const tbody = document.getElementById('table-body');
    const searchQuery = document.getElementById('search-input').value.toLowerCase().trim();
    const canEditDelete = window.appState.userPermissions.includes('superadmin') || window.appState.userPermissions.includes('sua_xoa');

    let headerHtml = ``;
    if (canEditDelete) {
        headerHtml += `<th class="col-checkbox no-print"><input type="checkbox" id="selectAllCb" onchange="toggleSelectAll(this)"></th>`;
    }
    headerHtml += `<th>Sản phẩm</th><th style="width: 100px; text-align: center;">Số lượng</th>`;
    document.getElementById('table-header').innerHTML = headerHtml;

    document.getElementById('modal-filters-container').innerHTML = window.appState.customColumns.map(colObj => `<div class="form-group"><label>${colObj.name}</label><select id="modal-filter-${colObj.name}" class="modal-select"><option value="">-- Tất cả --</option>${colObj.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}</select></div>`).join('');
    
    const filteredProducts = window.appState.currentProducts.filter(p => {
        let matchSearch = false;
        if (p.name.toLowerCase().includes(searchQuery)) matchSearch = true;
        else if (p.attributes) { 
            for (const val of Object.values(p.attributes)) { 
                if (typeof val === 'string' && val.toLowerCase().includes(searchQuery)) { matchSearch = true; break; } 
            } 
        }
        if (!matchSearch) return false;
        
        let stockFilter = window.appState.appliedFilters.stock;
        if (stockFilter === 'in_stock' && p.quantity <= 0) return false;
        if (stockFilter === 'out_of_stock' && p.quantity > 0) return false;
        if (stockFilter === 'low_stock' && p.quantity >= 10) return false; 
        
        for (const [key, val] of Object.entries(window.appState.appliedFilters.attributes)) { 
            if (!p.attributes || p.attributes[key] !== val) return false; 
        }
        return true;
    });

    const filterTagsSection = document.querySelector('.toolbar-bottom');
    const hasAttrFilter = Object.keys(window.appState.appliedFilters.attributes).length > 0;
    if (searchQuery || window.appState.appliedFilters.stock !== 'all' || hasAttrFilter) {
        document.getElementById('btn-clear-filters').style.display = 'inline-block';
        filterTagsSection.style.display = (window.appState.appliedFilters.stock !== 'all' || hasAttrFilter) ? 'flex' : 'none';
    } else {
        document.getElementById('btn-clear-filters').style.display = 'none';
        filterTagsSection.style.display = 'none';
    }
    renderFilterTags();

    if (filteredProducts.length === 0) { 
        tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; padding: 20px;">Không có dữ liệu.</td></tr>`; 
        return; 
    }

    tbody.innerHTML = filteredProducts.map(product => {
        const isChecked = window.appState.selectedProductIds.has(product.id) ? 'checked' : '';
        let cols = "";
        
        if (canEditDelete) {
            cols += `<td class="col-checkbox no-print"><input type="checkbox" class="row-checkbox" data-id="${product.id}" onchange="toggleSelect(${product.id})" onclick="event.stopPropagation()" ${isChecked}></td>`;
        }
        
        let attrArray = [];
        if (product.attributes) {
            window.appState.customColumns.forEach(colObj => {
                const val = product.attributes[colObj.name];
                if (val && val.toString().trim() !== "") {
                    attrArray.push(val.toString().trim());
                }
            });
        }
        let attrString = attrArray.length > 0 ? ` - ${attrArray.join(' - ')}` : "";
        let fullProductName = product.name + attrString;
        
        cols += `<td><span class="product-name-combined">${product.name}</span><span class="product-attr-combined">${attrString}</span></td>`;
        
        const qtyStyle = product.quantity < 10 ? 'color: var(--danger); font-weight: bold;' : 'font-weight: 600;';
        cols += `<td style="text-align: center; ${qtyStyle}">${product.quantity}</td>`;
        
        return `<tr onclick="openActionSheet(${product.id}, '${fullProductName.replace(/'/g, "\\'")}', ${product.quantity})">${cols}</tr>`;
    }).join('');
};

// =========================================================================
// CHỨC NĂNG: ACTION SHEET
// =========================================================================
window.openActionSheet = function(id, name, qty) {
    closeAllDropdowns();
    document.getElementById('action-sheet-id').value = id;
    document.getElementById('action-sheet-title').innerText = name;
    document.getElementById('action-sheet-qty').innerText = "Tồn kho: " + qty;
    document.getElementById('action-sheet-overlay').classList.add('show');
};

window.closeActionSheet = function(event) {
    if (event) {
        if (event.target === document.getElementById('action-sheet-overlay')) {
            document.getElementById('action-sheet-overlay').classList.remove('show');
        }
    } else {
        document.getElementById('action-sheet-overlay').classList.remove('show');
    }
};

window.actionSheetImport = function() {
    if(!checkActionPermission('nhap_xuat')) return;
    const id = parseInt(document.getElementById('action-sheet-id').value);
    const name = document.getElementById('action-sheet-title').innerText;
    window.closeActionSheet(); 
    setTimeout(() => window.handleQuickImport(id, name), 200); 
};

window.actionSheetExport = function() {
    if(!checkActionPermission('nhap_xuat')) return;
    const id = parseInt(document.getElementById('action-sheet-id').value);
    const name = document.getElementById('action-sheet-title').innerText;
    window.closeActionSheet();
    setTimeout(() => window.handleQuickExport(id, name), 200);
};

window.actionSheetEdit = function() {
    if(!checkActionPermission('sua_xoa')) return;
    const id = parseInt(document.getElementById('action-sheet-id').value);
    window.closeActionSheet();
    window.openEditProductModal(id);
};

// =========================================================================
// CHỨC NĂNG: THÊM & SỬA SẢN PHẨM
// =========================================================================
window.openAddProductModal = function() { 
    if(!checkActionPermission('them_sp')) return;
    closeAllDropdowns();
    document.getElementById('add-p-name').value = ""; 
    document.getElementById('add-p-qty').value = "0"; 
    document.getElementById('add-attributes-container').innerHTML = window.appState.customColumns.map(col => `<div class="form-group"><label>${col.name}</label><select id="add-attr-${col.name}" class="modal-select"><option value="">-- Trống --</option>${col.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}</select></div>`).join('');
    window.openModal('addProductModal'); 
};

window.submitAddProduct = async function() {
    const name = document.getElementById('add-p-name').value.trim();
    const qty = parseInt(document.getElementById('add-p-qty').value) || 0;
    if (!name) return alert("Thiếu tên sản phẩm!");
    
    let attrs = {};
    window.appState.customColumns.forEach(col => { 
        const val = document.getElementById(`add-attr-${col.name}`).value; 
        if(val) attrs[col.name] = val; 
    });

    const newProd = { id: Date.now(), name: name, quantity: qty, attributes: attrs };
    await db_saveProducts([newProd]);
    if(qty > 0) await db_addLog(name, 'import', qty, qty); 
    window.closeModal('addProductModal'); 
    await refreshData();
};

window.openEditProductModal = function(id) {
    if(!checkActionPermission('sua_xoa')) return;
    const prod = window.appState.currentProducts.find(p => p.id === id); 
    if(!prod) return;
    
    document.getElementById('edit-p-id').value = prod.id;
    document.getElementById('edit-p-name').value = prod.name;

    document.getElementById('edit-attributes-container').innerHTML = window.appState.customColumns.map(col => {
        const currentVal = (prod.attributes && prod.attributes[col.name]) ? prod.attributes[col.name] : "";
        return `<div class="form-group"><label>${col.name}</label><select id="edit-attr-${col.name}" class="modal-select"><option value="">-- Trống --</option>${col.options.map(opt => `<option value="${opt}" ${currentVal===opt?'selected':''}>${opt}</option>`).join('')}</select></div>`
    }).join('');
    window.openModal('editProductModal');
    applyRoleUI();
};

window.submitEditProduct = async function() {
    const id = parseInt(document.getElementById('edit-p-id').value);
    const newName = document.getElementById('edit-p-name').value.trim();
    if (!newName) return alert("Tên không được trống!");
    
    let prod = window.appState.currentProducts.find(p => p.id === id);
    if(prod) {
        prod.name = newName;
        prod.attributes = {};
        window.appState.customColumns.forEach(col => { 
            const val = document.getElementById(`edit-attr-${col.name}`).value; 
            if(val) prod.attributes[col.name] = val; 
        });
        await db_saveProducts([prod]);
        window.closeModal('editProductModal'); 
        await refreshData();
    }
};

window.handleDeleteProductFromEdit = async function() {
    if(!checkActionPermission('sua_xoa')) return;
    const id = parseInt(document.getElementById('edit-p-id').value);
    if(confirm("Bạn có chắc muốn xóa mặt hàng này khỏi kho?")) {
        await db_deleteProduct(id);
        window.closeModal('editProductModal'); 
        await refreshData();
    }
};

window.handleQuickImport = async function(productId, productFullName) {
    const prod = window.appState.currentProducts.find(p => p.id === productId); 
    if (!prod) return;
    
    const action = prompt(`Sản phẩm: ${productFullName}\nTồn hiện tại: ${prod.quantity}\n\nNhập số lượng cần THÊM VÀO KHO:`); 
    if (!action) return;
    
    const amount = parseInt(action); 
    if (isNaN(amount) || amount <= 0) return alert("Số lượng nhập không hợp lệ! Vui lòng nhập số dương.");
    
    let newQty = prod.quantity + amount;
    prod.quantity = newQty; 
    await db_saveProducts([prod]);
    await db_addLog(productFullName, 'import', amount, newQty); 
    await refreshData();
};

window.handleQuickExport = async function(productId, productFullName) {
    const prod = window.appState.currentProducts.find(p => p.id === productId); 
    if (!prod) return;
    
    const action = prompt(`Sản phẩm: ${productFullName}\nTồn hiện tại: ${prod.quantity}\n\nNhập số lượng cần XUẤT KHỎI KHO:`); 
    if (!action) return;
    
    const amount = parseInt(action); 
    if (isNaN(amount) || amount <= 0) return alert("Số lượng xuất không hợp lệ! Vui lòng nhập số dương.");
    
    let newQty = prod.quantity - amount;
    if (newQty < 0) return alert(`Không đủ hàng để xuất! Hiện tại chỉ còn ${prod.quantity} sản phẩm.`);
    
    prod.quantity = newQty; 
    await db_saveProducts([prod]);
    await db_addLog(productFullName, 'export', amount, newQty); 
    await refreshData();
};

// =========================================================================
// CHỨC NĂNG: BATCH ACTIONS
// =========================================================================
window.toggleSelect = function(id) { 
    if (window.appState.selectedProductIds.has(id)) window.appState.selectedProductIds.delete(id); 
    else window.appState.selectedProductIds.add(id); 
    updateFloatingBar(); 
};

window.toggleSelectAll = function(checkbox) {
    document.querySelectorAll('.row-checkbox').forEach(cb => { 
        const id = parseInt(cb.dataset.id); 
        cb.checked = checkbox.checked; 
        if (checkbox.checked) window.appState.selectedProductIds.add(id); 
        else window.appState.selectedProductIds.delete(id); 
    });
    updateFloatingBar();
};

function updateFloatingBar() {
    const bar = document.getElementById('floating-batch-bar'); 
    if (!bar) return;
    document.getElementById('batch-count-text').innerText = `Đã chọn ${window.appState.selectedProductIds.size} SP`;
    
    const isSuper = window.appState.userPermissions.includes('superadmin');
    const canSuaXoa = window.appState.userPermissions.includes('sua_xoa');
    const canBaoCao = window.appState.userPermissions.includes('bao_cao');
    
    if (window.appState.selectedProductIds.size > 0 && (isSuper || canSuaXoa || canBaoCao)) bar.classList.add('active'); 
    else bar.classList.remove('active');
}

window.clearSelection = function() { 
    window.appState.selectedProductIds.clear(); 
    document.querySelectorAll('.row-checkbox, #selectAllCb').forEach(cb => cb.checked = false); 
    updateFloatingBar(); 
};

window.batchDelete = async function() { 
    if(!checkActionPermission('sua_xoa')) return;
    if(!confirm(`Bạn chắc chắn muốn xóa vĩnh viễn ${window.appState.selectedProductIds.size} sản phẩm đã chọn?`)) return; 
    await db_deleteProducts(Array.from(window.appState.selectedProductIds)); 
    window.clearSelection(); 
    await refreshData(); 
};

window.openBatchEditModal = function() {
    if(!checkActionPermission('sua_xoa')) return;
    if(window.appState.customColumns.length === 0) return alert("Hệ thống chưa có thuộc tính nào!");
    document.getElementById('batch-attr-select').innerHTML = window.appState.customColumns.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    window.renderBatchOptionSelect(); 
    window.openModal('batchEditModal');
};

window.renderBatchOptionSelect = function() { 
    const attrName = document.getElementById('batch-attr-select').value; 
    const col = window.appState.customColumns.find(c => c.name === attrName); 
    if(col) document.getElementById('batch-option-select').innerHTML = `<option value="">-- Trống --</option>` + col.options.map(opt => `<option value="${opt}">${opt}</option>`).join(''); 
};

window.applyBatchEdit = async function() {
    const attrName = document.getElementById('batch-attr-select').value;
    const newVal = document.getElementById('batch-option-select').value;
    const updatedProds = [];
    
    window.appState.currentProducts.forEach(p => { 
        if(window.appState.selectedProductIds.has(p.id)) { 
            if(!p.attributes) p.attributes = {}; 
            p.attributes[attrName] = newVal; 
            updatedProds.push(p); 
        } 
    });
    
    await db_saveProducts(updatedProds); 
    window.closeModal('batchEditModal'); 
    window.clearSelection(); 
    await refreshData();
};

// =========================================================================
// CHỨC NĂNG: QUẢN LÝ THUỘC TÍNH
// =========================================================================
window.openAttributeManagerModal = function() { 
    if(!checkActionPermission('thuoc_tinh')) return;
    closeAllDropdowns(); 
    window.appState.activeAttributeIndex = null; 
    renderAttributeMasterList(); 
    renderAttributeDetailView(); 
    window.openModal('attributeManagerModal'); 
};

window.closeAttributeManager = function() { 
    window.closeModal('attributeManagerModal'); 
    refreshData(); 
};

function renderAttributeMasterList() { 
    document.getElementById('attr-master-list').innerHTML = window.appState.customColumns.map((col, index) => `<li class="${index === window.appState.activeAttributeIndex ? 'active' : ''}" onclick="selectAttribute(${index})"><span>${col.name}</span></li>`).join(''); 
}

window.selectAttribute = function(index) { 
    window.appState.activeAttributeIndex = index; 
    renderAttributeMasterList(); 
    renderAttributeDetailView(); 
};

function renderAttributeDetailView() { 
    const emptyView = document.getElementById('attr-detail-empty');
    const detailView = document.getElementById('attr-detail-view'); 
    
    if (window.appState.activeAttributeIndex === null) { 
        emptyView.style.display = 'flex'; 
        detailView.style.display = 'none'; 
        return; 
    } 
    emptyView.style.display = 'none'; 
    detailView.style.display = 'flex'; 
    
    document.getElementById('current-attr-name-display').innerText = window.appState.customColumns[window.appState.activeAttributeIndex].name; 
    document.getElementById('new-option-input').value = ""; 
    document.getElementById('options-detail-list').innerHTML = window.appState.customColumns[window.appState.activeAttributeIndex].options.map((opt, optIdx) => `<li><span>${opt}</span><button class="btn-delete-option" onclick="removeOptionFromCurrentAttr(${optIdx})">✕</button></li>`).join(''); 
}

window.addNewAttribute = function() { 
    const newName = prompt("Tên cột dữ liệu mới (VD: Kích thước):"); 
    if (!newName) return; 
    const trimmed = newName.trim(); 
    if (window.appState.customColumns.find(c => c.name.toLowerCase() === trimmed.toLowerCase())) return alert("Tên cột này đã tồn tại!"); 
    
    const newCol = { name: trimmed, options: [] }; 
    window.appState.customColumns.push(newCol); 
    db_saveCustomColumns([newCol]); 
    window.appState.activeAttributeIndex = window.appState.customColumns.length - 1; 
    renderAttributeMasterList(); 
    renderAttributeDetailView(); 
};

window.renameCurrentAttribute = async function() { 
    closeAllDropdowns(); 
    if (window.appState.activeAttributeIndex === null) return; 
    
    const oldName = window.appState.customColumns[window.appState.activeAttributeIndex].name;
    const newName = prompt("Đổi tên cột thành:", oldName); 
    if (!newName) return; 
    
    const trimmed = newName.trim(); 
    if (trimmed === oldName || trimmed === "") return; 
    
    await db_deleteCustomColumn(oldName);
    window.appState.customColumns[window.appState.activeAttributeIndex].name = trimmed; 
    await db_saveCustomColumns([window.appState.customColumns[window.appState.activeAttributeIndex]]); 
    
    window.appState.currentProducts.forEach(prod => { 
        if (prod.attributes && prod.attributes[oldName] !== undefined) { 
            prod.attributes[trimmed] = prod.attributes[oldName]; 
            delete prod.attributes[oldName]; 
        } 
    }); 
    
    await db_saveProducts(window.appState.currentProducts); 
    renderAttributeMasterList(); 
    renderAttributeDetailView(); 
    await refreshData();
};

window.addOptionToCurrentAttr = function() { 
    if (window.appState.activeAttributeIndex === null) return; 
    
    const inputEl = document.getElementById('new-option-input');
    const val = inputEl.value.trim();
    const activeAttr = window.appState.customColumns[window.appState.activeAttributeIndex]; 
    
    if (val && !activeAttr.options.includes(val)) { 
        activeAttr.options.push(val); 
        db_saveCustomColumns([activeAttr]); 
        renderAttributeDetailView(); 
        inputEl.focus(); 
    } 
};

window.handleOptionKeyPress = function(e) { 
    if (e.key === 'Enter') window.addOptionToCurrentAttr(); 
};

window.removeOptionFromCurrentAttr = async function(optIndex) { 
    if (window.appState.activeAttributeIndex === null) return; 
    
    const activeAttr = window.appState.customColumns[window.appState.activeAttributeIndex];
    const remOpt = activeAttr.options[optIndex]; 
    
    window.appState.currentProducts.forEach(p => { 
        if (p.attributes && p.attributes[activeAttr.name] === remOpt) p.attributes[activeAttr.name] = ""; 
    }); 
    
    await db_saveProducts(window.appState.currentProducts); 
    activeAttr.options.splice(optIndex, 1); 
    await db_saveCustomColumns([activeAttr]); 
    renderAttributeDetailView(); 
};

window.deleteCurrentAttribute = async function() { 
    closeAllDropdowns(); 
    if (window.appState.activeAttributeIndex === null) return; 
    
    const activeAttr = window.appState.customColumns[window.appState.activeAttributeIndex]; 
    if (confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn cột dữ liệu "${activeAttr.name}" khỏi toàn bộ hệ thống?`)) { 
        await db_deleteCustomColumn(activeAttr.name); 
        
        window.appState.currentProducts.forEach(p => { 
            if (p.attributes && p.attributes[activeAttr.name] !== undefined) delete p.attributes[activeAttr.name]; 
        }); 
        
        await db_saveProducts(window.appState.currentProducts); 
        window.appState.customColumns.splice(window.appState.activeAttributeIndex, 1); 
        window.appState.activeAttributeIndex = null; 
        renderAttributeMasterList(); 
        renderAttributeDetailView(); 
    } 
};

// =========================================================================
// CHỨC NĂNG: TIỆN ÍCH UI, LỌC VÀ LỊCH SỬ THÔNG MINH
// =========================================================================
window.openModal = function(modalId) { closeAllDropdowns(); document.getElementById(modalId).classList.add('show'); };
window.closeModal = function(modalId) { document.getElementById(modalId).classList.remove('show'); };

function closeAllDropdowns() { 
    document.querySelectorAll('.dropdown-content').forEach(el => el.classList.remove('show')); 
}

window.toggleDropdown = function(event, id) { 
    event.stopPropagation(); 
    const el = document.getElementById(id); 
    const isOpen = el.classList.contains('show'); 
    closeAllDropdowns(); 
    if (!isOpen) el.classList.add('show'); 
};

window.onclick = function(e) { 
    if(!e.target.matches('.modal-select') && !e.target.closest('.dropdown-wrapper')) closeAllDropdowns(); 
};

window.resetFilterModal = function() { 
    document.getElementById('modal-filter-stock').value = 'all'; 
    window.appState.customColumns.forEach(col => { 
        const el = document.getElementById(`modal-filter-${col.name}`); 
        if (el) el.value = ""; 
    }); 
};

window.applyFilters = function() { 
    window.appState.appliedFilters.stock = document.getElementById('modal-filter-stock').value; 
    window.appState.appliedFilters.attributes = {}; 
    window.appState.customColumns.forEach(col => { 
        const el = document.getElementById(`modal-filter-${col.name}`); 
        if (el && el.value) window.appState.appliedFilters.attributes[col.name] = el.value; 
    }); 
    window.closeModal('filterModal'); 
    window.renderTable(); 
};

window.removeSpecificFilter = function(type, key) { 
    if (type === 'stock') window.appState.appliedFilters.stock = 'all'; 
    else delete window.appState.appliedFilters.attributes[key]; 
    window.renderTable(); 
};

window.clearAllFilters = function() { 
    document.getElementById('search-input').value = ""; 
    window.appState.appliedFilters = { stock: 'all', attributes: {} }; 
    window.renderTable(); 
};

function renderFilterTags() { 
    let html = ''; 
    if (window.appState.appliedFilters.stock !== 'all') { 
        let label = window.appState.appliedFilters.stock === 'in_stock' ? 'Còn hàng' : (window.appState.appliedFilters.stock === 'low_stock' ? 'Sắp hết' : 'Hết hàng'); 
        html += `<div class="filter-tag">Tồn: ${label} <button onclick="removeSpecificFilter('stock')">✕</button></div>`; 
    } 
    for (const [key, val] of Object.entries(window.appState.appliedFilters.attributes)) {
        html += `<div class="filter-tag">${key}: ${val} <button onclick="removeSpecificFilter('attribute', '${key}')">✕</button></div>`; 
    }
    document.getElementById('active-filter-tags').innerHTML = html; 
}

window.openHistoryModal = async function() { 
    if(!checkActionPermission('bao_cao')) return;
    closeAllDropdowns(); 
    await window.renderHistory(); 
    window.openModal('historyModal'); 
};

window.renderHistory = async function() { 
    const logs = await db_fetchLogs(); 
    const filterMonthStr = document.getElementById('history-month-filter').value; 
    
    let filteredLogs = filterMonthStr ? logs.filter(log => log.timestamp.startsWith(filterMonthStr)) : logs; 
    filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); 
    
    let totalIn = 0, totalOut = 0; 
    let groupedData = {}; 

    filteredLogs.forEach(log => { 
        if(log.action === 'import') totalIn += log.amount; 
        else totalOut += log.amount; 
        
        if (!groupedData[log.productName]) {
            groupedData[log.productName] = { totalIn: 0, totalOut: 0, details: [] };
        }
        
        if (log.action === 'import') groupedData[log.productName].totalIn += log.amount;
        else groupedData[log.productName].totalOut += log.amount;
        
        groupedData[log.productName].details.push(log);
    }); 
    
    document.getElementById('hist-total-in').innerText = totalIn.toLocaleString('vi-VN'); 
    document.getElementById('hist-total-out').innerText = totalOut.toLocaleString('vi-VN'); 
    
    const tbody = document.getElementById('history-table-body');
    
    if (Object.keys(groupedData).length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Chưa có lịch sử giao dịch.</td></tr>';
        return;
    }
    
    let html = '';
    let index = 0;
    
    for (const [productName, data] of Object.entries(groupedData)) {
        html += `
            <tr class="history-group-row" id="hist-group-${index}" onclick="toggleHistoryDetail(${index})">
                <td style="font-weight: 600; color: #1f2937;">
                    <span class="history-toggle-icon">▶</span> ${productName}
                </td>
                <td style="text-align: center; color: var(--success); font-weight: 600;">
                    ${data.totalIn > 0 ? '+' + data.totalIn.toLocaleString('vi-VN') : '-'}
                </td>
                <td style="text-align: center; color: var(--danger); font-weight: 600;">
                    ${data.totalOut > 0 ? '-' + data.totalOut.toLocaleString('vi-VN') : '-'}
                </td>
            </tr>
            <tr class="history-detail-row" id="hist-detail-${index}">
                <td colspan="3" class="history-detail-cell">
                    <table class="history-sub-table">
                        <thead>
                            <tr><th>Thời gian</th><th>Thao tác</th><th>Số lượng</th><th>Tồn mới</th></tr>
                        </thead>
                        <tbody>
                            ${data.details.map(log => `
                                <tr>
                                    <td style="color: var(--text-muted);">
                                        ${new Date(log.timestamp).toLocaleString('vi-VN', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'})}
                                    </td>
                                    <td class="${log.action === 'import' ? 'text-success' : 'text-danger'}">
                                        ${log.action === 'import' ? 'Nhập' : 'Xuất'}
                                    </td>
                                    <td class="${log.action === 'import' ? 'text-success' : 'text-danger'}">
                                        ${log.action === 'import' ? '+' : '-'}${log.amount}
                                    </td>
                                    <td style="font-weight: 500;">${log.newTotal}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </td>
            </tr>
        `;
        index++;
    }
    
    tbody.innerHTML = html;
};

window.toggleHistoryDetail = function(index) {
    const groupRow = document.getElementById(`hist-group-${index}`);
    const detailRow = document.getElementById(`hist-detail-${index}`);
    
    if (groupRow.classList.contains('open')) {
        groupRow.classList.remove('open');
        detailRow.classList.remove('open');
    } else {
        groupRow.classList.add('open');
        detailRow.classList.add('open');
    }
};

// =========================================================================
// CHỨC NĂNG: DỌN DẸP LỊCH SỬ (CHỈ DÀNH CHO ADMIN)
// =========================================================================
window.clearHistoryLog = async function() {
    if(!checkActionPermission('quan_tri')) return;
    
    const monthFilter = document.getElementById('history-month-filter').value;
    let confirmMsg = monthFilter 
        ? `⚠️ CẢNH BÁO: Bạn có chắc chắn muốn XÓA VĨNH VIỄN toàn bộ lịch sử giao dịch của tháng ${monthFilter}?`
        : `⚠️ CẢNH BÁO ĐỎ: Bạn đang chọn XÓA SẠCH SÀNH SANH toàn bộ lịch sử từ trước đến nay. Hành động này không thể hoàn tác!\n\nBạn có chắc chắn không?`;
        
    if(confirm(confirmMsg)) {
        if (monthFilter) {
            // Xóa theo tháng
            const { error } = await window.appState.supabaseClient.from('logs').delete().like('timestamp', `${monthFilter}%`);
            if (error) alert("Lỗi xóa: " + error.message);
            else {
                alert("Đã dọn dẹp lịch sử tháng " + monthFilter);
                window.renderHistory();
            }
        } else {
            // Xóa tất cả
            const { error } = await window.appState.supabaseClient.from('logs').delete().neq('id', 0); 
            if (error) alert("Lỗi xóa: " + error.message);
            else {
                alert("Đã dọn dẹp TOÀN BỘ lịch sử hệ thống!");
                window.renderHistory();
            }
        }
    }
};

// =========================================================================
// CHỨC NĂNG: EXCEL (CSV)
// =========================================================================
window.exportExcel = function() { 
    if(!checkActionPermission('bao_cao')) return;
    closeAllDropdowns(); 
    if(window.appState.currentProducts.length === 0) return alert("Không có dữ liệu để xuất!"); 
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; 
    let headers = ["ID", "Tên sản phẩm", "Số lượng"]; 
    window.appState.customColumns.forEach(c => headers.push(c.name)); 
    csvContent += headers.join(",") + "\n"; 
    
    window.appState.currentProducts.forEach(p => { 
        let row = [p.id, `"${p.name}"`, p.quantity]; 
        window.appState.customColumns.forEach(c => row.push(`"${p.attributes && p.attributes[c.name] ? p.attributes[c.name] : ''}"`)); 
        csvContent += row.join(",") + "\n"; 
    }); 
    
    const link = document.createElement("a"); 
    link.setAttribute("href", encodeURI(csvContent)); 
    link.setAttribute("download", `KhoHang_${new Date().toLocaleDateString('vi-VN')}.csv`); 
    document.body.appendChild(link); link.click(); document.body.removeChild(link); 
};

window.importExcel = async function(event) { 
    if(!checkActionPermission('bao_cao')) return;
    closeAllDropdowns(); 
    const file = event.target.files[0]; 
    if(!file) return; 
    
    const reader = new FileReader(); 
    reader.onload = async function(e) { 
        const rows = e.target.result.split("\n").filter(row => row.trim() !== ""); 
        if(rows.length <= 1) return alert("File trống hoặc sai định dạng!"); 
        
        const headers = rows[0].split(",").map(h => h.replace(/"/g, '').trim()); 
        let colsToAdd = []; 
        
        for(let i = 3; i < headers.length; i++) { 
            const hName = headers[i]; 
            if(!window.appState.customColumns.find(c => c.name === hName) && hName) { 
                const newCol = { name: hName, options: [] }; 
                window.appState.customColumns.push(newCol); 
                colsToAdd.push(newCol); 
            } 
        } 
        
        if(colsToAdd.length > 0) await db_saveCustomColumns(colsToAdd); 
        let newProds = []; 
        
        for(let i = 1; i < rows.length; i++) { 
            const cols = rows[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || rows[i].split(","); 
            if(cols.length >= 2) { 
                const name = cols[1].replace(/"/g, '').trim();
                const qty = parseInt(cols[2]) || 0; 
                let attrs = {}; 
                
                for(let j = 3; j < cols.length; j++) { 
                    const colName = headers[j];
                    const val = cols[j] ? cols[j].replace(/"/g, '').trim() : ""; 
                    
                    if(colName && val) { 
                        attrs[colName] = val; 
                        const colRef = window.appState.customColumns.find(c => c.name === colName); 
                        if(colRef && !colRef.options.includes(val)) { 
                            colRef.options.push(val); 
                            await db_saveCustomColumns([colRef]); 
                        } 
                    } 
                } 
                newProds.push({ id: Date.now() + i, name: name, quantity: qty, attributes: attrs }); 
            } 
        } 
        
        if (newProds.length > 0) { 
            await db_saveProducts(newProds); 
            alert(`Nhập thành công ${newProds.length} sản phẩm vào hệ thống!`); 
        } 
        document.getElementById('import-excel-input').value = ""; 
        await refreshData(); 
    }; 
    reader.readAsText(file); 
};

// =========================================================================
// CHỨC NĂNG: XUẤT BÁO CÁO PDF TỐI ƯU HÓA (ĐÃ SỬA LỖI)
// =========================================================================

// Khử nhiễu: Ép ẩn triệt để thanh tùy chọn màu đen và các thẻ Modal
function prepareForPrint() {
    const floatingBar = document.getElementById('floating-batch-bar');
    if (floatingBar) floatingBar.style.setProperty('display', 'none', 'important');
    
    document.querySelectorAll('.modal').forEach(m => m.style.setProperty('display', 'none', 'important'));
    closeAllDropdowns();
}

// Khôi phục lại trạng thái ban đầu sau khi máy in chạy xong
function restoreAfterPrint() {
    const floatingBar = document.getElementById('floating-batch-bar');
    if (floatingBar) floatingBar.style.removeProperty('display');
    
    document.querySelectorAll('.modal').forEach(m => m.style.removeProperty('display'));
    applyRoleUI();
    updateFloatingBar();
}

window.exportSelectedPDF = function() {
    if(!checkActionPermission('bao_cao')) return;
    
    document.querySelectorAll('#table-body tr').forEach(row => {
        const cb = row.querySelector('.row-checkbox');
        if (cb && !cb.checked) {
            row.classList.add('print-hide'); 
        }
    });
    
    prepareForPrint();
    
    // Trì hoãn 0.5s để thiết bị iOS render xong trước khi bật máy in
    setTimeout(() => {
        window.print();
        setTimeout(() => {
            document.querySelectorAll('.print-hide').forEach(row => row.classList.remove('print-hide'));
            restoreAfterPrint();
        }, 500);
    }, 500);
};

window.exportFullInventoryPDF = function() {
    if(!checkActionPermission('bao_cao')) return;
    window.clearAllFilters();
    prepareForPrint();
    
    setTimeout(() => {
        window.print();
        setTimeout(() => restoreAfterPrint(), 500);
    }, 500);
};

window.exportLowStockPDF = function() {
    if(!checkActionPermission('bao_cao')) return;
    
    document.getElementById('modal-filter-stock').value = 'low_stock';
    window.appState.appliedFilters.stock = 'low_stock';
    window.renderTable();
    
    prepareForPrint();
    
    setTimeout(() => {
        window.print();
        setTimeout(() => {
            window.clearAllFilters();
            restoreAfterPrint();
        }, 500);
    }, 500);
};

window.exportHistoryPDF = async function() {
    if(!checkActionPermission('bao_cao')) return;
    
    await window.renderHistory();
    document.querySelectorAll('.history-group-row').forEach(el => el.classList.add('open'));
    document.querySelectorAll('.history-detail-row').forEach(el => el.classList.add('open'));
    
    document.body.classList.add('printing-history');
    prepareForPrint();
    
    setTimeout(() => {
        window.print();
        setTimeout(() => {
            document.body.classList.remove('printing-history');
            restoreAfterPrint();
        }, 500);
    }, 800); 
};


// =========================================================================
// CHỨC NĂNG: QUẢN LÝ NHÂN SỰ
// =========================================================================
window.openUserManagerModal = async function() {
    if(!checkActionPermission('quan_tri')) return;
    closeAllDropdowns();
    await window.renderUserTable();
    window.openModal('userManagerModal');
};

const permissionLabels = {
    'nhap_xuat': 'Nhập/Xuất',
    'them_sp': 'Thêm SP',
    'sua_xoa': 'Sửa/Xóa',
    'thuoc_tinh': 'Thuộc tính',
    'bao_cao': 'Báo cáo',
    'quan_tri': 'Quản trị'
};

window.renderUserTable = async function() {
    if (!checkDB()) return;
    const { data, error } = await window.appState.supabaseClient.from('users').select('*');
    if (error) return console.error("Lỗi tải users:", error);

    const tbody = document.getElementById('user-table-body');
    tbody.innerHTML = data.map(u => {
        let perms = [];
        try { perms = JSON.parse(u.role || "[]"); } catch(e) {}
        
        let roleHtml = '';
        if(perms.includes('superadmin')) {
            roleHtml = '<span class="attr-text" style="background:#fee2e2; color:#dc2626;">Tối cao (Super Admin)</span>';
        } else {
            roleHtml = perms.map(p => `<span class="attr-text" style="font-size:11px; margin-right:4px; margin-bottom: 4px; display:inline-block;">${permissionLabels[p] || p}</span>`).join('');
            if(!roleHtml) roleHtml = '<span style="color:#9ca3af; font-size: 11px;">Không có quyền</span>';
        }

        const safeRoles = (u.role || "[]").replace(/'/g, "\\'").replace(/"/g, '&quot;');
        
        return `
            <tr onclick="openEditUserModal('${u.username}', '${u.password}', '${safeRoles}')">
                <td style="font-weight: 600; color: var(--primary);">${u.username}</td>
                <td style="color: var(--text-muted);">${u.password}</td>
                <td style="white-space: normal; padding-top: 10px; padding-bottom: 6px;">${roleHtml}</td>
            </tr>
        `;
    }).join('');
};

window.handleAddUser = async function() {
    const u = document.getElementById('new-username').value.trim();
    const p = document.getElementById('new-password').value.trim();

    if (!u || !p) return alert("Vui lòng nhập đủ tên tài khoản và mật khẩu!");
    if (u.toLowerCase() === 'ad') return alert("Không được phép tạo tài khoản trùng với Super Admin!");

    const checkboxes = document.querySelectorAll('.role-checkbox-input:checked');
    let selectedPerms = [];
    checkboxes.forEach(cb => selectedPerms.push(cb.value));

    const roleStr = JSON.stringify(selectedPerms);

    const { error } = await window.appState.supabaseClient.from('users').insert([{ username: u, password: p, role: roleStr }]);
    
    if (error) {
        if (error.code === '23505') alert("Tên tài khoản này đã tồn tại trong hệ thống!");
        else alert("Lỗi khi tạo tài khoản: " + error.message);
    } else {
        document.getElementById('new-username').value = '';
        document.getElementById('new-password').value = '';
        document.querySelectorAll('.role-checkbox-input').forEach(cb => cb.checked = (cb.value === 'nhap_xuat'));
        window.renderUserTable(); 
    }
};

window.openEditUserModal = function(username, password, rolesStr) {
    if (username === 'ad') {
        alert("⛔ Tài khoản Super Admin được bảo vệ tối cao, không thể chỉnh sửa từ giao diện này!");
        return;
    }

    document.getElementById('edit-u-username').value = username;
    document.getElementById('edit-u-password').value = password;
    
    let perms = [];
    try { 
        const decodedStr = rolesStr.replace(/&quot;/g, '"');
        perms = JSON.parse(decodedStr); 
    } catch(e) { perms = []; }
    
    document.querySelectorAll('.edit-role-checkbox').forEach(cb => {
        cb.checked = perms.includes(cb.value);
    });

    const btnDelete = document.getElementById('btn-delete-user');
    if (username === window.appState.currentUsername) {
        btnDelete.style.display = 'none'; 
    } else {
        btnDelete.style.display = 'inline-block';
    }

    window.openModal('editUserModal');
};

window.submitEditUser = async function() {
    const u = document.getElementById('edit-u-username').value;
    const p = document.getElementById('edit-u-password').value.trim();

    if (!p) return alert("Mật khẩu không được để trống!");

    const checkboxes = document.querySelectorAll('.edit-role-checkbox:checked');
    let selectedPerms = [];
    checkboxes.forEach(cb => selectedPerms.push(cb.value));
    const roleStr = JSON.stringify(selectedPerms);

    const { error } = await window.appState.supabaseClient
        .from('users')
        .update({ password: p, role: roleStr })
        .eq('username', u);
    
    if (error) {
        alert("Lỗi khi cập nhật tài khoản: " + error.message);
    } else {
        window.closeModal('editUserModal');
        window.renderUserTable();
        
        if (u === window.appState.currentUsername) {
            window.appState.userPermissions = selectedPerms;
            localStorage.setItem('kho_session', JSON.stringify({
                username: u,
                role: roleStr
            }));
            applyRoleUI();
        }
    }
};

window.handleDeleteUserFromEdit = async function() {
    const u = document.getElementById('edit-u-username').value;
    
    if (u === window.appState.currentUsername) {
        return alert("Bạn không thể tự xóa tài khoản đang đăng nhập!");
    }
    
    if (confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${u}"?`)) {
        await window.appState.supabaseClient.from('users').delete().eq('username', u);
        window.closeModal('editUserModal');
        window.renderUserTable();
    }
};
