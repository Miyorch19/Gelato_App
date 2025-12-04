import React, { useContext, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Modal, Alert, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { API_URL } from '../../services/api';
import { Feather } from '@expo/vector-icons';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js/react-native';
import ChatModal from '../../components/ChatModal';
// import * as Notifications from 'expo-notifications';

// Configure Pusher for React Native
window.Pusher = Pusher;

const DashboardScreen = () => {
    const { user, token, logout } = useContext(AuthContext);
    const echoRef = React.useRef(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        pending: 0,
        inTransit: 0,
        delivered: 0,
        total: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);

    // Chat State
    const [chatOrder, setChatOrder] = useState(null);
    const [chatVisible, setChatVisible] = useState(false);

    // Status Update Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [deliveryStatuses, setDeliveryStatuses] = useState([]);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const fetchDashboardData = useCallback(async () => {
        try {
            const response = await orderService.getAll({
                delivery_person_id: user?.id,
            });

            // Handle paginated response from Laravel
            // API returns: { success: true, data: { current_page: 1, data: [...], ... } }
            const ordersData = response.data;
            const orders = ordersData?.data || [];

            // Calculate stats
            const pending = orders.filter(
                (o) => o.delivery_status?.name === 'preparando' || o.delivery_status?.name === 'pendiente'
            ).length;

            const inTransit = orders.filter(
                (o) => o.delivery_status?.name === 'en_camino'
            ).length;

            const deliveredToday = orders.filter((o) => {
                if (o.delivery_status?.name !== 'entregado') return false;
                const today = new Date();
                const orderDate = new Date(o.updated_at);
                return orderDate.toDateString() === today.toDateString();
            }).length;

            setStats({
                pending,
                inTransit,
                delivered: deliveredToday,
                total: orders.length,
            });

            // Active orders
            setRecentOrders(
                orders
                    .filter((o) =>
                        o.delivery_status?.name === 'pendiente' ||
                        o.delivery_status?.name === 'preparando' ||
                        o.delivery_status?.name === 'en_camino'
                    )
                    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            );

        } catch (error) {
            // Ignore 401 errors as they are handled by the interceptor
            if (error.response?.status !== 401) {
                console.error('Error fetching dashboard data:', error);
                Alert.alert('Error', 'No se pudieron cargar los datos');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    const fetchStatuses = async () => {
        try {
            const response = await orderService.getDeliveryStatuses();
            if (response.success) {
                setDeliveryStatuses(response.data);
            }
        } catch (error) {
            if (error.response?.status !== 401) {
                console.log('Error fetching statuses:', error);
            }
        }
    };

    useEffect(() => {
        // registerForPushNotificationsAsync();
        fetchDashboardData();
        fetchStatuses();
        setupEcho();

        return () => {
            if (echoRef.current) {
                echoRef.current.leaveChannel(`private-delivery-person.${user?.id}`);
                echoRef.current.disconnect();
            }
        };
    }, [fetchDashboardData, user]);

    // async function registerForPushNotificationsAsync() {
    //     try {
    //         const { status: existingStatus } = await Notifications.getPermissionsAsync();
    //         let finalStatus = existingStatus;
    //         if (existingStatus !== 'granted') {
    //             const { status } = await Notifications.requestPermissionsAsync();
    //             finalStatus = status;
    //         }
    //         if (finalStatus !== 'granted') {
    //             // alert('Failed to get push token for push notification!');
    //             console.log('Failed to get push token for push notification!');
    //             return;
    //         }
    //     } catch (error) {
    //         console.log('Error registering for push notifications (likely Expo Go limitation):', error);
    //     }
    // }

    const setupEcho = () => {
        if (!user || !token) return;

        try {
            // Extract host from API_URL
            const match = API_URL.match(/https?:\/\/([^:]+)/);
            const host = match ? match[1] : '192.168.1.67';

            echoRef.current = new Echo({
                broadcaster: 'reverb',
                key: 'bgzcymqswrd5dunafh0b',
                wsHost: host,
                wsPort: 8080,
                wssPort: 8080,
                forceTLS: false,
                enabledTransports: ['ws', 'wss'],
                authEndpoint: `${API_URL}/broadcasting/auth`,
                auth: {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                },
            });

            echoRef.current
                .private(`delivery-person.${user.id}`)
                .listen('OrderAssigned', async (e) => {
                    console.log('New order assigned:', e.order);

                    // Schedule local notification
                    // await Notifications.scheduleNotificationAsync({
                    //     content: {
                    //         title: "¡Nuevo Pedido Asignado!",
                    //         body: `Se te ha asignado el pedido #${e.order.id}`,
                    //         data: { orderId: e.order.id },
                    //     },
                    //     trigger: null, // Show immediately
                    // });

                    Alert.alert(
                        '¡Nuevo Pedido Asignado!',
                        `Se te ha asignado el pedido #${e.order.id}`,
                        [
                            { text: 'Ver', onPress: () => fetchDashboardData() }
                        ]
                    );
                    fetchDashboardData();
                });
        } catch (error) {
            console.error('Error setting up Echo:', error);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    const openChat = (order) => {
        setChatOrder(order);
        setChatVisible(true);
    };

    const handleUpdateStatus = (order) => {
        setSelectedOrder(order);
        setModalVisible(true);
    };

    const confirmStatusUpdate = async (statusId) => {
        if (!selectedOrder) return;

        setUpdatingStatus(true);
        try {
            await orderService.updateStatus(selectedOrder.id, {
                delivery_status_id: statusId,
                notes: 'Actualizado desde App Repartidor'
            });

            Alert.alert('Éxito', 'Estado actualizado correctamente');
            setModalVisible(false);
            fetchDashboardData(); // Refresh data
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error('Error updating status:', error);
                Alert.alert('Error', 'No se pudo actualizar el estado');
            }
        } finally {
            setUpdatingStatus(false);
        }
    };

    const getStatusColor = (statusName) => {
        const colors = {
            pendiente: '#d97706', // yellow-600
            preparando: '#2563eb', // blue-600
            en_camino: '#9333ea', // purple-600
            entregado: '#16a34a', // green-600
            cancelado: '#dc2626', // red-600
        };
        return colors[statusName] || '#4b5563'; // gray-600
    };

    const getStatusBgColor = (statusName) => {
        const colors = {
            pendiente: '#fef3c7', // yellow-50
            preparando: '#eff6ff', // blue-50
            en_camino: '#faf5ff', // purple-50
            entregado: '#f0fdf4', // green-50
            cancelado: '#fef2f2', // red-50
        };
        return colors[statusName] || '#f3f4f6'; // gray-50
    };

    const renderStatCard = (title, value, icon, color, bgColor) => (
        <View style={styles.statCard}>
            <View style={styles.statHeader}>
                <Text style={styles.statValue}>{value}</Text>
                <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
                    <Feather name={icon} size={18} color={color} />
                </View>
            </View>
            <Text style={styles.statLabel}>{title}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {renderStatCard('Pendientes', stats.pending, 'clock', '#d97706', '#fef3c7')}
                    {renderStatCard('En Ruta', stats.inTransit, 'truck', '#9333ea', '#faf5ff')}
                    {renderStatCard('Entregados', stats.delivered, 'check-circle', '#16a34a', '#f0fdf4')}
                    {renderStatCard('Total', stats.total, 'trending-up', '#2563eb', '#eff6ff')}
                </View>

                {/* Recent Orders */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Pedidos Activos</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
                ) : recentOrders.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIcon}>
                            <Feather name="shopping-bag" size={32} color="#d1d5db" />
                        </View>
                        <Text style={styles.emptyTitle}>Todo al día</Text>
                        <Text style={styles.emptyText}>No tienes pedidos activos en este momento.</Text>
                    </View>
                ) : (
                    recentOrders.map((order) => (
                        <View key={order.id} style={styles.orderCard}>
                            <View style={styles.orderHeader}>
                                <View style={styles.userInfo}>
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>
                                            {order.user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.userName} numberOfLines={1}>
                                            {order.user?.name}
                                        </Text>
                                        <Text style={styles.orderId}>Pedido #{order.id}</Text>
                                    </View>
                                </View>
                                <View style={[
                                    styles.statusBadge,
                                    { backgroundColor: getStatusBgColor(order.delivery_status?.name) }
                                ]}>
                                    <Text style={[
                                        styles.statusText,
                                        { color: getStatusColor(order.delivery_status?.name) }
                                    ]}>
                                        {order.delivery_status?.name?.replace('_', ' ')}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.separator} />

                            <View style={styles.orderDetails}>
                                <View style={styles.detailRow}>
                                    <View style={styles.detailIcon}>
                                        <Feather name="map-pin" size={14} color="#6b7280" />
                                    </View>
                                    <Text style={styles.detailText} numberOfLines={2}>
                                        {order.address?.street}, {order.address?.colony}
                                    </Text>
                                </View>
                                {order.user?.phone && (
                                    <View style={styles.detailRow}>
                                        <View style={styles.detailIcon}>
                                            <Feather name="phone" size={14} color="#6b7280" />
                                        </View>
                                        <Text style={styles.detailText}>{order.user.phone}</Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.cardFooter}>
                                <View>
                                    <Text style={styles.totalLabel}>Total</Text>
                                    <Text style={styles.totalAmount}>
                                        ${parseFloat(order.total).toFixed(2)}
                                    </Text>
                                </View>
                                <View style={styles.actions}>
                                    <TouchableOpacity
                                        style={styles.iconButton}
                                        onPress={() => openChat(order)}
                                    >
                                        <Feather name="message-circle" size={22} color="#2563eb" />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.updateButton}
                                        onPress={() => handleUpdateStatus(order)}
                                    >
                                        <Text style={styles.updateButtonText}>Actualizar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Status Update Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Actualizar Estado</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Feather name="x" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtitle}>
                            Selecciona el nuevo estado para el pedido #{selectedOrder?.id}
                        </Text>

                        <ScrollView style={styles.statusList}>
                            {deliveryStatuses.map((status) => (
                                <TouchableOpacity
                                    key={status.id}
                                    style={[
                                        styles.statusOption,
                                        selectedOrder?.delivery_status_id === status.id && styles.statusOptionActive
                                    ]}
                                    onPress={() => confirmStatusUpdate(status.id)}
                                    disabled={updatingStatus}
                                >
                                    <View style={[
                                        styles.statusDot,
                                        { backgroundColor: getStatusColor(status.name) }
                                    ]} />
                                    <Text style={styles.statusOptionText}>
                                        {status.name.charAt(0).toUpperCase() + status.name.slice(1).replace('_', ' ')}
                                    </Text>
                                    {selectedOrder?.delivery_status_id === status.id && (
                                        <Feather name="check" size={18} color="#10b981" style={{ marginLeft: 'auto' }} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {updatingStatus && (
                            <ActivityIndicator size="small" color="#000" style={{ marginTop: 10 }} />
                        )}
                    </View>
                </View>
            </Modal>

            {/* Chat Modal */}
            <ChatModal
                order={chatOrder}
                visible={chatVisible}
                onClose={() => setChatVisible(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB', // Lighter gray background
    },
    header: {
        paddingHorizontal: 24,
        paddingVertical: 20,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // Removed heavy border
    },
    greeting: {
        fontSize: 24,
        fontWeight: '800', // Bolder
        color: '#111827',
        letterSpacing: -0.5,
    },
    subGreeting: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 2,
    },
    content: {
        padding: 24,
        paddingBottom: 40,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 32,
    },
    statCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        width: '47%', // Slightly less than half to account for gap
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03, // Very subtle shadow
        shadowRadius: 12,
        elevation: 2,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.8,
    },
    statLabel: {
        fontSize: 13,
        color: '#6b7280',
        fontWeight: '500',
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        letterSpacing: -1,
    },
    sectionHeader: {
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        letterSpacing: -0.5,
    },
    emptyState: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f3f4f6',
        borderStyle: 'dashed',
    },
    emptyIcon: {
        width: 72,
        height: 72,
        backgroundColor: '#f9fafb',
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 15,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 22,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#374151',
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 2,
    },
    orderId: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginLeft: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'capitalize',
    },
    separator: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 16,
    },
    orderDetails: {
        gap: 12,
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    detailIcon: {
        width: 24,
        height: 24,
        borderRadius: 8,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailText: {
        fontSize: 14,
        color: '#4B5563',
        flex: 1,
        lineHeight: 20,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    totalLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 2,
    },
    totalAmount: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: -0.5,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    updateButton: {
        backgroundColor: '#111827',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 14,
        shadowColor: '#111827',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)', // Darker overlay
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 32,
        maxHeight: '85%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111827',
    },
    modalSubtitle: {
        fontSize: 15,
        color: '#6b7280',
        marginBottom: 32,
        lineHeight: 22,
    },
    statusList: {
        marginBottom: 24,
    },
    statusOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    statusOptionActive: {
        backgroundColor: '#F9FAFB',
        marginHorizontal: -16,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderBottomWidth: 0,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 16,
    },
    statusOptionText: {
        fontSize: 16,
        color: '#374151',
        fontWeight: '600',
    },
});

export default DashboardScreen;
