// property-detail.js - Xử lý trang chi tiết bất động sản

document.addEventListener('DOMContentLoaded', function() {
    // Lấy ID từ URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('id');

    if (propertyId) {
        loadPropertyDetail(propertyId);
    } else {
        showPropertyNotFound();
    }
});

function loadPropertyDetail(propertyId) {
    const property = dataManager.getPropertyById(propertyId);

    if (!property) {
        showPropertyNotFound();
        return;
    }

    const container = document.getElementById('propertyDetail');
    container.innerHTML = createPropertyDetailHTML(property);

    // Thêm event listeners
    addPropertyDetailListeners(property);
}

function createPropertyDetailHTML(property) {
    const imageUrl = property.images && property.images.length > 0
        ? property.images[0]
        : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80';

    const priceDisplay = formatPrice(property.price, property.listingType);
    const typeLabel = getTypeLabel(property.type);
    const listingTypeLabel = property.listingType === 'ban' ? 'Bán' : 'Cho thuê';

    // Tạo gallery hình ảnh
    const imageGallery = createImageGallery(property.images || []);

    return `
        <div class="property-detail-header">
            <h1>${property.title}</h1>
            <div class="property-meta">
                <span class="property-type">${typeLabel}</span>
                <span class="listing-type">${listingTypeLabel}</span>
                <span class="property-price-large">${priceDisplay}</span>
            </div>
        </div>

        <div class="property-detail-content">
            <div class="property-gallery">
                ${imageGallery}
            </div>

            <div class="property-info-detailed">
                <div class="property-specs">
                    <h3>Thông tin chi tiết</h3>
                    <div class="specs-grid">
                        <div class="spec-item">
                            <span class="spec-label">Diện tích:</span>
                            <span class="spec-value">${property.area} m²</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Phòng ngủ:</span>
                            <span class="spec-value">${property.bedrooms || 0}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Phòng tắm:</span>
                            <span class="spec-value">${property.bathrooms || 0}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Địa chỉ:</span>
                            <span class="spec-value">${property.address}</span>
                        </div>
                    </div>
                </div>

                <div class="property-description">
                    <h3>Mô tả</h3>
                    <p>${property.description}</p>
                </div>

                <div class="property-contact">
                    <h3>Thông tin liên hệ</h3>
                    <div class="contact-info">
                        <p><strong>Người đăng:</strong> ${property.contactInfo?.name || 'Chưa cập nhật'}</p>
                        <p><strong>Điện thoại:</strong> ${property.contactInfo?.phone || 'Chưa cập nhật'}</p>
                        <p><strong>Email:</strong> ${property.contactInfo?.email || 'Chưa cập nhật'}</p>
                    </div>
                    <div class="contact-actions">
                        <button class="btn btn-primary" onclick="contactSeller('${property.contactInfo?.phone || ''}')">
                            📞 Liên hệ ngay
                        </button>
                        <button class="btn btn-secondary" onclick="saveProperty('${property.id}')">
                            ❤️ Lưu tin
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="property-actions">
            <button class="btn btn-outline" onclick="window.history.back()">← Quay lại</button>
            <button class="btn btn-primary" onclick="shareProperty('${property.id}', '${property.title}')">
                📤 Chia sẻ
            </button>
        </div>
    `;
}

function createImageGallery(images) {
    if (images.length === 0) {
        return `<div class="main-image">
            <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80" alt="No image available">
        </div>`;
    }

    const mainImage = images[0];
    const thumbnails = images.slice(1, 5); // Hiển thị tối đa 4 thumbnail

    let galleryHTML = `
        <div class="main-image">
            <img src="${mainImage}" alt="Main property image" id="mainImage">
        </div>
    `;

    if (thumbnails.length > 0) {
        galleryHTML += `
            <div class="thumbnail-gallery">
                ${thumbnails.map((img, index) => `
                    <img src="${img}" alt="Thumbnail ${index + 1}" onclick="changeMainImage('${img}')" class="thumbnail">
                `).join('')}
            </div>
        `;
    }

    return galleryHTML;
}

function addPropertyDetailListeners(property) {
    // Thêm các event listeners nếu cần
    // Ví dụ: zoom hình ảnh, slider, etc.
}

function showPropertyNotFound() {
    document.getElementById('propertyDetail').style.display = 'none';
    document.getElementById('propertyNotFound').style.display = 'block';
}

function changeMainImage(imageSrc) {
    const mainImage = document.getElementById('mainImage');
    if (mainImage) {
        mainImage.src = imageSrc;
    }
}

function contactSeller(phone) {
    if (phone && phone !== 'Chưa cập nhật') {
        window.location.href = `tel:${phone}`;
    } else {
        alert('Thông tin liên hệ chưa được cập nhật. Vui lòng liên hệ admin để biết thêm chi tiết.');
    }
}

function saveProperty(propertyId) {
    // Lưu vào danh sách yêu thích (có thể implement sau)
    alert('Tính năng lưu tin đang được phát triển!');
}

function shareProperty(propertyId, title) {
    const url = window.location.href;
    const text = `Xem bất động sản: ${title} - ${url}`;

    if (navigator.share) {
        navigator.share({
            title: title,
            text: text,
            url: url
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(text).then(() => {
            alert('Đã sao chép liên kết vào clipboard!');
        });
    }
}

function formatPrice(price, listingType) {
    if (!price) return 'Liên hệ';

    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return price;

    if (listingType === 'thue') {
        if (numPrice >= 1000000) {
            return (numPrice / 1000000).toFixed(0) + ' Triệu/tháng';
        } else {
            return numPrice.toLocaleString() + ' VND/tháng';
        }
    } else {
        if (numPrice >= 1000000000) {
            return (numPrice / 1000000000).toFixed(1) + ' Tỷ';
        } else if (numPrice >= 1000000) {
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