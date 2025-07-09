import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Animated, FlatList, Keyboard, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, Alert } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { borderRadius, colors, shadows, spacing, typography } from '../styles/theme';
import { useEmpresa } from '../../context/EmpresaContext';
import { useMateriales } from '../materiales/hooks/useMateriales';
import { useModalMaterial } from '../materiales/hooks/useModalMaterial';
import ModalMaterial from '../materiales/components/ModalMaterial';

export default function MaterialesView() {
  const { selectedEmpresa } = useEmpresa();
  const { 
    materiales, 
    cargarMateriales, 
    crearMaterialOptimista,
    eliminarMaterial,
    loading, 
    creatingMaterial,
    error 
  } = useMateriales(selectedEmpresa?.id);
  const {
    modalVisible,
    materialSeleccionado,
    abrirModal,
    cerrarModal,
    guardarMaterial,
  } = useModalMaterial(crearMaterialOptimista);

  // Animaciones (pueden mantenerse igual)
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const renderMaterial = ({ item }: { item: any }) => {
    const renderRightActions = () => (
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#10b981' }]}
          onPress={() => abrirModal(item)}
          disabled={creatingMaterial}
        >
          <MaterialCommunityIcons name="pencil" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
          onPress={() => eliminarMaterial(item.id)}
          disabled={creatingMaterial}
        >
          <MaterialCommunityIcons name="delete" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
    return (
      <Swipeable key={item.id} renderRightActions={renderRightActions} overshootRight={false}>
        <View style={styles.materialItem}>
          <View style={styles.materialHeader}>
            <Text style={styles.materialNombre}>{item.nombre}</Text>
            {/* Mostrar indicador si es material optimista (ID negativo) */}
            {item.id && item.id < 0 && (
              <View style={{ backgroundColor: '#fbbf24', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                <Text style={{ fontSize: 12, color: '#92400e' }}>Guardando...</Text>
              </View>
            )}
          </View>
          <View style={styles.materialDetalles}>
            <View style={styles.detalleItem}>
              <Text style={styles.detalleLabel}>Precio:</Text>
              <Text style={styles.detalleValor}>${item.precioCosto}</Text>
            </View>
            <View style={styles.detalleItem}>
              <Text style={styles.detalleLabel}>Unidad:</Text>
              <Text style={styles.detalleValor}>{item.unidad}</Text>
            </View>
            <View style={styles.detalleItem}>
              <Text style={styles.detalleLabel}>Stock:</Text>
              <Text style={[styles.detalleValor, item.stock <= 10 ? styles.lowStock : null]}>
                {item.stock} unidades
              </Text>
            </View>
          </View>
        </View>
      </Swipeable>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🛠️ Materiales</Text>
          <TouchableOpacity
            style={[styles.addButton, creatingMaterial && { opacity: 0.5 }]}
            onPress={() => abrirModal()}
            activeOpacity={0.7}
            disabled={creatingMaterial}
          >
            <MaterialCommunityIcons name="plus" size={20} color={colors.white} />
            <Text style={styles.addButtonText}>Nuevo</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={styles.emptyStateText}>Cargando materiales...</Text>
            </View>
          ) : error ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={styles.emptyStateText}>Error: {error}</Text>
            </View>
          ) : (
            <FlatList
              data={materiales}
              renderItem={renderMaterial}
              keyExtractor={(item) => item.id?.toString() || ''}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.md }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No hay materiales registrados
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </Animated.View>
      {/* Modal de crear/editar material */}
      <ModalMaterial
        visible={modalVisible}
        material={materialSeleccionado}
        onClose={cerrarModal}
        onSubmit={(nombre, precioCosto, unidad, stock) =>
          guardarMaterial(nombre, precioCosto, unidad, stock, selectedEmpresa?.id)
        }
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyStateText: {
    fontSize: typography.sizes.lg,
    color: colors.gray[500],
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.gray[800],
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  materialItem: {
  backgroundColor: '#f8fafc', // gris muy claro
  padding: 16,

  borderColor: '#e2e8f0',
  borderWidth: 1,

  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 3,

},

materialNombre: {
  fontSize: 18,
  fontWeight: '600',
  color: '#0f172a', // gris oscuro
  marginBottom: 4,
},

materialDetalles: {
  flexDirection: 'row',
  flexWrap: 'wrap',

},

detalleItem: {
  flexDirection: 'row',
  gap: 4,
},

detalleLabel: {
  fontSize: 14,
  color: '#64748b', // gris medio
},

detalleValor: {
  fontSize: 14,
  color: '#0f172a',
  fontWeight: '500',
},

lowStock: {
  color: '#dc2626', // rojo intenso
},

  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: '100%',
    
    marginBottom: spacing.md,
    ...shadows.md,

  },
    
  addButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },

  materialAcciones: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  editButton: {
    backgroundColor: colors.info,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    width: '90%',
    maxWidth: 400,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalBody: {
    padding: spacing.lg,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.gray[800],
  },
  closeButton: {
    padding: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.lg,
    backgroundColor: colors.white,
    color: colors.gray[800],
    marginBottom: spacing.md,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  modalButtonPrimary: {
    backgroundColor: colors.primary,
  },
  modalButtonSecondary: {
    backgroundColor: colors.gray[100],
  },
  modalButtonText: {
    color: colors.white,
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
  modalButtonTextSecondary: {
    color: colors.gray[700],
  },
}); 