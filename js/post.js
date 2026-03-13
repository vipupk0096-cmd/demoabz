// post.js - Xử lý trang đăng tin bất động sản

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra trạng thái đăng nhập
    if (typeof AuthState !== 'undefined' && !AuthState.check()) {
        alert('Vui lòng đăng nhập để đăng tin!');
        window.location.href = 'dang-nhap.html';
        return;
    }

    const postForm = document.getElementById('postForm');
    const imageInput = document.getElementById('images');
    let selectedImages = [];

    // Xử lý upload hình ảnh
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            selectedImages = Array.from(e.target.files);

            if (selectedImages.length > 10) {
                alert('Chỉ được chọn tối đa 10 ảnh!');
                this.value = '';
                selectedImages = [];
                return;
            }

            // Hiển thị số lượng ảnh đã chọn
            updateImageCount(selectedImages.length);
        });
    }

    function updateImageCount(count) {
        const existingCount = document.querySelector('.image-count');
        if (existingCount) {
            existingCount.remove();
        }

        if (count > 0) {
            const countDisplay = document.createElement('small');
            countDisplay.className = 'image-count';
            countDisplay.textContent = `Đã chọn ${count} ảnh`;
            countDisplay.style.color = '#6c757d';
            countDisplay.style.marginTop = '5px';
            countDisplay.style.display = 'block';

            imageInput.parentNode.appendChild(countDisplay);
        }
    }

    if (postForm) {
        postForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Thu thập dữ liệu form
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);

            // Validation
            const requiredFields = ['title', 'category', 'type', 'price', 'area', 'address', 'description'];
            const fieldLabels = {
                title: 'tiêu đề',
                category: 'loại bất động sản',
                type: 'loại tin',
                price: 'giá',
                area: 'diện tích',
                address: 'địa chỉ',
                description: 'mô tả'
            };

            for (const field of requiredFields) {
                if (!data[field] || data[field].trim() === '') {
                    alert(`Vui lòng nhập ${fieldLabels[field]}!`);
                    return;
                }
            }

            if (!data.terms) {
                alert('Vui lòng đồng ý với điều khoản sử dụng!');
                return;
            }

            // Xử lý hình ảnh - Convert sang Base64 để lưu
            let imageUrls = [];
            
            if (selectedImages.length > 0) {
                // Sử dụng Promise.all để xử lý tất cả file ảnh
                const imagePromises = selectedImages.map((file, index) => {
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            // Lưu Base64 data
                            const base64 = e.target.result;
                            const filename = `${Date.now()}_${index}_${file.name}`;
                            imageUrls.push({
                                filename: filename,
                                data: base64,
                                originalName: file.name
                            });
                            resolve();
                        };
                        reader.readAsDataURL(file);
                    });
                });

                // Chỉ thực hiện khi tất cả ảnh đã được load
                Promise.all(imagePromises).then(() => {
                    savePropertyData(data, imageUrls);
                });
                return; // Thoát để tránh submit ngay
            } else {
                // Không có ảnh, cứ lưu
                savePropertyData(data, []);
            }
        });
    }

    function savePropertyData(data, imageUrls) {
        // Tạo object bất động sản
        const propertyData = {
            title: data.title,
            type: data.category,
            listingType: data.type, // 'ban' hoặc 'thue'
            price: parseFloat(data.price) || 0,
            area: parseFloat(data.area) || 0,
            bedrooms: parseInt(data.bedrooms) || 0,
            bathrooms: parseInt(data.bathrooms) || 0,
            address: data.address,
            location: extractLocation(data.address),
            description: data.description,
            images: imageUrls,
            contactInfo: {
                name: localStorage.getItem('username') || 'Người dùng',
                phone: 'Chưa cập nhật',
                email: 'Chưa cập nhật'
            }
        };

        // Lưu vào dataManager
        if (typeof dataManager !== 'undefined') {
            const newProperty = dataManager.addProperty(propertyData);

            alert(`Đăng tin thành công! Mã tin: ${newProperty.id}\nTin của bạn đang chờ phê duyệt. Admin sẽ duyệt trong 24 giờ!`);

            // Reset form
            document.getElementById('postForm').reset();
            selectedImages = [];
            updateImageCount(0);

            // Chuyển về trang chủ
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 2000);
        } else {
            alert('Lỗi hệ thống! Vui lòng thử lại sau.');
        }
    }

    // Hàm trích xuất địa điểm từ địa chỉ
    function extractLocation(address) {
        // Mô phỏng trích xuất địa điểm từ địa chỉ
        const parts = address.split(',');
        if (parts.length >= 2) {
            return parts[parts.length - 1].trim() + ', ' + parts[parts.length - 2].trim();
        }
        return address;
    }
});