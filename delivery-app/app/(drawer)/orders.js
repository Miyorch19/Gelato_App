import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    RefreshControl,
    Modal,
    Alert,
    ScrollView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import ChatModal from '../../components/ChatModal';

const OrdersScreen = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('active'); // 'active' | 'all'
    const [searchTerm, setSearchTerm] = useState('');

    // Chat State
    const [chatOrder, setChatOrder] = useState(null);
    const [chatVisible, setChatVisible] = useState(false);

    // Status Update State
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [deliveryStatuses, setDeliveryStatuses] = useState([]);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const fetchOrders = useCallback(async () => {
        try {
            const response = await orderService.getAll({
                delivery_person_id: user?.id,
            });

            // Handle paginated response from Laravel
            const ordersData = response.data;
            let fetchedOrders = ordersData?.data || [];

            // Sort by date desc
            fetchedOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setOrders(fetchedOrders);
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error('Error fetching orders:', error);
                Alert.alert('Error', 'No se pudieron cargar los pedidos');
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
        fetchOrders();
        fetchStatuses();
    }, [fetchOrders]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const handleUpdateStatus = (order) => {
        setSelectedOrder(order);
        setStatusModalVisible(true);
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
            setStatusModalVisible(false);
            fetchOrders();
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error('Error updating status:', error);
                Alert.alert('Error', 'No se pudo actualizar el estado');
            }
        } finally {
            setUpdatingStatus(false);
        }
    };

    const openChat = (order) => {
        setChatOrder(order);
        setChatVisible(true);
    };

    const getStatusColor = (statusName) => {
        const colors = {
            pendiente: '#d97706', // yellow-600
            preparando: '#2563eb', // blue-600
            en_camino: '#9333ea', // purple-600
            entregado: '#16a34a', // green-600
            cancelado: '#dc2626', // red-600
        };
        return colors[statusName] || '#4b5563';
    };

    const getStatusBgColor = (statusName) => {
        const colors = {
            pendiente: '#fef3c7', // yellow-50
            preparando: '#eff6ff', // blue-50
            en_camino: '#faf5ff', // purple-50
            entregado: '#f0fdf4', // green-50
            cancelado: '#fef2f2', // red-50
        };
        return colors[statusName] || '#f3f4f6';
    };

    const filteredOrders = orders.filter(order => {
        // Filter by status
        if (filter === 'active') {
            const status = order.delivery_status?.name;
            if (status === 'entregado' || status === 'cancelado') return false;
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const idMatch = order.id.toString().includes(term);
            const nameMatch = order.user?.name?.toLowerCase().includes(term);
            return idMatch || nameMatch;
        }

        return true;
    });

    const renderOrderItem = ({ item }) => (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {item.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.userName} numberOfLines={1}>
                            {item.user?.name}
                        </Text>
                        <Text style={styles.orderDate}>
                            Pedido #{item.id} • {new Date(item.created_at).toLocaleDateString()}
                        </Text>
                    </View>
                </View>
                <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusBgColor(item.delivery_status?.name) }
                ]}>
                    <Text style={[
                        styles.statusText,
                        { color: getStatusColor(item.delivery_status?.name) }
                    ]}>
                        {item.delivery_status?.name?.replace('_', ' ')}
                    </Text>
                </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <View style={styles.detailIcon}>
                        <Feather name="map-pin" size={14} color="#6b7280" />
                    </View>
                    <Text style={styles.infoText} numberOfLines={2}>
                        {item.address?.street}, {item.address?.colony}
                    </Text>
                </View>
                {item.user?.phone && (
                    <View style={styles.infoRow}>
                        <View style={styles.detailIcon}>
                            <Feather name="phone" size={14} color="#6b7280" />
                        </View>
                        <Text style={styles.infoText}>{item.user.phone}</Text>
                    </View>
                )}
                <View style={styles.infoRow}>
                    <View style={styles.detailIcon}>
                        <Feather name="package" size={14} color="#6b7280" />
                    </View>
                    <Text style={styles.infoText}>{item.order_items?.length || 0} productos</Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <View>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalAmount}>
                        ${parseFloat(item.total).toFixed(2)}
                    </Text>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => openChat(item)}
                    >
                        <Feather name="message-circle" size={22} color="#2563eb" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleUpdateStatus(item)}
                    >
                        <Text style={styles.actionButtonText}>Actualizar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Search & Filter Header */}
            <View style={styles.header}>
                <View style={styles.searchContainer}>
                    <Feather name="search" size={16} color="#9ca3af" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar pedido..."
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                </View>
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[styles.filterButton, filter === 'active' && styles.filterButtonActive]}
                        onPress={() => setFilter('active')}
                    >
                        <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>Activos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
                        onPress={() => setFilter('all')}
                    >
                        <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>Todos</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#000" />
                </View>
            ) : (
                <FlatList
                    data={filteredOrders}
                    renderItem={renderOrderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Feather name="package" size={48} color="#d1d5db" />
                            <Text style={styles.emptyStateText}>No se encontraron pedidos</Text>
                        </View>
                    }
                />
            )}

            {/* Status Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={statusModalVisible}
                onRequestClose={() => setStatusModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Actualizar Estado</Text>
                            <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
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
        backgroundColor: '#F9FAFB',
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        // Removed border
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        paddingHorizontal: 16,
        marginBottom: 16,
        height: 50,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#111827',
        height: '100%',
    },
    filterContainer: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 14,
        padding: 4,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 12,
    },
    filterButtonActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#6b7280',
    },
    filterTextActive: {
        color: '#111827',
        fontWeight: '600',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
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
    orderDate: {
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
    cardBody: {
        gap: 12,
        marginBottom: 20,
    },
    infoRow: {
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
    infoText: {
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
    actionButton: {
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
    actionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
        opacity: 0.5,
    },
    emptyStateText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6b7280',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
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

export default OrdersScreen;
