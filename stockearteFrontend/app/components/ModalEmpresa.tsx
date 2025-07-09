import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { empresaService, Empresa, CreateEmpresaDto, UpdateEmpresaDto } from '../../services/api';

interface ModalEmpresaProps {
  visible: boolean;
  onClose: () => void;
  userId: number;
  empresa?: Empresa | null; // Si se pasa, es modo edición
  onSuccess: (empresa: Empresa) => void;
}

export default function ModalEmpresa({
  visible,
  onClose,
  userId,
  empresa,
  onSuccess,
}: ModalEmpresaProps) {
  const [loading, setLoading] = useState(false);
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const isEditing = !!empresa;

  useEffect(() => {
    if (visible) {
      if (isEditing && empresa) {
        setNombreEmpresa(empresa.nombreEmpresa);
        setDescripcion(empresa.descripcion);
      } else {
        setNombreEmpresa('');
        setDescripcion('');
      }
    }
  }, [visible, empresa, isEditing]);

  const handleSave = async () => {
    if (!nombreEmpresa.trim()) {
      Alert.alert('Error', 'El nombre de la empresa es obligatorio');
      return;
    }

    setLoading(true);
    try {
      let empresaResult: Empresa;

      if (isEditing && empresa) {
        // Modo edición
        empresaResult = await empresaService.update(empresa.id, {
          nombreEmpresa: nombreEmpresa.trim(),
          descripcion: descripcion.trim(),
        });
      } else {
        // Modo creación
        empresaResult = await empresaService.create(userId, {
          nombreEmpresa: nombreEmpresa.trim(),
          descripcion: descripcion.trim(),
        });
      }

      onSuccess(empresaResult);
      onClose();
      
      Alert.alert(
        'Éxito', 
        isEditing ? 'Empresa actualizada correctamente' : 'Empresa creada correctamente'
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setNombreEmpresa('');
    setDescripcion('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {isEditing ? 'Editar Empresa' : 'Crear Nueva Empresa'}
            </Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.formSection}>
              <Text style={styles.label}>Nombre de la empresa *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingresa el nombre de tu empresa"
                value={nombreEmpresa}
                onChangeText={setNombreEmpresa}
                maxLength={100}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Descripción (opcional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe tu empresa..."
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {isEditing ? 'Actualizar' : 'Crear'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
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
    padding: 20,
  },
  formSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  button: {
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