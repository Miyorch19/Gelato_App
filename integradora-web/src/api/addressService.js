import api from './axiosConfig';

const addressService = {
    // Obtener todas las direcciones del usuario autenticado
    getMyAddresses: async () => {
        const response = await api.get('/my-addresses');
        return response.data;
    },

    // Obtener una dirección específica por ID
    getAddress: async (id) => {
        const response = await api.get(`/addresses/${id}`);
        return response.data;
    },

    // Crear una nueva dirección
    createAddress: async (addressData) => {
        const response = await api.post('/addresses', addressData);
        return response.data;
    },

    // Actualizar una dirección existente
    updateAddress: async (id, addressData) => {
        const response = await api.put(`/addresses/${id}`, addressData);
        return response.data;
    },

    // Eliminar una dirección
    deleteAddress: async (id) => {
        const response = await api.delete(`/addresses/${id}`);
        return response.data;
    },

    // Establecer una dirección como predeterminada
    setDefaultAddress: async (id) => {
        const response = await api.put(`/addresses/${id}/set-default`);
        return response.data;
    }
};

export default addressService;
