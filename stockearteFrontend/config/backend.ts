// Configuración del backend local y endpoints de la API
export const BACKEND_CONFIG = {
  // URL base del backend local (ajustar según IP/puerto de tu backend NestJS)
  BASE_URL: 'http://192.168.101.22:3000/api',
  
  // Endpoints disponibles
  ENDPOINTS: {
    // --- Auth, Usuarios, Empresas, Productos, etc. ---
    // Autenticación
    AUTH: {
      LOGIN: '/auth/login',
      SOCIAL_LOGIN: '/auth/social-login',
      VERIFY: '/auth/verify',
      PROFILE: '/auth/profile',
    },
    
    // Usuarios
    USER: {
      CREATE: '/user',
      GET_ALL: '/user',
      GET_BY_ID: '/user/:id',
      UPDATE: '/user/:id',
      DELETE: '/user/:id',
    },
    
    // Empresas
    COMPANY: {
      CREATE: '/company/:id',
      GET_ALL: '/company',
      GET_BY_ID: '/company/:id',
      GET_ALL_FROM_USER: '/company/all/:id',
      GET_ALL_PRODUCTS: '/company/allProducts/:id',
      GET_ALL_MATERIALS: '/company/allMaterials/:id',
      UPDATE: '/company/:id',
      DELETE: '/company/:id',
    },
    
    // Productos
    PRODUCT: {
      CREATE: '/product',
      GET_ALL: '/product',
      GET_BY_ID: '/product/:id',
      GET_BY_EMPRESA: '/product/empresa/:empresaId',
      GET_BY_BARCODE: '/product/barcode/:codigoBarras',
      UPDATE: '/product/:id',
      DELETE: '/product/:id',
    },
    
    // Materiales
    MATERIAL: {
      CREATE: '/material',
      CREATE_WITH_VARIANTE: '/material/create-with-variante',
      GET_ALL: '/material',
      GET_BY_ID: '/material/:id',
      GET_BY_EMPRESA: '/material/empresa/:empresaId',
      UPDATE: '/material/:id',
      DELETE: '/material/:id',
    },
    
    // Componentes
    COMPONENTE: {
      CREATE: '/componente',
      GET_ALL: '/componente',
      GET_BY_ID: '/componente/:id',
      GET_BY_PRODUCTO: '/componente/producto/:productoId',
      UPDATE: '/componente/:id',
      DELETE: '/componente/:id',
    },
    
    // Variantes
    VARIANTE: {
      CREATE: '/variante',
      GET_ALL: '/variante',
      GET_BY_ID: '/variante/:id',
      GET_BY_PRODUCTO: '/variante/producto/:productoId',
      UPDATE: '/variante/:id',
      DELETE: '/variante/:id',
    },
    
    // Interpretación de voz (POST /api/ia/interpretar-voz)
    INTERPRETAR_VOZ: '/ia/interpretar-voz',
    
    // Interpretación de archivos (POST /api/ia/interpretar)
    INTERPRETAR_ARCHIVO: '/ia/interpretar',
    
    // Estado del modelo de IA
    MODEL_STATUS: '/model-status',
    
    // Descargar modelo
    DOWNLOAD_MODEL: '/download-model',
    
    // Subir archivos
    UPLOAD: '/upload',
    
    // Estadísticas
    ESTADISTICAS: {
      GET_BY_EMPRESA: '/estadisticas/:empresaId',
    },
  },
  // Configuración del modelo (no se usa directamente en frontend, solo informativo)
  MODEL: {
    NAME: 'llama2:13b',
    TEMPERATURE: 0.1,
    MAX_TOKENS: 1000
  }
};

// Devuelve la URL completa para un endpoint
export const getBackendUrl = (endpoint: string): string => {
  return `${BACKEND_CONFIG.BASE_URL}${endpoint}`;
};

// Chequea si el backend está disponible y responde
export const checkBackendStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(getBackendUrl('/model-status'));
    const data = await response.json();
    return data.available === true;
  } catch (error) {
    console.error('Error verificando backend:', error);
    return false;
  }
};

// Hace una petición genérica al backend (usado internamente)
export const backendRequest = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<any> => {
  const url = getBackendUrl(endpoint);
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };
  try {
    const response = await fetch(url, defaultOptions);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error en petición a ${endpoint}:`, error);
    throw error;
  }
};

// Llama al endpoint de interpretación de voz (POST /api/interpretar-voz)
// Recibe: texto (string), productos (array)
// Devuelve: respuesta de la IA interpretando el pedido de voz
export const interpretarVoz = async (texto: string, productos: any[]): Promise<any> => {
  return backendRequest(BACKEND_CONFIG.ENDPOINTS.INTERPRETAR_VOZ, {
    method: 'POST',
    body: JSON.stringify({ texto, productos }),
  });
};

// Llama al endpoint de interpretación de archivos (POST /api/interpretar)
// Recibe: archivo (File/Blob)
// Devuelve: respuesta de la IA interpretando el archivo
export const interpretarArchivo = async (file: any): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  const url = getBackendUrl(BACKEND_CONFIG.ENDPOINTS.INTERPRETAR_ARCHIVO);
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}; 