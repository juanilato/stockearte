export class CreateSaleDto {
  fecha: Date;
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
}
