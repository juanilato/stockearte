import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { empresaService, Empresa } from '../../services/api';
import ModalEmpresa from './ModalEmpresa';

interface ModalGestionEmpresasProps {
  visible: boolean;
  onClose: () => void;
  userId: number;
  onEmpresaChange?: (empresa: Empresa) => void;
}

export default function ModalGestionEmpresas({
  visible,
  onClose,
  userId,
  onEmpresaChange,
}: ModalGestionEmpresasProps) {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalEmpresaVisible, setModalEmpresaVisible] = useState(false);
  const [empresaToEdit, setEmpresaToEdit] = useState<Empresa | null>(null);

  useEffect(() => {
    if (visible) {
      loadEmpresas();
    }
  }, [visible, userId]);

  const loadEmpresas = async () => {
    setLoading(true);
    try {
      const empresasData = await empresaService.getAllFromUser(userId);
      setEmpresas(empresasData);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar las empresas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmpresa = () => {
    setEmpresaToEdit(null);
    setModalEmpresaVisible(true);
  };

  const handleEditEmpresa = (empresa: Empresa) => {
    setEmpresaToEdit(empresa);
    setModalEmpresaVisible(true);
  };

  const handleDeleteEmpresa = (empresa: Empresa) => {
    Alert.alert(
      'Eliminar Empresa',
      `¿Estás seguro de que quieres eliminar "${empresa.nombreEmpresa}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await empresaService.delete(empresa.id);
              setEmpresas(empresas.filter(emp => emp.id !== empresa.id));
              Alert.alert('Éxito', 'Empresa eliminada correctamente');
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleEmpresaSuccess = (empresa: Empresa) => {
    // Si es una nueva empresa, agregarla a la lista
    if (!empresas.find(emp => emp.id === empresa.id)) {
      setEmpresas([...empresas, empresa]);
    } else {
      // Si es una empresa editada, actualizarla en la lista
      setEmpresas(empresas.map(emp => 
        emp.id === empresa.id ? empresa : emp
      ));
    }
    
    // Si hay callback para cambiar empresa, llamarlo
    if (onEmpresaChange) {
      onEmpresaChange(empresa);
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Gestionar Empresas</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#3b82f6" />
                  <Text style={styles.loadingText}>Cargando empresas...</Text>
                </View>
              ) : (
                <>
                  <View style={styles.empresasHeader}>
                    <Text style={styles.empresasTitle}>
                      Mis Empresas ({empresas.length})
                    </Text>
                    <TouchableOpacity
                      style={styles.createButton}
                      onPress={handleCreateEmpresa}
                    >
                      <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                      <Text style={styles.createButtonText}>Nueva</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.empresasList}>
                    {empresas.length === 0 ? (
                      <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="office-building" size={48} color="#94a3b8" />
                        <Text style={styles.emptyText}>No tienes empresas registradas</Text>
                        <Text style={styles.emptySubtext}>Crea tu primera empresa para comenzar</Text>
                        <TouchableOpacity
                          style={styles.createFirstButton}
                          onPress={handleCreateEmpresa}
                        >
                          <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                          <Text style={styles.createFirstButtonText}>Crear Primera Empresa</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      empresas.map((empresa) => (
                        <View key={empresa.id} style={styles.empresaItem}>
                          <View style={styles.empresaInfo}>
                            <Text style={styles.empresaNombre}>{empresa.nombreEmpresa}</Text>
                            {empresa.descripcion && (
                              <Text style={styles.empresaDescripcion} numberOfLines={2}>
                                {empresa.descripcion}
                              </Text>
                            )}
                            <Text style={styles.empresaFecha}>
                              ID: {empresa.id}
                            </Text>
                          </View>
                          
                          <View style={styles.empresaActions}>
                            <TouchableOpacity
                              style={styles.actionButton}
                              onPress={() => handleEditEmpresa(empresa)}
                            >
                              <MaterialCommunityIcons name="pencil" size={18} color="#3b82f6" />
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                              style={[styles.actionButton, styles.deleteButton]}
                              onPress={() => handleDeleteEmpresa(empresa)}
                            >
                              <MaterialCommunityIcons name="delete" size={18} color="#ef4444" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))
                    )}
                  </ScrollView>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <ModalEmpresa
        visible={modalEmpresaVisible}
        onClose={() => setModalEmpresaVisible(false)}
        userId={userId}
        empresa={empresaToEdit}
        onSuccess={handleEmpresaSuccess}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 16,
  },
  empresasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  empresasTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
  empresasList: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 24,
    textAlign: 'center',
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  empresaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  empresaInfo: {
    flex: 1,
    marginRight: 12,
  },
  empresaNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  empresaDescripcion: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  empresaFecha: {
    fontSize: 12,
    color: '#94a3b8',
  },
  empresaActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
  },
}); 