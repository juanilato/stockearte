import axios from 'axios';
import { BACKEND_CONFIG } from '../config/backend';

// Tipos para Empresa
export interface Empresa {
  id: number;
  nombreEmpresa: string;
  descripcion: string;
  usuarioId: number;
}

export interface CreateEmpresaDto {
  nombreEmpresa: string;
  descripcion: string;
}

export interface UpdateEmpresaDto {
  nombreEmpresa?: string;
  descripcion?: string;
}

// Tipos para Producto
export interface Producto {
  id?: number;
  nombre: string;
  precioCosto: number;
  precioVenta: number;
  stock: number;
  codigoBarras?: string;
  empresaId?: number;
  variantes?: VarianteProducto[];
  componentes?: ComponenteProducto[];
}

export interface VarianteProducto {
  id?: number;
  productoId: number;
  nombre: string;
  stock: number;
  codigoBarras?: string;
}

export interface ComponenteProducto {
  id?: number;
  productoId: number;
  materialId: number;
  cantidad: number;
  material?: Material;
}

export interface CreateComponenteDto {
  productoId: number;
  materialId: number;
  cantidad: number;
}

export interface UpdateComponenteDto {
  cantidad?: number;
}

export interface CreateVarianteDto {
  productoId: number;
  nombre: string;
  stock: number;
  codigoBarras?: string;
}

export interface UpdateVarianteDto {
  nombre?: string;
  stock?: number;
  codigoBarras?: string;
}

export interface Material {
  id?: number;
  nombre: string;
  precioCosto: number;
  unidad: string;
  stock: number;
  empresaId?: number;
}

export interface CreateProductoDto {
  nombre: string;
  precioCosto: number;
  precioVenta: number;
  stock: number;
  codigoBarras?: string;
  empresaId: number;
}

export interface UpdateProductoDto {
  nombre?: string;
  precioCosto?: number;
  precioVenta?: number;
  stock?: number;
  codigoBarras?: string;
  empresaId?: number;
}

// Configurar axios con interceptores para autenticación
const api = axios.create({
  baseURL: BACKEND_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  async (config) => {
    const token = await import('@react-native-async-storage/async-storage').then(
      AsyncStorage => AsyncStorage.default.getItem('auth_token')
    );
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.default.removeItem('auth_token');
      await AsyncStorage.default.removeItem('user_data');
    }
    return Promise.reject(error);
  }
);

// Tipos para Estadísticas
export interface EstadisticasResponse {
  ventasTotales: number;
  productosVendidos: number;
  gananciaTotal: number;
  productosMasVendidos: {
    nombre: string;
    cantidad: number;
  }[];
  stockTotal: number;
  productosStockCritico: number;
  gananciaMesActual: number;
  productoMasRentable: {
    nombre: string;
    rentabilidad: number;
  } | null;
  ganancias: {
    dia: number;
    mes: number;
    anio: number;
  };
  ventasMensuales: {
    mes: string;
    total: number;
  }[];
  productosCriticos: {
    id: number;
    nombre: string;
    stock: number;
  }[];
}

// Servicios de Estadísticas
export const estadisticasService = {
  // Obtener estadísticas por empresa
  async getByEmpresa(empresaId: number): Promise<EstadisticasResponse> {
    try {
      const endpoint = BACKEND_CONFIG.ENDPOINTS.ESTADISTICAS.GET_BY_EMPRESA.replace(':empresaId', empresaId.toString());
      const response = await api.get(endpoint);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  },
};

// Servicios de Empresa
export const empresaService = {
  // Crear empresa para un usuario
  async create(userId: number, empresaData: CreateEmpresaDto): Promise<Empresa> {
    try {
      const response = await api.post(BACKEND_CONFIG.ENDPOINTS.COMPANY.CREATE.replace(':id', userId.toString()), empresaData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear empresa');
    }
  },

  // Obtener todas las empresas de un usuario
  async getAllFromUser(userId: number): Promise<Empresa[]> {
    try {
      const endpoint = BACKEND_CONFIG.ENDPOINTS.COMPANY.GET_ALL_FROM_USER.replace(':id', userId.toString());
      console.log('=== API DEBUG ===');
      console.log('Endpoint completo:', BACKEND_CONFIG.BASE_URL + endpoint);
      console.log('UserId:', userId);
      
      const response = await api.get(endpoint);
      console.log('Respuesta exitosa:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('=== API ERROR ===');
      console.error('Error en getAllFromUser:', error);
      console.error('Response:', error.response);
      throw new Error(error.response?.data?.message || 'Error al obtener empresas');
    }
  },

  // Obtener una empresa específica
  async getById(empresaId: number): Promise<Empresa> {
    try {
      const response = await api.get(BACKEND_CONFIG.ENDPOINTS.COMPANY.GET_BY_ID.replace(':id', empresaId.toString()));
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener empresa');
    }
  },

  // Actualizar empresa
  async update(empresaId: number, empresaData: UpdateEmpresaDto): Promise<Empresa> {
    try {
      const response = await api.patch(BACKEND_CONFIG.ENDPOINTS.COMPANY.UPDATE.replace(':id', empresaId.toString()), empresaData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar empresa');
    }
  },

  // Eliminar empresa
  async delete(empresaId: number): Promise<void> {
    try {
      await api.delete(BACKEND_CONFIG.ENDPOINTS.COMPANY.DELETE.replace(':id', empresaId.toString()));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar empresa');
    }
  },

  // Obtener todos los productos de una empresa
  async getAllProducts(empresaId: number): Promise<any[]> {
    try {
      const response = await api.get(BACKEND_CONFIG.ENDPOINTS.COMPANY.GET_ALL_PRODUCTS.replace(':id', empresaId.toString()));
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener productos');
    }
  },

  // Obtener todos los materiales de una empresa
  async getAllMaterials(empresaId: number): Promise<any[]> {
    console.log('🌐 API: getAllMaterials llamada con empresaId:', empresaId);
    try {
      const endpoint = BACKEND_CONFIG.ENDPOINTS.COMPANY.GET_ALL_MATERIALS.replace(':id', empresaId.toString());
      console.log('🌐 API: Endpoint completo:', BACKEND_CONFIG.BASE_URL + endpoint);
      
      const response = await api.get(endpoint);
      console.log('✅ API: Respuesta exitosa:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ API: Error en getAllMaterials:', error);
      console.error('❌ API: Response:', error.response);
      throw new Error(error.response?.data?.message || 'Error al obtener materiales');
    }
  },
};

// Servicios de Usuario
export const userService = {
  // Cambiar contraseña
  async changePassword(userId: number, passwordData: { currentPassword: string; newPassword: string }): Promise<void> {
    try {
      await api.patch(BACKEND_CONFIG.ENDPOINTS.USER.UPDATE.replace(':id', userId.toString()), {
        prevPassword: passwordData.currentPassword,
        password: passwordData.newPassword,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al cambiar contraseña');
    }
  },

  // Actualizar API key
  async updateApiKey(userId: number, apiKeyData: { apikeys: string[] }): Promise<void> {
    try {
      await api.patch(BACKEND_CONFIG.ENDPOINTS.USER.UPDATE.replace(':id', userId.toString()), apiKeyData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar API key');
    }
  },
};

// Servicios de Producto
export const productoService = {
  // Crear producto
  async create(productoData: CreateProductoDto): Promise<Producto> {

    try {
      const response = await api.post(BACKEND_CONFIG.ENDPOINTS.PRODUCT.CREATE, productoData);

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear producto');
    }
  },

  // Obtener todos los productos
  async getAll(): Promise<Producto[]> {
    try {
      const response = await api.get(BACKEND_CONFIG.ENDPOINTS.PRODUCT.GET_ALL);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener productos');
    }
  },

  // Obtener todos los productos de una empresa
  async getAllByEmpresa(empresaId: number): Promise<Producto[]> {
    console.log('🌐 API: getAllByEmpresa llamada con empresaId:', empresaId);
    try {
      const endpoint = BACKEND_CONFIG.ENDPOINTS.PRODUCT.GET_BY_EMPRESA.replace(':empresaId', empresaId.toString());
      console.log('🌐 API: Endpoint completo:', BACKEND_CONFIG.BASE_URL + endpoint);
      
      const response = await api.get(endpoint);
      console.log('✅ API: Respuesta exitosa:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ API: Error en getAllByEmpresa:', error);
      console.error('❌ API: Response:', error.response);
      throw new Error(error.response?.data?.message || 'Error al obtener productos de la empresa');
    }
  },

  // Obtener producto por ID
  async getById(productoId: number): Promise<Producto> {
    try {
      const response = await api.get(BACKEND_CONFIG.ENDPOINTS.PRODUCT.GET_BY_ID.replace(':id', productoId.toString()));
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener producto');
    }
  },

  // Obtener producto por código de barras
  async getByBarcode(codigoBarras: string): Promise<Producto | null> {
    try {
      const response = await api.get(BACKEND_CONFIG.ENDPOINTS.PRODUCT.GET_BY_BARCODE.replace(':codigoBarras', codigoBarras));
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(error.response?.data?.message || 'Error al buscar producto por código de barras');
    }
  },

  // Actualizar producto
  async update(productoId: number, productoData: UpdateProductoDto): Promise<Producto> {
    try {
      const response = await api.patch(BACKEND_CONFIG.ENDPOINTS.PRODUCT.UPDATE.replace(':id', productoId.toString()), productoData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar producto');
    }
  },

  // Eliminar producto
  async delete(productoId: number): Promise<void> {
    try {
      await api.delete(BACKEND_CONFIG.ENDPOINTS.PRODUCT.DELETE.replace(':id', productoId.toString()));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar producto');
    }
  },
};

// Servicios de Material
export const materialService = {
  // Crear material
  async create(materialData: Material): Promise<Material> {
    try {
      const response = await api.post(BACKEND_CONFIG.ENDPOINTS.MATERIAL.CREATE, materialData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear material');
    }
  },

  // Crear material y asignarlo como variante a un producto
  async createMaterialAndVariante(data: {
    material: Material;
    productoId: number;
    varianteNombre: string;
    varianteStock: number;
    varianteCodigoBarras?: string;
  }): Promise<{ material: Material; variante: VarianteProducto }> {
    try {
      const response = await api.post(BACKEND_CONFIG.ENDPOINTS.MATERIAL.CREATE_WITH_VARIANTE, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear material y variante');
    }
  },

  // Obtener todos los materiales
  async getAll(): Promise<Material[]> {
    try {
      const response = await api.get(BACKEND_CONFIG.ENDPOINTS.MATERIAL.GET_ALL);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener materiales');
    }
  },

  // Obtener todos los materiales de una empresa
  async getAllByEmpresa(empresaId: number): Promise<Material[]> {
    try {
      const response = await api.get(BACKEND_CONFIG.ENDPOINTS.MATERIAL.GET_BY_EMPRESA.replace(':empresaId', empresaId.toString()));
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener materiales de la empresa');
    }
  },

  // Obtener material por ID
  async getById(materialId: number): Promise<Material> {
    try {
      const response = await api.get(BACKEND_CONFIG.ENDPOINTS.MATERIAL.GET_BY_ID.replace(':id', materialId.toString()));
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener material');
    }
  },

  // Actualizar material
  async update(materialId: number, materialData: Partial<Material>): Promise<Material> {
    try {
      const response = await api.patch(BACKEND_CONFIG.ENDPOINTS.MATERIAL.UPDATE.replace(':id', materialId.toString()), materialData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar material');
    }
  },

  // Eliminar material
  async delete(materialId: number): Promise<void> {
    try {
      await api.delete(BACKEND_CONFIG.ENDPOINTS.MATERIAL.DELETE.replace(':id', materialId.toString()));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar material');
    }
  },
};

// Servicios de Componente
export const componenteService = {
  // Crear componente
  async create(componenteData: CreateComponenteDto): Promise<ComponenteProducto> {
    try {
      const response = await api.post(BACKEND_CONFIG.ENDPOINTS.COMPONENTE.CREATE, componenteData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear componente');
    }
  },

  // Obtener componentes de un producto
  async getByProducto(productoId: number): Promise<ComponenteProducto[]> {
    try {
      const response = await api.get(BACKEND_CONFIG.ENDPOINTS.COMPONENTE.GET_BY_PRODUCTO.replace(':productoId', productoId.toString()));
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener componentes del producto');
    }
  },

  // Obtener componente por ID
  async getById(componenteId: number): Promise<ComponenteProducto> {
    try {
      const response = await api.get(BACKEND_CONFIG.ENDPOINTS.COMPONENTE.GET_BY_ID.replace(':id', componenteId.toString()));
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener componente');
    }
  },

  // Actualizar componente
  async update(componenteId: number, componenteData: UpdateComponenteDto): Promise<ComponenteProducto> {
    try {
      const response = await api.patch(BACKEND_CONFIG.ENDPOINTS.COMPONENTE.UPDATE.replace(':id', componenteId.toString()), componenteData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar componente');
    }
  },

  // Eliminar componente
  async delete(componenteId: number): Promise<void> {
    try {
      await api.delete(BACKEND_CONFIG.ENDPOINTS.COMPONENTE.DELETE.replace(':id', componenteId.toString()));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar componente');
    }
  },
};

// Servicios de Variante
export const varianteService = {
  // Crear variante
  async create(varianteData: CreateVarianteDto): Promise<VarianteProducto> {
    try {
      const response = await api.post(BACKEND_CONFIG.ENDPOINTS.VARIANTE.CREATE, varianteData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear variante');
    }
  },

  // Obtener variantes de un producto
  async getByProducto(productoId: number): Promise<VarianteProducto[]> {
    try {
      const response = await api.get(BACKEND_CONFIG.ENDPOINTS.VARIANTE.GET_BY_PRODUCTO.replace(':productoId', productoId.toString()));
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener variantes del producto');
    }
  },

  // Obtener variante por ID
  async getById(varianteId: number): Promise<VarianteProducto> {
    try {
      const response = await api.get(BACKEND_CONFIG.ENDPOINTS.VARIANTE.GET_BY_ID.replace(':id', varianteId.toString()));
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener variante');
    }
  },

  // Actualizar variante
  async update(varianteId: number, varianteData: UpdateVarianteDto): Promise<VarianteProducto> {
    try {
      const response = await api.patch(BACKEND_CONFIG.ENDPOINTS.VARIANTE.UPDATE.replace(':id', varianteId.toString()), varianteData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar variante');
    }
  },

  // Eliminar variante
  async delete(varianteId: number): Promise<void> {
    try {
      await api.delete(BACKEND_CONFIG.ENDPOINTS.VARIANTE.DELETE.replace(':id', varianteId.toString()));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar variante');
    }
  },
};

// Servicios de Venta
export const saleService = {
  /**
   * Registrar una nueva venta en el backend
   * @param venta - Objeto con los datos de la venta (fecha, totalProductos, precioTotal, ganancia, empresaId?, productos[])
   * @returns La venta creada (incluyendo los productos asociados)
   */
  async create(venta: {
    fecha: string | Date;
    totalProductos: number;
    precioTotal: number;
    ganancia: number;
    empresaId?: number;
    productos: {
      productoId: number;
      cantidad: number;
      precioUnitario: number;
      ganancia: number;
      varianteId?: number;
    }[];
  }) {
    try {
      // Llamada POST al endpoint /sale del backend
      const response = await api.post('/sale', venta);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al registrar la venta');
    }
  },
};

export default empresaService; 