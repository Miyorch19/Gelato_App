import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    ScrollView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';

const HistoryScreen = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({ count: 0, total: 0 });

    const fetchHistory = useCallback(async () => {
        try {
            const response = await orderService.getAll({
                delivery_person_id: user?.id,
            });

            // Handle paginated response from Laravel
            const ordersData = response.data;
            let fetchedOrders = ordersData?.data || [];

            // Filter completed orders
            fetchedOrders = fetchedOrders.filter(
                (o) => o.delivery_status?.name === 'entregado'
            );

            // Sort by date desc
            fetchedOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            // Calculate stats
            const total = fetchedOrders.reduce(
                (sum, order) => sum + parseFloat(order.total),
                0
            );

            setStats({
                count: fetchedOrders.length,
                total: total.toFixed(2),
            });

            setOrders(fetchedOrders);
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error('Error fetching history:', error);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchHistory();
    };

    const renderHistoryItem = ({ item }) => (
        <View style={styles.historyCard}>
            <View style={styles.cardHeader}>
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
                            {new Date(item.created_at).toLocaleDateString()} • {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                </View>
                <Text style={styles.amount}>${parseFloat(item.total).toFixed(2)}</Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.cardFooter}>
                <View style={styles.footerItem}>
                    <View style={styles.detailIcon}>
                        <Feather name="package" size={14} color="#6b7280" />
                    </View>
                    <Text style={styles.footerText}>Pedido #{item.id}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: '#f0fdf4' }]}>
                    <Text style={[styles.statusText, { color: '#16a34a' }]}>Entregado</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Stats Header */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <Text style={styles.statValue}>{stats.count}</Text>
                        <View style={[styles.iconContainer, { backgroundColor: '#f0fdf4' }]}>
                            <Feather name="check-circle" size={18} color="#16a34a" />
                        </View>
                    </View>
                    <Text style={styles.statLabel}>Entregas</Text>
                </View>
                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <Text style={styles.statValue}>${stats.total}</Text>
                        <View style={[styles.iconContainer, { backgroundColor: '#ecfdf5' }]}>
                            <Feather name="dollar-sign" size={18} color="#059669" />
                        </View>
                    </View>
                    <Text style={styles.statLabel}>Ganancias</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#000" />
                </View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderHistoryItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Feather name="clock" size={48} color="#d1d5db" />
                            <Text style={styles.emptyStateText}>No hay historial de entregas</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    statsContainer: {
        flexDirection: 'row',
        padding: 20,
        gap: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
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
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        letterSpacing: -1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
        paddingTop: 0,
    },
    historyCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
        elevation: 3,
    },
    cardHeader: {
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
    amount: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: -0.5,
    },
    separator: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginBottom: 16,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailIcon: {
        width: 24,
        height: 24,
        borderRadius: 8,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 13,
        color: '#4B5563',
        fontWeight: '500',
    },
    statusPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
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
});

export default HistoryScreen;
