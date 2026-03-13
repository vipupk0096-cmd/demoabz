// account.js - Xử lý trang quản lý tài khoản

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra trạng thái đăng nhập
    if (typeof AuthState !== 'undefined' && !AuthState.check()) {
        alert('Vui lòng đăng nhập để truy cập trang này!');
        window.location.href = 'dang-nhap.html';
        return;
    }

    // Hiển thị thông tin user
    const username = localStorage.getItem('username');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    const userRoleDiv = document.getElementById('user-role');
    if (userRoleDiv) {
        userRoleDiv.innerHTML = `<span class="role-badge ${isAdmin ? 'admin' : 'user'}">${isAdmin ? 'Quản trị viên' : 'Người dùng'}</span>`;
    }

    // Cập nhật thông tin hiển thị
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    
    if (firstNameInput && lastNameInput) {
        if (isAdmin) {
            firstNameInput.value = 'Admin';
            lastNameInput.value = 'System';
            if (emailInput) emailInput.value = 'admin@abzgroup.com';
        } else {
            firstNameInput.value = 'Nguyễn';
            lastNameInput.value = 'Văn A';
            if (emailInput) emailInput.value = 'nguyenvana@example.com';
        }
    }
    // Xử lý chuyển tab
    const navLinks = document.querySelectorAll('.account-nav a');
    const tabContents = document.querySelectorAll('.tab-content');

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

    // Xử lý form cập nhật thông tin cá nhân
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const data = Object.fromEntries(formData);

            console.log('Cập nhật thông tin:', data);
            alert('Cập nhật thông tin thành công!');
        });
    }

    // Xử lý form cài đặt
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const data = Object.fromEntries(formData);

            console.log('Cập nhật cài đặt:', data);
            alert('Cập nhật cài đặt thành công!');
        });
    }

    // Xử lý nút đăng xuất
    const logoutLink = document.querySelector('a[href="#logout"]');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();

            if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                // Xóa session/tokens (mô phỏng)
                if (typeof AuthState !== 'undefined') {
                    AuthState.logout();
                }
                alert('Đã đăng xuất!');
                window.location.href = '../index.html';
            }
        });
    }

    // Xử lý nút chỉnh sửa/xóa bất động sản
    const editButtons = document.querySelectorAll('.btn-outline');
    const deleteButtons = document.querySelectorAll('.btn-danger');

    editButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            alert('Tính năng chỉnh sửa đang được phát triển!');
        });
    });

    deleteButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('Bạn có chắc chắn muốn xóa bất động sản này?')) {
                this.closest('.property-card').remove();
                alert('Đã xóa bất động sản!');
            }
        });
    });
});