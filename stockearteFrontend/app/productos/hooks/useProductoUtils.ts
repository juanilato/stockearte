// Hook utilitario con funciones auxiliares para productos: validación, generación de EAN13, payloads, etc.
// Provee helpers reutilizables para lógica de productos y variantes.
import { useCallback } from 'react';
import { Producto, VarianteProducto } from '../../../services/api';

export const useProductoUtils = () => {
  // Genera un código EAN13 válido
  const generarEAN13 = useCallback((): string => {
    // Prefijo para Argentina (779)
    const prefijo = '779';
    // Generar 9 dígitos aleatorios
    const random = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    const base = prefijo + random;
    const checkDigit = calcularDigitoControlEAN13(base);
    return base + checkDigit;
  }, []);

  // Calcula el dígito de control para EAN13
  const calcularDigitoControlEAN13 = useCallback((codigo: string): string => {
    const nums = codigo.split('').map(n => parseInt(n));
    let sum = 0;
    for (let i = 0; i < nums.length; i++) {
      // En EAN13, las posiciones pares (0-based) se multiplican por 3
      sum += i % 2 === 1 ? nums[i] * 3 : nums[i];
    }
    const check = (10 - (sum % 10)) % 10;
    return check.toString();
  }, []);

  // Genera el payload para código de barras
  const generarCodigoBarrasPayload = useCallback((producto: Producto, variante?: VarianteProducto) => {
    return variante
      ? {
          nombre: producto.nombre,
          precioVenta: producto.precioVenta,
          varianteNombre: variante.nombre,
          codigoBarras: variante.codigoBarras,
        }
      : {
          nombre: producto.nombre,
          precioVenta: producto.precioVenta,
          codigoBarras: producto.codigoBarras,
        };
  }, []);

  // Busca un producto por código de barras en una lista local
  const buscarProductoPorCodigo = useCallback((productos: Producto[], codigo: string) => {
    const producto = productos.find(p =>
      p.codigoBarras === codigo || p.variantes?.some(v => v.codigoBarras === codigo)
    );

    if (producto) {
      const variante = producto.variantes?.find(v => v.codigoBarras === codigo);
      return { producto, variante };
    }

    return { producto: null, variante: null };
  }, []);

  // Validar datos de producto
  const validarProducto = useCallback((producto: Partial<Producto>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!producto.nombre?.trim()) {
      errors.push('El nombre del producto es obligatorio');
    }

    if (producto.precioCosto === undefined || producto.precioCosto < 0) {
      errors.push('El precio de costo debe ser mayor o igual a 0');
    }

    if (producto.precioVenta === undefined || producto.precioVenta < 0) {
      errors.push('El precio de venta debe ser mayor o igual a 0');
    }

    if (producto.precioCosto && producto.precioVenta && producto.precioCosto > producto.precioVenta) {
      errors.push('El precio de costo no puede ser mayor al precio de venta');
    }

    if (producto.stock === undefined || producto.stock < 0) {
      errors.push('El stock debe ser mayor o igual a 0');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);

  // Calcular ganancia de un producto
  const calcularGanancia = useCallback((precioCosto: number, precioVenta: number): number => {
    return precioVenta - precioCosto;
  }, []);

  // Calcular margen de ganancia en porcentaje
  const calcularMargenGanancia = useCallback((precioCosto: number, precioVenta: number): number => {
    if (precioCosto === 0) return 0;
    return ((precioVenta - precioCosto) / precioCosto) * 100;
  }, []);

  return {
    generarEAN13,
    calcularDigitoControlEAN13,
    generarCodigoBarrasPayload,
    buscarProductoPorCodigo,
    validarProducto,
    calcularGanancia,
    calcularMargenGanancia,
  };
}; 