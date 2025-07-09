import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { userService } from '../../services/api';

interface MenuLateralProps {
  user: any;
  onClose: () => void;
  onLogout: () => void;
}

export default function MenuLateral({ user, onClose, onLogout }: MenuLateralProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados para cambiar contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Estados para API key
  const [apiKey, setApiKey] = useState('');

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await userService.changePassword(user.id, {
        currentPassword,
        newPassword,
      });
      
      Alert.alert('Éxito', 'Contraseña actualizada correctamente');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'La API key es obligatoria');
      return;
    }

    setLoading(true);
    try {
      await userService.updateApiKey(user.id, {
        apikeys: [apiKey.trim()],
      });
      
      Alert.alert('Éxito', 'API key guardada correctamente');
      setShowApiKeyModal(false);
      setApiKey('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordModal = () => (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Cambiar Contraseña</Text>
          <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
            <MaterialCommunityIcons name="close" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Contraseña Actual</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu contraseña actual"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nueva Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa la nueva contraseña"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirmar Nueva Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirma la nueva contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowPasswordModal(false)}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleChangePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Actualizar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderApiKeyModal = () => (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>API Key MercadoPago</Text>
          <TouchableOpacity onPress={() => setShowApiKeyModal(false)}>
            <MaterialCommunityIcons name="close" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>API Key</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu API key de MercadoPago"
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowApiKeyModal(false)}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleSaveApiKey}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="account" size={32} color="#3b82f6" />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.email || 'Usuario'}</Text>
              <Text style={styles.userRole}>Administrador</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.menuContent}>
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Configuración</Text>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => setShowPasswordModal(true)}
            >
              <MaterialCommunityIcons name="lock-reset" size={24} color="#3b82f6" />
              <Text style={styles.menuItemText}>Cambiar Contraseña</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => setShowApiKeyModal(true)}
            >
              <MaterialCommunityIcons name="credit-card-outline" size={24} color="#10b981" />
              <Text style={styles.menuItemText}>API Key MercadoPago</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <View style={styles.menuSection}>
            <TouchableOpacity 
              style={[styles.menuItem, styles.logoutItem]}
              onPress={onLogout}
            >
              <MaterialCommunityIcons name="logout" size={24} color="#ef4444" />
              <Text style={[styles.menuItemText, styles.logoutText]}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {showPasswordModal && renderPasswordModal()}
      {showApiKeyModal && renderApiKeyModal()}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  userRole: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  menuContent: {
    flex: 1,
  },
  menuSection: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
    paddingHorizontal: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuItemText: {
    flex: 1,
    fontSize: 18,
    color: '#1e293b',
    marginLeft: 16,
  },
  logoutItem: {
    backgroundColor: '#fef2f2',
  },
  logoutText: {
    color: '#ef4444',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 2000,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
  },
  cancelButtonText: {
    color: '#64748b',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
}); 