import { useState } from 'react';
import { Material, materialService} from '../../../services/api';


// Actualización de precios Varios en Materiales
export const useActualizacionPrecios = () => {
  const [isLoading, setIsLoading] = useState(false);

  
  const actualizarPreciosMateriales = async (materialesActualizados: Material[]): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    
    try {
      // Actualizar cada material individualmente
      const promesas = materialesActualizados.map(material => 
        materialService.update(material.id!, material)
      );
      
      await Promise.all(promesas);
      
      return {
        success: true,
        message: `${materialesActualizados.length} precios actualizados correctamente`
      };
    } catch (error) {
      console.error('Error al actualizar precios:', error);
      return {
        success: false,
        message: 'Error al actualizar los precios'
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    actualizarPreciosMateriales,
    isLoading
  };
}; 