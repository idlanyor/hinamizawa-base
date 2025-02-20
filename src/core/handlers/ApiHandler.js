export class ApiHandler {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.axios = require('axios');
        this.axios.create({
            baseURL: this.baseURL
        });
    }

    async get(endpoint, params = {}) {
        try {
            const response = await this.axios.get(endpoint, { params });
            return response.data;
        } catch (error) {
            console.error('Error pada saat mengambil data:', error);
            throw error;
        }
    }

    async post(endpoint, data = {}) {
        try {
            const response = await this.axios.post(endpoint, data);
            return response.data;
        } catch (error) {
            console.error('Error pada saat mengirim data:', error);
            throw error;
        }
    }

    async put(endpoint, data = {}) {
        try {
            const response = await this.axios.put(endpoint, data);
            return response.data;
        } catch (error) {
            console.error('Error pada saat mengubah data:', error);
            throw error;
        }
    }

    async delete(endpoint) {
        try {
            const response = await this.axios.delete(endpoint);
            return response.data;
        } catch (error) {
            console.error('Error pada saat menghapus data:', error);
            throw error;
        }
    }
}