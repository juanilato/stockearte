import { useState } from 'react';
import { estadisticasService } from '../../../services/api';
import { useEmpresa } from '../../../context/EmpresaContext';

export const useProductosCriticos = () => {
  const [productosCriticos, setProductosCriticos] = useState<{ id: number; nombre: string; stock: number }[]>([]);
  const [mostrarStockCritico, setMostrarStockCritico] = useState(false);
  const { selectedEmpresa } = useEmpresa();

  const cargarProductosCriticos = async () => {
    try {
      if (!selectedEmpresa) {
        console.error('No hay empresa seleccionada');
        return;
      }

      const stats = await estadisticasService.getByEmpresa(selectedEmpresa.id);
      setProductosCriticos(stats.productosCriticos);
    } catch (error) {
      console.error("❌ Error al obtener productos críticos:", error);
    }
  };

  return {
    productosCriticos,
    mostrarStockCritico,
    setMostrarStockCritico,
    cargarProductosCriticos,
  };
}; 