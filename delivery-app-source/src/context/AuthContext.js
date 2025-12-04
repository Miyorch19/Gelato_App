import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkLoggedIn();
    }, []);

    const checkLoggedIn = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('auth_token');
            if (storedToken) {
                setToken(storedToken);
                // Verify token and get user info
                const response = await api.get('/me');
                if (response.data.success) {
                    setUser(response.data.data.user);
                } else {
                    // Token invalid
                    await logout();
                }
            }
        } catch (error) {
            console.log('Error checking login status:', error);
            await logout();
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const response = await api.post('/login', { email, password });

            if (response.data.success) {
                const { user, token } = response.data.data;

                // Check if user is a delivery person (repartidor)
                // Assuming role_id for repartidor is known or we check role name
                // For now, we'll allow login but you might want to restrict it
                if (user.role.name !== 'repartidor' && user.role.name !== 'admin' && user.role.name !== 'superadmin') {
                    throw new Error('Acceso denegado. Esta app es solo para repartidores.');
                }

                await AsyncStorage.setItem('auth_token', token);
                setToken(token);
                setUser(user);
                return { success: true };
            }
        } catch (error) {
            console.log('Login error:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Error al iniciar sesión'
            };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.log('Logout error (ignoring):', error);
        } finally {
            await AsyncStorage.removeItem('auth_token');
            setToken(null);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
