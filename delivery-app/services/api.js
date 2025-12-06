import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

// URL for physical device (Local Network IP)
const API_URL = 'https://gelatoapp-production.up.railway.app/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000, // 10 seconds timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor to add token to requests
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor to handle 401 errors (Unauthorized)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            await AsyncStorage.removeItem('auth_token');
            // We can't easily access AuthContext here to clear user state,
            // but removing the token and redirecting will force a re-login.
            router.replace('/login');
        }
        return Promise.reject(error);
    }
);

export { API_URL };
export default api;
