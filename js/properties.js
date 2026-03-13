// properties.js - Xử lý trang danh sách bất động sản bán/thuê

document.addEventListener('DOMContentLoaded', function() {
    // Xác định loại trang (ban/thue) từ URL
    const currentPage = window.location.pathname;
    const isRentPage = currentPage.includes('nha-cho-thue');
    const listingType = isRentPage ? 'thue' : 'ban';

    loadProperties(listingType);

    // Xử lý filter
    const filterForm = document.querySelector('.filter-section form');
    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const filters = Object.fromEntries(formData);

            applyFilters(filters, listingType);
        });
    }
});

let currentPageNum = 1;
const propertiesPerPage = 12;
let currentFilters = {};

function loadProperties(listingType) {
    const container = document.getElementById('propertiesGrid');

    if (!container) return;

    // Lấy bất động sản theo loại (ban/thue)
    const allProperties = dataManager.getPropertiesByType(listingType);
    const paginatedProperties = allProperties.slice(0, propertiesPerPage);

    if (paginatedProperties.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Chưa có bất động sản nào được đăng tải.</p>';
        hidePagination();
        return;
    }

    // Render các property cards
    container.innerHTML = paginatedProperties.map(property => createPropertyCard(property)).join('');

    // Thêm event listeners cho các cards
    addPropertyCardListeners();

    // Hiển thị/ẩn pagination
    if (allProperties.length > propertiesPerPage) {
        showPagination(allProperties.length, listingType);
    } else {
        hidePagination();
    }

    // Cập nhật thống kê
    updateStats(allProperties.length);
}

function applyFilters(filters, listingType) {
    currentFilters = filters;
    currentPageNum = 1;

    // Chuyển đổi filters từ form sang format dataManager
    const searchFilters = {
        listingType: listingType,
        type: filters.type || '',
        location: filters.location || '',
        minPrice: filters.minPrice || '',
        maxPrice: filters.maxPrice || '',
        minArea: filters.minArea || '',
        maxArea: filters.maxArea || ''
    };

    const filteredProperties = dataManager.searchProperties(searchFilters);

    const container = document.getElementById('propertiesGrid');
    const noResults = document.getElementById('no-results');

    if (filteredProperties.length === 0) {
        container.innerHTML = '';
        noResults.style.display = 'block';
        hidePagination();
        return;
    }

    noResults.style.display = 'none';

    const paginatedProperties = filteredProperties.slice(0, propertiesPerPage);
    container.innerHTML = paginatedProperties.map(property => createPropertyCard(property)).join('');

    addPropertyCardListeners();

    // Hiển thị/ẩn pagination
    if (filteredProperties.length > propertiesPerPage) {
        showPagination(filteredProperties.length, listingType);
    } else {
        hidePagination();
    }
}

function createPropertyCard(property) {
    const imageUrl = property.images && property.images.length > 0
        ? property.images[0]
        : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&q=80';

    const priceDisplay = formatPrice(property.price, property.listingType);
    const typeLabel = getTypeLabel(property.type);

    return `
        <div class="property-card" data-id="${property.id}" data-title="${property.title}" data-location="${property.location}" data-type="${property.type}">
            <img src="${imageUrl}" alt="${property.title}" onerror="this.src='https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&q=80'">
            <div class="property-info">
                <div class="property-price">${priceDisplay}</div>
                <div class="property-title">${property.title}</div>
                <p class="property-desc">${property.bedrooms || 0} PN • ${property.bathrooms || 0} WC • ${property.area}m²</p>
                <p class="property-location">📍 ${property.location}</p>
                <div class="property-features">
                    <span class="feature">${typeLabel}</span>
                    <span class="feature">${property.listingType === 'ban' ? 'Bán' : 'Cho thuê'}</span>
                </div>
                <a href="chi-tiet.html?id=${property.id}" class="btn-detail">Xem chi tiết &rarr;</a>
            </div>
        </div>
    `;
}

function addPropertyCardListeners() {
    const propertyCards = document.querySelectorAll('.property-card');

    propertyCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Nếu click vào link chi tiết, không làm gì thêm
            if (e.target.classList.contains('btn-detail')) return;

            const propertyId = this.dataset.id;
            if (propertyId) {
                window.location.href = `chi-tiet.html?id=${propertyId}`;
            }
        });
    });

    // Animation cho property cards khi scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Áp dụng animation cho các property cards
    propertyCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });
}

function showPagination(totalItems, listingType) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(totalItems / propertiesPerPage);

    let paginationHtml = '';

    // Previous button
    if (currentPageNum > 1) {
        paginationHtml += `<a href="#" class="page-btn" data-page="${currentPageNum - 1}">&laquo; Trước</a>`;
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPageNum) {
            paginationHtml += `<a href="#" class="page-btn active" data-page="${i}">${i}</a>`;
        } else {
            paginationHtml += `<a href="#" class="page-btn" data-page="${i}">${i}</a>`;
        }
    }

    // Next button
    if (currentPageNum < totalPages) {
        paginationHtml += `<a href="#" class="page-btn" data-page="${currentPageNum + 1}">Tiếp &raquo;</a>`;
    }

    pagination.innerHTML = paginationHtml;
    pagination.style.display = 'block';

    // Add event listeners
    const pageButtons = pagination.querySelectorAll('.page-btn');
    pageButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const page = parseInt(this.dataset.page);
            if (page && page !== currentPageNum) {
                changePage(page, listingType);
            }
        });
    });
}

function hidePagination() {
    const pagination = document.getElementById('pagination');
    if (pagination) {
        pagination.style.display = 'none';
    }
}

function changePage(pageNum, listingType) {
    currentPageNum = pageNum;

    let properties;
    if (Object.keys(currentFilters).length > 0) {
        // Có filter đang áp dụng
        const searchFilters = {
            listingType: listingType,
            ...currentFilters
        };
        properties = dataManager.searchProperties(searchFilters);
    } else {
        // Không có filter
        properties = dataManager.getPropertiesByType(listingType);
    }

    const startIndex = (currentPageNum - 1) * propertiesPerPage;
    const endIndex = startIndex + propertiesPerPage;
    const paginatedProperties = properties.slice(startIndex, endIndex);

    const container = document.getElementById('propertiesGrid');
    container.innerHTML = paginatedProperties.map(property => createPropertyCard(property)).join('');

    addPropertyCardListeners();
    showPagination(properties.length, listingType);
}

function updateStats(totalCount) {
    // Cập nhật thống kê trên trang
    const statElements = document.querySelectorAll('.stat-item h3');
    if (statElements.length > 0 && statElements[0]) {
        statElements[0].textContent = totalCount.toLocaleString() + '+';
    }
}

function formatPrice(price, listingType) {
    if (!price) return 'Liên hệ';

    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return price;

    if (listingType === 'thue') {
        // Giá thuê thường tính theo tháng
        if (numPrice >= 1000000) { // Nếu là số lớn, giả sử là VND/tháng
            return (numPrice / 1000000).toFixed(0) + ' Triệu/tháng';
        } else {
            return numPrice.toLocaleString() + ' VND/tháng';
        }
    } else {
        // Giá bán
        if (numPrice >= 1000000000) { // Tỷ
            return (numPrice / 1000000000).toFixed(1) + ' Tỷ';
        } else if (numPrice >= 1000000) { // Triệu
            return (numPrice / 1000000).toFixed(0) + ' Triệu';
        } else {
            return numPrice.toLocaleString() + ' VND';
        }
    }
}

function getTypeLabel(type) {
    const typeLabels = {
        'canho': 'Căn hộ',
        'nhaph': 'Nhà phố',
        'bietthu': 'Biệt thự',
        'datnen': 'Đất nền',
        'nhao': 'Nhà ở',
        'vanphong': 'Văn phòng',
        'kho': 'Kho bãi'
    };
    return typeLabels[type] || type;
}