import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Empresa } from '../../services/api';
import EmpresaSelector from './EmpresaSelector';
import MenuLateral from './MenuLateral';

interface HeaderIntegradoProps {
  user: any;
  selectedEmpresa: Empresa | null;
  onEmpresaChange: (empresa: Empresa) => void;
  onLogout: () => void;
}

export default function HeaderIntegrado({
  user,
  selectedEmpresa,
  onEmpresaChange,
  onLogout,
}: HeaderIntegradoProps) {
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.userInfoContainer}>
              <View style={styles.avatarContainer}>
                <MaterialCommunityIcons name="account-circle" size={36} color="#6366f1" />
              </View>
              <View style={styles.userTextContainer}>
                <Text style={styles.welcomeText}>Bienvenido de vuelta</Text>
                <Text style={styles.userName}>
                  {user?.email ? user.email.split('@')[0] : 'Usuario'}
                </Text>
              </View>
            </View>
            
            {user && (
              <View style={styles.selectorContainer}>
                <EmpresaSelector
                  userId={user.id}
                />
              </View>
            )}
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={[
                styles.menuButton,
                menuVisible && styles.menuButtonActive
              ]}
              onPress={toggleMenu}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons 
                name={menuVisible ? "close" : "menu"} 
                size={24} 
                color={menuVisible ? "#6366f1" : "#64748b"} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Menú lateral con overlay mejorado */}
      {menuVisible && (
        <View style={styles.overlay}>
          <TouchableOpacity 
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={toggleMenu}
          />
          <View style={styles.menuContainer}>
            <MenuLateral
              user={user}
              onClose={toggleMenu}
              onLogout={onLogout}
            />
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingTop: 40,
    minHeight: 120,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
    marginRight: 20,
  },
  headerRight: {
    alignItems: 'center',
    paddingTop: 8,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  userTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  selectorContainer: {
    marginTop: 8,
  },
  menuButton: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  menuButtonActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOpacity: 0.15,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 999,
  },
  overlayTouchable: {
    flex: 1,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    zIndex: 1000,
  },
}); 