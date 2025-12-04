import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL for Android Emulator to access localhost
// If testing on physical device, replace with your machine's local IP (e.g., http://192.168.1.x:8000/api)
const API_URL = 'http://10.0.2.2:8000/api';

const api = axios.create({
    baseURL: API_URL,
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

export default api;
