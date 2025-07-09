import { useEffect, useState, useCallback } from 'react';
import { empresaService, materialService, Material } from '../../../services/api';

export const useMateriales = (empresaId?: number) => {
  const [materiales, setMateriales] = useState<Material[]>([]);  // Materiales de material 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [creatingMaterial, setCreatingMaterial] = useState(false);

  const cargarMateriales = useCallback(async () => {

    // Si no existe empresa cargada vuelve la carga
    if (!empresaId) {
     
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      // Se intentan obtener todos los materiales de la empresaId y se setean 
      const data = await empresaService.getAllMaterials(empresaId);
     
      setMateriales(data);
    } catch (err: any) {
     
      setError(err.message || 'Error al cargar materiales');
      setMateriales([]);
    } finally {
      setLoading(false);
    
    }
  }, [empresaId]);

  // Creación de material, crea material y muestra localmente un material previo a la creación real del mismo
  // Una vez creado, la devolucion 
  const crearMaterialOptimista = useCallback(async (materialData: Omit<Material, 'id'>) => {
    if (!empresaId) return { success: false, message: 'No hay empresa seleccionada' };
    
    // Generar ID temporal negativo para identificar el material optimista
    const tempId = -Date.now();
    const materialOptimista: Material = {
      ...materialData,
      id: tempId,
      empresaId,
    };

    // Agregar inmediatamente al estado local
    setMateriales(prev => [materialOptimista, ...prev]);
    setCreatingMaterial(true);

    try {
      // Llamar al backend
      const materialReal = await materialService.create(materialData);
      
      // Reemplazar el material optimista con el real
      setMateriales(prev => 
        prev.map(m => m.id === tempId ? materialReal : m)
      );
      
      setCreatingMaterial(false);
      return { success: true, message: 'Material creado exitosamente' };
    } catch (error: any) {
      // Si falla, remover el material optimista
      setMateriales(prev => prev.filter(m => m.id !== tempId));
      setCreatingMaterial(false);
      return { success: false, message: error.message || 'Error al crear material' };
    }
  }, [empresaId]);

  // Hook para material y variante creación.
  const crearMaterialYVariante = useCallback(async (data: {
    material: Omit<Material, 'id'>;
    productoId: number;
    varianteNombre: string;
    varianteStock: number;
    varianteCodigoBarras?: string;
  }) => {
    if (!empresaId) return { success: false, message: 'No hay empresa seleccionada' };
    
    // Generar ID temporal negativo para identificar el material optimista
    const tempId = -Date.now();
    const materialOptimista: Material = {
      ...data.material,
      id: tempId,
      empresaId,
    };

    // Agregar inmediatamente al estado local
    setMateriales(prev => [materialOptimista, ...prev]);
    setCreatingMaterial(true);

    try {
      // Llamar al backend
      const result = await materialService.createMaterialAndVariante({
        ...data,
        material: { ...data.material, empresaId },
      });
      
      // Reemplazar el material optimista con el real
      setMateriales(prev => 
        prev.map(m => m.id === tempId ? result.material : m)
      );
      
      setCreatingMaterial(false);
      return { 
        success: true, 
        message: 'Material y variante creados exitosamente',
        material: result.material,
        variante: result.variante,
      };
    } catch (error: any) {
      // Si falla, remover el material optimista
      setMateriales(prev => prev.filter(m => m.id !== tempId));
      setCreatingMaterial(false);
      return { success: false, message: error.message || 'Error al crear material y variante' };
    }
  }, [empresaId]);

  // Actualiza material primeramente en local, luego en backend y actualiza el objeto 
  const actualizarMaterial = useCallback(async (id: number, materialData: Partial<Material>) => {
    // Actualizar inmediatamente el estado local
    setMateriales(prev => 
      prev.map(m => m.id === id ? { ...m, ...materialData } : m)
    );

    try {
      // Llamar al backend
      const materialActualizado = await materialService.update(id, materialData);
      
      // Reemplazar con la respuesta real del backend
      setMateriales(prev => 
        prev.map(m => m.id === id ? materialActualizado : m)
      );
      
      return { success: true, message: 'Material actualizado exitosamente' };
    } catch (error: any) {
      // Si falla, revertir el estado local
      setMateriales(prev => 
        prev.map(m => m.id === id ? m : m)
      );
      return { success: false, message: error.message || 'Error al actualizar material' };
    }
  }, []);

  // Eliminación de material, se envia el id del material a eliminar y se elimina, se setea localmente borrando el material eliminado 
  const eliminarMaterial = useCallback(async (id: number) => {
    try {
      await materialService.delete(id);
      setMateriales(prev => prev.filter(m => m.id !== id));
      return { success: true, message: 'Material eliminado exitosamente' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al eliminar material' };
    }
  }, []);

  // si existe Empresa id, realiza carga inicial de materiales (espera a empresaId definido)
  useEffect(() => {
    if (empresaId) {
      cargarMateriales();
    }
  }, [empresaId, cargarMateriales]);

  return {
    materiales,
    cargarMateriales,
    crearMaterialOptimista,
    crearMaterialYVariante,
    actualizarMaterial,
    eliminarMaterial,
    loading,
    creatingMaterial,
    error,
  };
}; 