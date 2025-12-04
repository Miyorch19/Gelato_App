import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useAuth } from '../context/AuthContext';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const CustomDrawerContent = (props) => {
    const { logout, user } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            "Cerrar Sesión",
            "¿Estás seguro que deseas salir?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Salir",
                    onPress: async () => {
                        await logout();
                    },
                    style: 'destructive'
                }
            ]
        );
    };

    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
                {/* User Header */}
                <View style={styles.userInfoSection}>
                    <View style={styles.avatarContainer}>
                        <Feather name="user" size={30} color="#000" />
                    </View>
                    <View style={styles.userDetails}>
                        <Text style={styles.userName}>{user?.name || 'Repartidor'}</Text>
                        <Text style={styles.userEmail}>{user?.email || ''}</Text>
                    </View>
                </View>

                {/* Standard Drawer Items */}
                <View style={styles.drawerItemsContainer}>
                    <DrawerItemList {...props} />
                </View>
            </DrawerContentScrollView>

            {/* Logout Button at Bottom */}
            <View style={styles.bottomSection}>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Feather name="log-out" size={20} color="#ef4444" />
                    <Text style={styles.logoutText}>Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    drawerContent: {
        flex: 1,
    },
    userInfoSection: {
        padding: 20,
        backgroundColor: '#fff',
        marginBottom: 10,
        marginTop: -50, // Pull up to cover status bar area if needed, or adjust based on header
        paddingTop: 60,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    userDetails: {
        marginTop: 5,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    userEmail: {
        fontSize: 14,
        color: '#6b7280',
    },
    drawerItemsContainer: {
        flex: 1,
        paddingTop: 10,
    },
    bottomSection: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f4f4f5',
        marginBottom: 20,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#ef4444',
        marginLeft: 15,
    },
});

export default CustomDrawerContent;
