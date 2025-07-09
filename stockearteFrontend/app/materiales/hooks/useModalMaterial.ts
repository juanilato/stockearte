import { useState } from 'react';
import { Alert } from 'react-native';
import { Material } from '../../../services/api';

export const useModalMaterial = (
  crearMaterialOptimista: (materialData: Omit<Material, 'id'>) => Promise<{ success: boolean; message: string }>,
  actualizarMaterial: (id: number, materialData: Partial<Material>) => Promise<{ success: boolean; message: string }>
) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [materialSeleccionado, setMaterialSeleccionado] = useState<Material | null>(null);

  const abrirModal = (material?: Material) => {
    setMaterialSeleccionado(material || null);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setMaterialSeleccionado(null);
  };

  const guardarMaterial = async (nombre: string, precioCosto: string, unidad: string, stock: string, empresaId?: number) => {
    if (!nombre || !precioCosto || !unidad || !stock) {
      return { success: false, message: 'Todos los campos son obligatorios' };
    }

    try {
      if (materialSeleccionado) {
        // Es una edición
        const materialData: Partial<Material> = {
          nombre,
          precioCosto: parseFloat(precioCosto),
          unidad,
          stock: parseFloat(stock),
        };

        const result = await actualizarMaterial(materialSeleccionado.id!, materialData);
        return result;
      } else {
        // Es una creación
        const materialData: Omit<Material, 'id'> = {
          nombre,
          precioCosto: parseFloat(precioCosto),
          unidad,
          stock: parseFloat(stock),
          empresaId,
        };

        const result = await crearMaterialOptimista(materialData);
        return result;
      }
    } catch (error) {
      console.error('Error al guardar el material:', error);
      return { success: false, message: 'Error al guardar el material' };
    }
  };

  return {
    modalVisible,
    materialSeleccionado,
    abrirModal,
    cerrarModal,
    guardarMaterial,
  };
}; 