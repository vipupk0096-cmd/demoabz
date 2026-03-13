// Function fetch HTML file và chèn vào DOM
async function loadComponent(id, url) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        document.getElementById(id).innerHTML = html;
    } catch (error) {
        console.error(`Lỗi tải component ${url}:`, error);
    }
}

// Chạy khi trang load xong
document.addEventListener('DOMContentLoaded', () => {
    // Determine path level based on current page
    const isRoot = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
    const basePath = isRoot ? './components/' : '../components/';
    
    loadComponent('header-placeholder', basePath + 'header.html');
    loadComponent('footer-placeholder', basePath + 'footer.html');
    
    // Cập nhật trạng thái xác thực sau khi load header
    setTimeout(() => {
        if (typeof AuthState !== 'undefined') {
            AuthState.update();
        }
    }, 100);
});
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if(hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            // Thêm/Xóa class 'active' để ẩn hiện menu
            navMenu.classList.toggle('active');
        });
    }
});
// main.js
document.addEventListener('click', function (e) {
    // Kiểm tra nếu click vào nút hamburger hoặc các vạch bên trong nó
    const hamburger = e.target.closest('#hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger) {
        console.log("Đã tìm thấy nút và Click thành công!");
        navMenu.classList.toggle('active');
    }
});
