import 'react-native-gesture-handler';
import { Slot, useSegments, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { View, ActivityIndicator, LogBox } from 'react-native';
import * as Notifications from 'expo-notifications';

LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  'Expo Go',
]);

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (error) {
  console.log('Error setting notification handler (likely Expo Go limitation):', error);
}

const RootLayoutNav = () => {
  const { user, isLoading, isInitialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    const inDrawer = segments[0] === '(drawer)';

    if (!user && !inDrawer && segments[0] !== 'login') {
      // Redirect to the login page if not signed in
      router.replace('/login');
    } else if (user && segments[0] === 'login') {
      // Redirect to the drawer dashboard if signed in
      router.replace('/(drawer)/dashboard');
    }
  }, [user, segments, isLoading, isInitialized]);

  if (isLoading || !isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
