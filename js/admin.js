// admin.js - Xử lý trang quản trị viên

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra trạng thái đăng nhập và quyền admin
    if (typeof AuthState !== 'undefined' && !AuthState.check()) {
        alert('Vui lòng đăng nhập để truy cập trang này!');
        window.location.href = 'dang-nhap.html';
        return;
    }
    
    // Kiểm tra quyền admin (mô phỏng - trong thực tế sẽ check từ server)
    const username = localStorage.getItem('username');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (!isAdmin || username !== 'admin01') {
        alert('Bạn không có quyền truy cập trang quản trị!');
        window.location.href = '../index.html';
        return;
    }
    // Xử lý chuyển tab admin
    const navLinks = document.querySelectorAll('.admin-nav a');
    const tabContents = document.querySelectorAll('.admin-tab');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            // Xóa active class
            navLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(t => t.classList.remove('active'));

            // Thêm active class cho tab được chọn
            this.classList.add('active');
            const targetId = this.getAttribute('href').substring(1);
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Xử lý form cài đặt hệ thống
    const systemSettings = document.getElementById('systemSettings');
    if (systemSettings) {
        systemSettings.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const data = Object.fromEntries(formData);

            console.log('Cập nhật cài đặt hệ thống:', data);
            alert('Cập nhật cài đặt hệ thống thành công!');
        });
    }

    // Xử lý nút trong bảng người dùng
    const userActionButtons = document.querySelectorAll('#users .btn');
    userActionButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.textContent.toLowerCase();
            const userName = this.closest('tr').querySelector('td:nth-child(2)').textContent;

            if (action === 'chỉnh sửa') {
                alert(`Chỉnh sửa người dùng: ${userName}`);
            } else if (action === 'khóa') {
                if (confirm(`Khóa tài khoản của ${userName}?`)) {
                    alert('Đã khóa tài khoản!');
                    this.textContent = 'Mở khóa';
                    this.classList.remove('btn-danger');
                    this.classList.add('btn-success');
                }
            } else if (action === 'kích hoạt') {
                alert(`Kích hoạt tài khoản của ${userName}!`);
                this.textContent = 'Khóa';
                this.classList.remove('btn-success');
                this.classList.add('btn-danger');
            }
        });
    });

    // Hàm tải danh sách bất động sản chờ duyệt
    function loadPendingProperties() {
        if (typeof window.dataManager === 'undefined') {
            console.error('DataManager không được tải');
            return;
        }

        const tbody = document.querySelector('#properties tbody');
        if (!tbody) return;

        const pendingProperties = window.dataManager.getPendingProperties();
        
        // Xóa dữ liệu mẫu
        tbody.innerHTML = '';

        if (pendingProperties.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Không có tin đăng chờ duyệt</td></tr>';
            return;
        }

        pendingProperties.forEach(property => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${property.id || 'N/A'}</td>
                <td>${property.title || 'Không có tiêu đề'}</td>
                <td>${property.postedBy || 'Ẩn danh'}</td>
                <td>${property.price || 'N/A'}</td>
                <td><span class="status pending">Chờ duyệt</span></td>
                <td>
                    <button class="btn btn-sm btn-success approve-btn" data-id="${property.id}">Duyệt</button>
                    <button class="btn btn-sm btn-danger reject-btn" data-id="${property.id}">Từ chối</button>
                    <button class="btn btn-sm btn-outline view-btn" data-id="${property.id}">Xem</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Gắn event listeners cho nút duyệt
        document.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const propertyId = this.getAttribute('data-id');
                const propertyTitle = this.closest('tr').querySelector('td:nth-child(2)').textContent;
                
                if (confirm(`Bạn chắc chắn muốn duyệt bài: "${propertyTitle}"?`)) {
                    window.dataManager.approveProperty(propertyId);
                    alert(`Đã duyệt bài: ${propertyTitle}`);
                    loadPendingProperties(); // Tải lại danh sách
                }
            });
        });

        // Gắn event listeners cho nút từ chối
        document.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const propertyId = this.getAttribute('data-id');
                const propertyTitle = this.closest('tr').querySelector('td:nth-child(2)').textContent;
                const reason = prompt(`Lý do từ chối bài "${propertyTitle}":`, '');
                
                if (reason !== null) {
                    window.dataManager.rejectProperty(propertyId, reason);
                    alert(`Đã từ chối bài: ${propertyTitle}`);
                    loadPendingProperties(); // Tải lại danh sách
                }
            });
        });

        // Gắn event listeners cho nút xem
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const propertyId = this.getAttribute('data-id');
                const property = window.dataManager.getPropertyById(propertyId);
                if (property) {
                    console.log('Chi tiết bất động sản:', property);
                    alert(`Tiêu đề: ${property.title}\nGiá: ${property.price}\nĐịa chỉ: ${property.location}\nMô tả: ${property.description}`);
                }
            });
        });
    }

    // Tải danh sách bất động sản khi trang load
    loadPendingProperties();

    // Cập nhật danh sách khi thay đổi tab
    const propertiesTab = document.getElementById('properties');
    if (propertiesTab) {
        const propertiesLink = document.querySelector('a[href="#properties"]');
        if (propertiesLink) {
            propertiesLink.addEventListener('click', function() {
                setTimeout(loadPendingProperties, 100);
            });
        }
    }

    // Xử lý tìm kiếm
    const searchInputs = document.querySelectorAll('.search-input');
    searchInputs.forEach(input => {
        input.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            const table = this.closest('.admin-tab').querySelector('table');
            if (table) {
                const rows = table.querySelectorAll('tbody tr');
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(query) ? '' : 'none';
                });
            }
        });
    });

    // Xử lý filter trạng thái
    const filterSelect = document.querySelector('.filter-select');
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            const status = this.value;
            const rows = document.querySelectorAll('#properties tbody tr');

            rows.forEach(row => {
                const rowStatus = row.querySelector('.status').textContent.toLowerCase();
                if (status === '' || rowStatus.includes(status)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    // Mô phỏng biểu đồ (thay bằng Chart.js thực tế)
    const chartCanvas = document.getElementById('monthlyChart');
    if (chartCanvas) {
        const ctx = chartCanvas.getContext('2d');
        ctx.fillStyle = '#007bff';
        ctx.fillRect(50, 150, 50, 50);
        ctx.fillRect(120, 120, 50, 80);
        ctx.fillRect(190, 100, 50, 100);
        ctx.fillRect(260, 80, 50, 120);
        ctx.fillRect(330, 60, 50, 140);

        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.fillText('Tháng 1', 60, 170);
        ctx.fillText('Tháng 2', 130, 170);
        ctx.fillText('Tháng 3', 200, 170);
        ctx.fillText('Tháng 4', 270, 170);
        ctx.fillText('Tháng 5', 340, 170);
    }
});