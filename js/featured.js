// featured.js - Xử lý hiển thị bất động sản nổi bật

document.addEventListener('DOMContentLoaded', function() {
    loadFeaturedProperties();

    // Xử lý filter
    const filterForm = document.querySelector('.filter-section form');
    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const filters = Object.fromEntries(formData);

            applyFilters(filters);
        });
    }

    // Xử lý nút "Xem thêm"
    const loadMoreBtn = document.querySelector('.load-more .btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            loadMoreProperties();
        });
    }
});

let currentPage = 1;
const propertiesPerPage = 8;
let currentFilters = {};

function loadFeaturedProperties() {
    const container = document.querySelector('.grid-properties');

    if (!container) return;

    // Lấy bất động sản nổi bật từ dataManager
    const allProperties = dataManager.properties.filter(p => p.status === 'approved');
    const featuredProperties = allProperties.slice(0, propertiesPerPage);

    if (featuredProperties.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Chưa có bất động sản nào được đăng tải.</p>';
        hideLoadMoreButton();
        return;
    }

    // Render các property cards
    container.innerHTML = featuredProperties.map(property => createPropertyCard(property)).join('');

    // Thêm event listeners cho các cards
    addPropertyCardListeners();

    // Hiển thị/ẩn nút "Xem thêm"
    if (allProperties.length > propertiesPerPage) {
        showLoadMoreButton();
    } else {
        hideLoadMoreButton();
    }
}

function loadMoreProperties() {
    const loadMoreBtn = document.querySelector('.load-more .btn');
    if (!loadMoreBtn) return;

    loadMoreBtn.textContent = 'Đang tải...';
    loadMoreBtn.disabled = true;

    setTimeout(() => {
        currentPage++;

        const allProperties = dataManager.properties.filter(p => p.status === 'approved');
        const startIndex = (currentPage - 1) * propertiesPerPage;
        const endIndex = currentPage * propertiesPerPage;
        const newProperties = allProperties.slice(startIndex, endIndex);

        if (newProperties.length > 0) {
            const container = document.querySelector('.grid-properties');
            const newCardsHtml = newProperties.map(property => createPropertyCard(property)).join('');
            container.insertAdjacentHTML('beforeend', newCardsHtml);

            // Thêm event listeners cho cards mới
            addPropertyCardListeners();

            loadMoreBtn.textContent = 'Xem thêm bất động sản nổi bật';
            loadMoreBtn.disabled = false;

            // Ẩn nút nếu đã load hết
            if (endIndex >= allProperties.length) {
                hideLoadMoreButton();
            }
        } else {
            hideLoadMoreButton();
        }
    }, 1000);
}

function applyFilters(filters) {
    currentFilters = filters;
    currentPage = 1;

    const filteredProperties = dataManager.searchProperties({
        type: filters.type || '',
        location: filters.location || '',
        minPrice: filters.minPrice || '',
        maxPrice: filters.maxPrice || '',
        minArea: filters.minArea || '',
        maxArea: filters.maxArea || ''
    });

    const container = document.querySelector('.grid-properties');

    if (filteredProperties.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Không tìm thấy bất động sản nào phù hợp với bộ lọc.</p>';
        hideLoadMoreButton();
        return;
    }

    const displayProperties = filteredProperties.slice(0, propertiesPerPage);
    container.innerHTML = displayProperties.map(property => createPropertyCard(property)).join('');

    addPropertyCardListeners();

    // Hiển thị/ẩn nút "Xem thêm"
    if (filteredProperties.length > propertiesPerPage) {
        showLoadMoreButton();
    } else {
        hideLoadMoreButton();
    }
}

function createPropertyCard(property) {
    const imageUrl = property.images && property.images.length > 0
        ? property.images[0]
        : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&q=80';

    const priceDisplay = formatPrice(property.price, property.listingType);
    const typeLabel = getTypeLabel(property.type);
    const listingTypeLabel = property.listingType === 'ban' ? 'Bán' : 'Cho thuê';

    return `
        <div class="property-card featured" data-id="${property.id}" data-title="${property.title}" data-location="${property.location}" data-type="${property.type}">
            <div class="featured-badge">Nổi bật</div>
            <img src="${imageUrl}" alt="${property.title}" onerror="this.src='https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&q=80'">
            <div class="property-info">
                <div class="property-price">${priceDisplay}</div>
                <div class="property-title">${property.title}</div>
                <p class="property-desc">${property.bedrooms || 0} PN • ${property.bathrooms || 0} WC • ${property.area}m²</p>
                <p class="property-location">📍 ${property.location}</p>
                <div class="property-features">
                    <span class="feature">${typeLabel}</span>
                    <span class="feature">${listingTypeLabel}</span>
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

function showLoadMoreButton() {
    const loadMoreSection = document.querySelector('.load-more');
    if (loadMoreSection) {
        loadMoreSection.style.display = 'block';
    }
}

function hideLoadMoreButton() {
    const loadMoreSection = document.querySelector('.load-more');
    if (loadMoreSection) {
        loadMoreSection.style.display = 'none';
    }
}

// Animation cho featured badges
const badges = document.querySelectorAll('.featured-badge');
badges.forEach((badge, index) => {
    badge.style.animationDelay = `${index * 0.2}s`;
});

// Thêm animation CSS cho badges
const style = document.createElement('style');
style.textContent = `
    .featured-badge {
        animation: badgePulse 2s infinite;
    }

    @keyframes badgePulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
document.head.appendChild(style);