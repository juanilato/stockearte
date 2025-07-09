import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BACKEND_CONFIG } from '../config/backend';

// Tipos
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  apikeys?: string[];
}

export interface SocialLoginCredentials {
  provider: 'google' | 'facebook' | 'apple';
  accessToken: string;
  email?: string;
  name?: string;
  picture?: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
  };
}

export interface User {
  id: number;
  email: string;
  apikeys?: string[];
}

// Configurar axios
const api = axios.create({
  baseURL: BACKEND_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
    }
    return Promise.reject(error);
  }
);

class AuthService {
  // Login con email y password
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post(BACKEND_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);
      const { access_token, user } = response.data;
      
      // Guardar token y datos del usuario
      await AsyncStorage.setItem('auth_token', access_token);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  }

  // Registro de usuario
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post(BACKEND_CONFIG.ENDPOINTS.USER.CREATE, credentials);
      const { access_token, user } = response.data;
      
      // Guardar token y datos del usuario
      await AsyncStorage.setItem('auth_token', access_token);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al registrar usuario');
    }
  }

  // Login social
  async socialLogin(credentials: SocialLoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post(BACKEND_CONFIG.ENDPOINTS.AUTH.SOCIAL_LOGIN, credentials);
      const { access_token, user } = response.data;
      
      // Guardar token y datos del usuario
      await AsyncStorage.setItem('auth_token', access_token);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error en login social');
    }
  }

  // Verificar token
  async verifyToken(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) return false;
      
      const response = await api.get(BACKEND_CONFIG.ENDPOINTS.AUTH.VERIFY);
      return response.data.valid;
    } catch (error) {
      return false;
    }
  }

  // Obtener perfil del usuario
  async getProfile(): Promise<User> {
    try {
      const response = await api.get(BACKEND_CONFIG.ENDPOINTS.AUTH.PROFILE);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener perfil');
    }
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_data');
  }

  // Obtener token actual
  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem('auth_token');
  }

  // Obtener datos del usuario actual
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }

  // Verificar si el usuario está autenticado
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) return false;
    
    return await this.verifyToken();
  }
}

export const authService = new AuthService();
export default authService; 