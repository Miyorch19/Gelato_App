import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const DashboardScreen = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Dashboard</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </View>
                        <Text style={styles.userName}>{user?.name}</Text>
                        <Text style={styles.userRole}>{user?.role?.name || 'Repartidor'}</Text>
                    </View>

                    <View style={styles.infoSection}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Correo Electrónico</Text>
                            <Text style={styles.infoValue}>{user?.email}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Teléfono</Text>
                            <Text style={styles.infoValue}>{user?.phone || 'No registrado'}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>ID de Usuario</Text>
                            <Text style={styles.infoValue}>#{user?.id}</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Text style={styles.logoutText}>CERRAR SESIÓN</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    content: {
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 24,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#e9ecef',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#495057',
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#212529',
        marginBottom: 4,
    },
    userRole: {
        fontSize: 14,
        color: '#6c757d',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    infoSection: {
        width: '100%',
    },
    infoItem: {
        paddingVertical: 12,
    },
    infoLabel: {
        fontSize: 12,
        color: '#868e96',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        color: '#212529',
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f3f5',
    },
    logoutButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#fa5252',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutText: {
        color: '#fa5252',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});

export default DashboardScreen;
