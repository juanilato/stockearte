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
import FloatingLabelInput from '../app/components/FloatingLabel';
import { colors } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import { useSocialAuth } from '../hooks/useSocialAuth';
import { SocialAuthButton } from './components/SocialAuthButton';

const { width, height } = Dimensions.get('window');

export default function SignUpScreen() {
  const { register } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const { googlePromptAsync, googleRequest, signInWithApple, loading: socialLoading, error: socialError } = useSocialAuth();

  const onSignUpPress = async () => {
    if (!emailAddress || !password || !confirmPassword) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await register(emailAddress, password);
      router.replace('/');
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = async (provider: 'google' | 'apple') => {
    setLoading(true);
    setError('');
    
    try {
      // Aquí implementarías la lógica específica para cada proveedor
      // Por ahora, simulamos el proceso
      console.log(`Iniciando registro con ${provider}`);
      
      // Ejemplo para Google (necesitarías implementar la autenticación real)
      if (provider === 'google') {
        // Implementar Google OAuth
        setError('Registro con Google no implementado aún');
      } else if (provider === 'apple') {
        // Implementar Apple OAuth
        setError('Registro con Apple no implementado aún');
      }
    } catch (err: any) {
      setError(`Error al registrar con ${provider}`);
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
          <Text style={styles.title}>Crear cuenta</Text>
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
              autoComplete="password-new" 
            />
            <FloatingLabelInput 
              label="Confirmar contraseña" 
              value={confirmPassword} 
              onChangeText={setConfirmPassword} 
              secureTextEntry 
              autoComplete="password-new" 
            />
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            <TouchableOpacity 
              style={[styles.primaryButton, loading && styles.disabled]} 
              onPress={onSignUpPress} 
              disabled={loading} 
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? 'Creando cuenta...' : 'Registrarse'}
              </Text>
            </TouchableOpacity>
            {/* Social Signup */}
            <View style={styles.iconRow}>
              <SocialAuthButton
                provider="google"
                onPress={() => googlePromptAsync()}
                loading={socialLoading}
                text="Registrarse con Google"
              />
              {Platform.OS === 'ios' && (
                <SocialAuthButton
                  provider="apple"
                  onPress={signInWithApple}
                  loading={socialLoading}
                  text="Registrarse con Apple"
                />
              )}
            </View>
            {socialError ? (
              <Text style={{ color: '#ef4444', marginTop: 8, textAlign: 'center' }}>{socialError}</Text>
            ) : null}
            <Link href="/login" asChild>
              <Pressable style={styles.footerLink}>
                <Text style={styles.footerText}>
                  ¿Ya tenés cuenta? <Text style={styles.footerAccent}>Iniciá sesión</Text>
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
});
