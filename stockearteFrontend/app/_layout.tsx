import { Slot, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { EmpresaProvider } from '../context/EmpresaContext';
import { NavigationProvider } from './context/NavigationContext';
import { Provider as PaperProvider } from 'react-native-paper';

const InitialLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const currentRoute = segments[0];
    const isAuthRoute = currentRoute === 'login' || currentRoute === 'signup';

    if (isAuthenticated && isAuthRoute) {
      router.replace('/');
    } else if (!isAuthenticated && !isAuthRoute) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    // Aquí podrías mostrar un splash screen
    return null;
  }

  return <Slot />;
};

export default function RootLayout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <EmpresaProvider>
          <NavigationProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <InitialLayout />
            </GestureHandlerRootView>
          </NavigationProvider>
        </EmpresaProvider>
      </AuthProvider>
    </PaperProvider>
  );
} 