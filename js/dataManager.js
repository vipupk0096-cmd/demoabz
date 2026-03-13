// dataManager.js - Quản lý dữ liệu bất động sản

class DataManager {
    constructor() {
        this.properties = [];
        this.loadData();
    }

    // Tải dữ liệu từ localStorage
    loadData() {
        const data = localStorage.getItem('abz_properties');
        if (data) {
            try {
                this.properties = JSON.parse(data);
            } catch (e) {
                console.error('Lỗi tải dữ liệu:', e);
                this.properties = [];
            }
        }
    }

    // Lưu dữ liệu vào localStorage
    saveData() {
        try {
            localStorage.setItem('abz_properties', JSON.stringify(this.properties));
        } catch (e) {
            console.error('Lỗi lưu dữ liệu:', e);
        }
    }

    // Thêm bất động sản mới
    addProperty(property) {
        const newProperty = {
            id: Date.now().toString(),
            ...property,
            createdAt: new Date().toISOString(),
            status: 'pending', // Chờ admin phê duyệt
            views: 0,
            featured: false
        };

        this.properties.unshift(newProperty); // Thêm vào đầu danh sách
        this.saveData();
        return newProperty;
    }

    // Cập nhật bất động sản
    updateProperty(id, updates) {
        const index = this.properties.findIndex(p => p.id === id);
        if (index !== -1) {
            this.properties[index] = { ...this.properties[index], ...updates };
            this.saveData();
            return this.properties[index];
        }
        return null;
    }

    // Xóa bất động sản
    deleteProperty(id) {
        const index = this.properties.findIndex(p => p.id === id);
        if (index !== -1) {
            this.properties.splice(index, 1);
            this.saveData();
            return true;
        }
        return false;
    }

    // Lấy tất cả bất động sản
    getAllProperties() {
        return this.properties;
    }

    // Lấy bất động sản theo ID
    getPropertyById(id) {
        return this.properties.find(p => p.id === id);
    }

    // Lấy bất động sản nổi bật
    getFeaturedProperties(limit = 6) {
        // Trả về các bất động sản mới nhất (thay vì chỉ lấy featured)
        return this.properties
            .filter(p => p.status === 'approved')
            .slice(0, limit);
    }

    // Lấy bất động sản theo loại
    getPropertiesByType(type, limit = null) {
        let filtered = this.properties.filter(p => p.status === 'approved');

        if (type === 'ban') {
            filtered = filtered.filter(p => p.listingType === 'ban');
        } else if (type === 'thue') {
            filtered = filtered.filter(p => p.listingType === 'thue');
        }

        return limit ? filtered.slice(0, limit) : filtered;
    }

    // Tăng lượt xem
    incrementViews(id) {
        const property = this.getPropertyById(id);
        if (property) {
            property.views++;
            this.saveData();
        }
    }

    // Lấy thống kê
    getStats() {
        const approved = this.properties.filter(p => p.status === 'approved');
        const featured = approved.filter(p => p.featured);
        const totalViews = approved.reduce((sum, p) => sum + (p.views || 0), 0);

        return {
            total: approved.length,
            featured: featured.length,
            views: totalViews,
            pending: this.properties.filter(p => p.status === 'pending').length
        };
    }

    // Admin: Duyệt tin
    approveProperty(id) {
        return this.updateProperty(id, { status: 'approved', approvedAt: new Date().toISOString() });
    }

    // Admin: Từ chối tin
    rejectProperty(id, reason = '') {
        return this.updateProperty(id, { status: 'rejected', rejectedAt: new Date().toISOString(), rejectionReason: reason });
    }

    // Lấy bất động sản theo status
    getPropertiesByStatus(status) {
        return this.properties.filter(p => p.status === status);
    }

    // Lấy tất cả bất động sản chưa duyệt
    getPendingProperties() {
        return this.getPropertiesByStatus('pending');
    }

    // Admin: Đánh dấu nổi bật
    toggleFeatured(id) {
        const property = this.getPropertyById(id);
        if (property) {
            return this.updateProperty(id, { featured: !property.featured });
        }
        return null;
    }

    // Tìm kiếm
    searchProperties(filtersOrQuery, deprecatedFilters) {
        // Hỗ trợ cả cách gọi cũ lẫn mới
        let query = '';
        let filters = {};

        if (typeof filtersOrQuery === 'string') {
            // Cách gọi cũ: searchProperties(query, filters)
            query = filtersOrQuery;
            filters = deprecatedFilters || {};
        } else if (typeof filtersOrQuery === 'object') {
            // Cách gọi mới: searchProperties({type, location, minPrice, ...})
            filters = filtersOrQuery || {};
            query = filters.query || '';
        }

        let results = this.properties.filter(p => p.status === 'approved');

        // Tìm kiếm theo từ khóa
        if (query) {
            const searchTerm = query.toLowerCase();
            results = results.filter(p =>
                p.title.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm) ||
                p.location.toLowerCase().includes(searchTerm) ||
                p.type.toLowerCase().includes(searchTerm)
            );
        }

        // Áp dụng filters
        if (filters.type) {
            results = results.filter(p => p.type === filters.type);
        }
        if (filters.listingType) {
            results = results.filter(p => p.listingType === filters.listingType);
        }
        if (filters.location) {
            results = results.filter(p => p.location.toLowerCase().includes(filters.location.toLowerCase()));
        }
        if (filters.minPrice) {
            results = results.filter(p => this.parsePrice(p.price) >= filters.minPrice);
        }
        if (filters.maxPrice) {
            results = results.filter(p => this.parsePrice(p.price) <= filters.maxPrice);
        }

        return results;
    }

    // Parse giá từ string sang number
    parsePrice(priceStr) {
        if (typeof priceStr === 'number') return priceStr;

        const match = priceStr.toString().match(/(\d+(?:\.\d+)?)/);
        if (match) {
            const num = parseFloat(match[1]);
            if (priceStr.includes('Triệu')) return num * 1000000;
            if (priceStr.includes('Tỷ')) return num * 1000000000;
            return num;
        }
        return 0;
    }

    // Xuất dữ liệu (cho admin)
    exportData() {
        return {
            properties: this.properties,
            stats: this.getStats(),
            exportedAt: new Date().toISOString()
        };
    }

    // Import dữ liệu (cho admin)
    importData(data) {
        if (data.properties && Array.isArray(data.properties)) {
            this.properties = data.properties;
            this.saveData();
            return true;
        }
        return false;
    }
}

// Tạo instance global
window.dataManager = new DataManager();