export class CreateProductDto {
  nombre: string;
  precioCosto: number;
  precioVenta: number;
  stock: number;
  codigoBarras?: string;
  empresaId?: number;
}
