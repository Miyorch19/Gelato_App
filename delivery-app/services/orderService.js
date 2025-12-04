import api from './api';

export const orderService = {
    // Get all orders (with optional filters)
    getAll: async (filters = {}) => {
        try {
            // Convert filters object to query string
            const params = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key] !== undefined && filters[key] !== null) {
                    params.append(key, filters[key]);
                }
            });

            const response = await api.get(`/orders?${params.toString()}`);
            return response.data;
        } catch (error) {
            // console.error('Error in orderService.getAll:', error);
            throw error;
        }
    },

    // Update order status
    updateStatus: async (id, statusData) => {
        const response = await api.post(`/orders/${id}/update-status`, statusData);
        return response.data;
    },

    // Get delivery statuses (for the dropdown/modal)
    getDeliveryStatuses: async () => {
        const response = await api.get('/delivery-statuses');
        return response.data;
    }
};
