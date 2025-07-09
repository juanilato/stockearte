import React, { createContext, useContext, useState, useEffect } from 'react';
import { Empresa } from '../services/api';
import { useAuth } from './AuthContext';
import { empresaService } from '../services/api';

interface EmpresaContextType {
  selectedEmpresa: Empresa | null;
  setSelectedEmpresa: (empresa: Empresa | null) => void;
  empresas: Empresa[];
  loading: boolean;
  error: string | null;
  refreshEmpresas: () => Promise<void>;
}

const EmpresaContext = createContext<EmpresaContextType | undefined>(undefined);

export const useEmpresa = () => {
  const context = useContext(EmpresaContext);
  if (context === undefined) {
    throw new Error('useEmpresa must be used within an EmpresaProvider');
  }
  return context;
};

interface EmpresaProviderProps {
  children: React.ReactNode;
}

export const EmpresaProvider: React.FC<EmpresaProviderProps> = ({ children }) => {
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const refreshEmpresas = async () => {
    if (!user?.id) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const empresasData = await empresaService.getAllFromUser(user.id);
      setEmpresas(empresasData);
      
      // Si no hay empresa seleccionada y hay empresas disponibles, seleccionar la primera
      if (!selectedEmpresa && empresasData.length > 0) {
        setSelectedEmpresa(empresasData[0]);
      }
      
      // Si la empresa seleccionada ya no existe, limpiar la selección
      if (selectedEmpresa && !empresasData.find(emp => emp.id === selectedEmpresa.id)) {
        setSelectedEmpresa(empresasData.length > 0 ? empresasData[0] : null);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar empresas');
    } finally {
      setLoading(false);
    }
  };

  // Cargar empresas cuando cambie el usuario
  useEffect(() => {
    if (user?.id) {
      refreshEmpresas();
    } else {
      setEmpresas([]);
      setSelectedEmpresa(null);
    }
  }, [user?.id]);

  const value: EmpresaContextType = {
    selectedEmpresa,
    setSelectedEmpresa,
    empresas,
    loading,
    error,
    refreshEmpresas,
  };



  return (
    <EmpresaContext.Provider value={value}>
      {children}
    </EmpresaContext.Provider>
  );
}; 