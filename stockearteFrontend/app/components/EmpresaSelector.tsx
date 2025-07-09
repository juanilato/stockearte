import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { empresaService, Empresa } from '../../services/api';
import ModalEmpresa from './ModalEmpresa';
import { Portal } from 'react-native-paper';
import { useEmpresa } from '../../context/EmpresaContext';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface EmpresaSelectorProps {
  userId: number;
}

export default function EmpresaSelector({ userId }: EmpresaSelectorProps) {
  const { selectedEmpresa, setSelectedEmpresa } = useEmpresa();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [empresaToEdit, setEmpresaToEdit] = useState<Empresa | null>(null);
  
  // Animaciones
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadEmpresas();
  }, [userId]);

  const loadEmpresas = async () => {
    setLoading(true);
    try {
      const data = await empresaService.getAllFromUser(userId);
      setEmpresas(data);
      if (!selectedEmpresa && data.length > 0) {
        setSelectedEmpresa(data[0]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrEdit = (empresa?: Empresa) => {
    setEmpresaToEdit(empresa ?? null);
    setModalVisible(true);
    setDropdownVisible(false);
  };

  const handleDelete = (empresa: Empresa) => {
    Alert.alert('Eliminar Empresa', `¿Eliminar "${empresa.nombreEmpresa}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await empresaService.delete(empresa.id);
            const updated = empresas.filter(e => e.id !== empresa.id);
            setEmpresas(updated);
            if (selectedEmpresa?.id === empresa.id) {
              setSelectedEmpresa(updated[0] ?? null);
            }
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  const handleEmpresaSuccess = (empresa: Empresa) => {
    const exists = empresas.some(e => e.id === empresa.id);
    if (exists) {
      setEmpresas(empresas.map(e => (e.id === empresa.id ? empresa : e)));
    } else {
      setEmpresas([...empresas, empresa]);
    }
    setSelectedEmpresa(empresa);
  };

  const toggleDropdown = () => {
    const newVisible = !dropdownVisible;
    setDropdownVisible(newVisible);
    
    if (newVisible) {
      Animated.parallel([
        Animated.timing(dropdownAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(dropdownAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    toggleDropdown();
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.selector}
        onPress={toggleDropdown}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#6366f1" />
        ) : (
          <>
            <Text style={styles.selectorText}>
              {selectedEmpresa?.nombreEmpresa || 'Seleccionar empresa'}
            </Text>
            <MaterialCommunityIcons
              name={dropdownVisible ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#6366f1"
            />
          </>
        )}
      </TouchableOpacity>

      <Portal>
        {dropdownVisible && (
          <View style={styles.dropdown}>
            <ScrollView style={styles.dropdownScroll} showsVerticalScrollIndicator={false}>
              {empresas.map(empresa => (
                <TouchableOpacity
                  key={empresa.id}
                  style={[
                    styles.empresaItem,
                    selectedEmpresa?.id === empresa.id && styles.selectedEmpresa
                  ]}
                  onPress={() => {
                    setSelectedEmpresa(empresa);
                    setDropdownVisible(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.empresaName,
                      selectedEmpresa?.id === empresa.id && styles.selectedText,
                    ]}
                  >
                    {empresa.nombreEmpresa}
                  </Text>
                  
                  {selectedEmpresa?.id === empresa.id && (
                    <MaterialCommunityIcons name="check" size={18} color="#6366f1" />
                  )}
                </TouchableOpacity>
              ))}

              <TouchableOpacity 
                style={styles.newEmpresaButton} 
                onPress={() => handleCreateOrEdit()}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="plus" size={18} color="#6366f1" />
                <Text style={styles.newEmpresaText}>Nueva Empresa</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
      </Portal>

      <ModalEmpresa
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        userId={userId}
        empresa={empresaToEdit}
        onSuccess={handleEmpresaSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectorText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  dropdown: {
    position: 'absolute',
    top: 180,
    left: 20,
    right: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownScroll: {
    padding: 8,
  },
  empresaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  selectedEmpresa: {
    backgroundColor: '#f1f5f9',
  },
  empresaName: {
    fontSize: 16,
    color: '#1e293b',
  },
  selectedText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  newEmpresaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginTop: 8,
  },
  newEmpresaText: {
    color: '#6366f1',
    fontWeight: '500',
    fontSize: 16,
    marginLeft: 8,
  },
});
