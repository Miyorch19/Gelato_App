import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { Feather } from '@expo/vector-icons';
import CustomDrawerContent from '../../components/CustomDrawerContent';

export default function DrawerLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer
                drawerContent={(props) => <CustomDrawerContent {...props} />}
                screenOptions={{
                    headerShown: true,
                    headerTintColor: '#111827',
                    headerStyle: {
                        backgroundColor: '#fff',
                        elevation: 0, // Remove shadow on Android
                        shadowOpacity: 0, // Remove shadow on iOS
                        borderBottomWidth: 1,
                        borderBottomColor: '#F3F4F6',
                    },
                    headerTitleStyle: {
                        fontWeight: '700',
                        fontSize: 18,
                        color: '#111827',
                    },
                    drawerActiveBackgroundColor: '#f3f4f6',
                    drawerActiveTintColor: '#000',
                    drawerInactiveTintColor: '#6b7280',
                    drawerLabelStyle: {
                        // marginLeft: -20,
                        fontSize: 15,
                        fontWeight: '500',
                    },
                    drawerStyle: {
                        backgroundColor: '#fff',
                        width: 280,
                    },
                }}
            >
                <Drawer.Screen
                    name="dashboard"
                    options={{
                        drawerLabel: 'Inicio',
                        title: 'Dashboard',
                        drawerIcon: ({ color, size }) => (
                            <Feather name="home" size={size} color={color} />
                        ),
                    }}
                />
                <Drawer.Screen
                    name="orders"
                    options={{
                        drawerLabel: 'Mis Pedidos',
                        title: 'Pedidos Activos',
                        drawerIcon: ({ color, size }) => (
                            <Feather name="package" size={size} color={color} />
                        ),
                    }}
                />
                <Drawer.Screen
                    name="history"
                    options={{
                        drawerLabel: 'Historial',
                        title: 'Historial de Entregas',
                        drawerIcon: ({ color, size }) => (
                            <Feather name="clock" size={size} color={color} />
                        ),
                    }}
                />
            </Drawer>
        </GestureHandlerRootView>
    );
}
