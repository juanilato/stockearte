import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
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

  return (
    <View>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setDropdownVisible(!dropdownVisible)}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#3b82f6" />
        ) : (
          <>
            <Text style={styles.selectorText}>
              {selectedEmpresa?.nombreEmpresa || 'Seleccionar empresa'}
            </Text>
            <MaterialCommunityIcons
              name={dropdownVisible ? 'chevron-up' : 'chevron-down'}
              size={22}
              color="#3b82f6"
            />
          </>
        )}
      </TouchableOpacity>

      <Portal>
        {dropdownVisible && (
          <View style={styles.dropdown}>
            {empresas.map(empresa => (
              <View key={empresa.id} style={styles.dropdownItem}>
                <TouchableOpacity
                  style={styles.dropdownTouchable}
                  onPress={() => {
                    setSelectedEmpresa(empresa);
                    setDropdownVisible(false);
                  }}
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
                    <MaterialCommunityIcons name="check" size={18} color="#3b82f6" />
                  )}
                </TouchableOpacity>

                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => handleCreateOrEdit(empresa)}>
                    <MaterialCommunityIcons name="pencil" size={18} color="#64748b" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(empresa)}>
                    <MaterialCommunityIcons name="delete" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.newButton} onPress={() => handleCreateOrEdit()}>
              <MaterialCommunityIcons name="plus" size={18} color="#3b82f6" />
              <Text style={styles.newText}>Nueva Empresa</Text>
            </TouchableOpacity>
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
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  selectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  dropdown: {
    position: 'absolute',
    top: 180,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'grey',
    padding: 12,
    zIndex: 9999,
    elevation: 10,
    maxHeight: 400,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
  },
  dropdownTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  empresaName: {
    fontSize: 15,
    color: '#1e293b',
  },
  selectedText: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginLeft: 12,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    justifyContent: 'center',
    gap: 8,
  },
  newText: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 16,
  },
});
