import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

export function useSocialAuth() {
  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    expoClientId: '114929806155-2kvgn58qqtkpj7070qm4gbjvabf7ounu.apps.googleusercontent.com',
    iosClientId: 'TU_CLIENT_ID_IOS',
    androidClientId: 'TU_CLIENT_ID_ANDROID',
    webClientId: 'TU_CLIENT_ID_WEB',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useAuth();
  const router = useRouter();

  // Google OAuth
  useEffect(() => {
    if (googleResponse?.type === 'success') {
      const { accessToken } = googleResponse.authentication;
      setLoading(true);
      fetch('https://TU_BACKEND_URL/api/auth/social-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'google',
          accessToken,
        }),
      })
        .then(res => res.json())
        .then(data => {
          setUser(data.user, data.access_token);
          router.replace('/');
        })
        .catch(() => setError('Error con Google OAuth'))
        .finally(() => setLoading(false));
    }
  }, [googleResponse]);

  // Apple OAuth
  const signInWithApple = async () => {
    setLoading(true);
    setError('');
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (credential.identityToken) {
        const res = await fetch('https://TU_BACKEND_URL/api/auth/social-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: 'apple',
            accessToken: credential.identityToken,
            email: credential.email,
            name: credential.fullName?.givenName,
          }),
        });
        const data = await res.json();
        setUser(data.user, data.access_token);
        router.replace('/');
      } else {
        setError('No se pudo obtener el token de Apple');
      }
    } catch (e) {
      setError('Error con Apple OAuth');
    } finally {
      setLoading(false);
    }
  };

  return {
    googlePromptAsync,
    googleRequest,
    signInWithApple,
    loading,
    error,
  };
} 