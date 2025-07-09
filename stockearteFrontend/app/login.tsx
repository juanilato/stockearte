import { AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    Image,
    Platform,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import FloatingLabelInput from '../components/FloatingLabelLogin';
import { useBiometricAuth } from '../hooks/useBiometricAuth';
import { colors } from '../styles/theme';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function SignInScreen() {
  const { authenticate, getStoredCredentials, enableBiometricAuth } = useBiometricAuth();
  const { login } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const onBiometricLogin = async () => {
    const success = await authenticate();
    console.log("🔐 Autenticación biométrica:", success);

    if (success) {
      const creds = await getStoredCredentials();
      console.log("📦 Credenciales guardadas:", creds);

      if (creds) {
        try {
          await login(creds.email, creds.password);
          router.replace('/');
        } catch (error: any) {
          console.error("❌ Error al ingresar con biometría:", error);
          setError("No se pudo ingresar con biometría");
        }
      } else {
        setError('No hay credenciales guardadas');
      }
    } else {
      setError('Autenticación biométrica fallida');
    }
  };

  const onSignInPress = async () => {
    if (!emailAddress || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await login(emailAddress, password);

      // 💾 Guardar credenciales para biometría
      await enableBiometricAuth(emailAddress, password);

      router.replace('/');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setLoading(true);
    setError('');
    
    try {
      // Aquí implementarías la lógica específica para cada proveedor
      // Por ahora, simulamos el proceso
      console.log(`Iniciando login con ${provider}`);
      
      // Ejemplo para Google (necesitarías implementar la autenticación real)
      if (provider === 'google') {
        // Implementar Google OAuth
        setError('Login con Google no implementado aún');
      } else if (provider === 'apple') {
        // Implementar Apple OAuth
        setError('Login con Apple no implementado aún');
      }
    } catch (err: any) {
      setError(`Error al iniciar sesión con ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" translucent />
      <View style={styles.centeredWrapper}>
        <View style={styles.formCard}>
          <View style={styles.logoContainer}>
            <Image source={require('../assets/images/icon.png')} style={styles.logo} />
          </View>
          <Text style={styles.title}>Iniciar sesión</Text>
          <View style={styles.formSection}>
            <FloatingLabelInput
              label="Correo electrónico"
              value={emailAddress}
              onChangeText={setEmailAddress}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <FloatingLabelInput
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabled]}
              onPress={onSignInPress}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? 'Ingresando...' : 'Entrar'}
              </Text>
            </TouchableOpacity>

            {/* Social & Biometric Icons */}
            <View style={styles.iconRow}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleSocialLogin('google')}
                disabled={loading}
                activeOpacity={0.7}
              >
                <AntDesign name="google" size={22} color="#EA4335" />
              </TouchableOpacity>
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => handleSocialLogin('apple')}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <FontAwesome name="apple" size={22} color="#1e293b" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.iconButton}
                onPress={onBiometricLogin}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Ionicons name="finger-print" size={22} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <Link href="/signup" asChild>
              <Pressable style={styles.footerLink}>
                <Text style={styles.footerText}>
                  ¿No tenés cuenta? <Text style={styles.footerAccent}>Regístrate</Text>
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centeredWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  formCard: {
    width: 340,
    maxWidth: '100%',
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 8,
  },
  logoContainer: {
    marginBottom: 18,
    alignItems: 'center',
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 14,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  formSection: {
    width: '100%',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  primaryButton: {
    marginTop: 18,
    borderRadius: 12,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  disabled: {
    opacity: 0.6,
  },
  footerLink: {
    marginTop: 18,
    alignSelf: 'center',
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  footerAccent: {
    color: colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginTop: 18,
    marginBottom: 2,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
});
