import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
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
  const [slideAnim] = useState(new Animated.Value(-300));

  const toggleMenu = () => {
    if (menuVisible) {
      // Cerrar menú
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setMenuVisible(false));
    } else {
      // Abrir menú
      setMenuVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <>
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.saludoContainer}>
              <Text style={styles.saludo}>¡Hola de nuevo!</Text>
            </View>
            
            {user && (
              <View style={styles.selectorContainer}>
                <EmpresaSelector
                  userId={user.id}
                  onEmpresaChange={onEmpresaChange}
                  selectedEmpresa={selectedEmpresa}
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
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                name={menuVisible ? "close" : "menu"} 
                size={24} 
                color={menuVisible ? "#3b82f6" : "#475569"} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Menú lateral */}
      {menuVisible && (
        <TouchableOpacity 
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleMenu}
        >
          <Animated.View 
            style={[
              styles.menuContainer,
              {
                transform: [{ translateX: slideAnim }],
              }
            ]}
          >
            <MenuLateral
              user={user}
              onClose={toggleMenu}
              onLogout={onLogout}
            />
          </Animated.View>
        </TouchableOpacity>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    minHeight: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
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
    paddingTop: 4,
  },
  saludoContainer: {
    marginBottom: 12,
  },
  saludo: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  selectorContainer: {
    marginTop: 4,
  },
  menuButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuButtonActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    zIndex: 2000,
  },
}); 