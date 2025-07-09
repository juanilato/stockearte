import { useState } from 'react';
import { estadisticasService } from '../../../services/api';
import { useEmpresa } from '../../../context/EmpresaContext';

export const useVentasMensuales = () => {
  const [ventasMensuales, setVentasMensuales] = useState<{ mes: string; total: number }[]>([]);
  const { selectedEmpresa } = useEmpresa();

  const cargarVentasMensuales = async () => {
    try {
      if (!selectedEmpresa) {
        console.error('No hay empresa seleccionada');
        return;
      }

      const stats = await estadisticasService.getByEmpresa(selectedEmpresa.id);
      setVentasMensuales(stats.ventasMensuales);
    } catch (error) {
      console.error('Error al cargar ventas mensuales:', error);
    }
  };

  return {
    ventasMensuales,
    cargarVentasMensuales,
  };
}; 