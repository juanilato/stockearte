// Hook para la gestión de variantes de productos: obtención, creación, edición y eliminación de variantes.
// Centraliza la lógica de variantes para reutilización en componentes.
import { useCallback, useState } from 'react';
import { VarianteProducto, varianteService, CreateVarianteDto, UpdateVarianteDto } from '../../../services/api';

export const useVariantes = (productoId?: number) => {
  const [variantes, setVariantes] = useState<VarianteProducto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarVariantes = useCallback(async () => {
    if (!productoId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await varianteService.getByProducto(productoId);
      setVariantes(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar variantes');
      setVariantes([]);
    } finally {
      setLoading(false);
    }
  }, [productoId]);

  const crearVariante = useCallback(async (varianteData: CreateVarianteDto) => {
    setLoading(true);
    setError(null);
    try {
      const nuevaVariante = await varianteService.create(varianteData);
      setVariantes(prev => [...prev, nuevaVariante]);
      return { success: true, message: 'Variante creada exitosamente' };
    } catch (err: any) {
      setError(err.message || 'Error al crear variante');
      return { success: false, message: err.message || 'Error al crear variante' };
    } finally {
      setLoading(false);
    }
  }, []);

  const actualizarVariante = useCallback(async (id: number, varianteData: UpdateVarianteDto) => {
    setLoading(true);
    setError(null);
    try {
      const varianteActualizada = await varianteService.update(id, varianteData);
      setVariantes(prev => prev.map(v => v.id === id ? varianteActualizada : v));
      return { success: true, message: 'Variante actualizada exitosamente' };
    } catch (err: any) {
      setError(err.message || 'Error al actualizar variante');
      return { success: false, message: err.message || 'Error al actualizar variante' };
    } finally {
      setLoading(false);
    }
  }, []);

  const eliminarVariante = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await varianteService.delete(id);
      setVariantes(prev => prev.filter(v => v.id !== id));
      return { success: true, message: 'Variante eliminada exitosamente' };
    } catch (err: any) {
      setError(err.message || 'Error al eliminar variante');
      return { success: false, message: err.message || 'Error al eliminar variante' };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    variantes,
    cargarVariantes,
    crearVariante,
    actualizarVariante,
    eliminarVariante,
    loading,
    error,
  };
}; 