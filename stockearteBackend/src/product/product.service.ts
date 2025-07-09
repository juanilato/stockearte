import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { generateUniqueEAN13, isEAN13AvailableInEmpresa } from '../utils/ean13.util';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  //Creation of product for a company
  async create(createProductDto: CreateProductDto) {
    let { codigoBarras, empresaId } = createProductDto;
    if (createProductDto.precioCosto > createProductDto.precioVenta) {
      throw new Error('Precio de costo no puede ser mayor a precio de venta');
    }
    if (createProductDto.stock < 0) {
      throw new Error('Stock no puede ser negativo');
    }
    if (!empresaId) {
      throw new Error('Empresa asignada requerido para código de barras');
    }

    if (!codigoBarras) {
      codigoBarras = await generateUniqueEAN13(this.prisma, empresaId);
    } else {
      const disponible = await isEAN13AvailableInEmpresa(this.prisma, codigoBarras, empresaId);
      if (!disponible) {
        throw new Error('El código de barras ya existe en productos o variantes de la empresa');
      }
    }

    return this.prisma.producto.create({
      data: {
        ...createProductDto,
        codigoBarras,
      },
    });
  }

  // Search all products
  findAll() {
    return this.prisma.producto.findMany();
  }

  // Find all products from a specific company
  findAllByEmpresa(empresaId: number) {
    return this.prisma.producto.findMany({
      where: { empresaId },
      include: {
        variantes: true,
        componentes: {
          include: {
            material: true,
          },
        },
      },
    });
  }

  // Find product by barcode
  findByBarcode(codigoBarras: string) {
    return this.prisma.producto.findFirst({
      where: { codigoBarras },
      include: {
        variantes: true,
        componentes: {
          include: {
            material: true,
          },
        },
      },
    });
  }

  // Find one specific product
  findOne(id: number) {
    return this.prisma.producto.findUnique({ 
      where: { id },
      include: {
        variantes: true,
        componentes: {
          include: {
            material: true,
          },
        },
      },
    });
  }

  //Update product with data (costo, precio, stock, nombre)
  update(id: number, UpdateProductDto: UpdateProductDto) {
    if (UpdateProductDto.precioCosto > UpdateProductDto.precioVenta) {
      throw new Error('Precio de costo no puede ser mayor a precio de venta');
    }
    if (UpdateProductDto.stock < 0) {
      throw new Error('Stock no puede ser negativo');
    }
    if (UpdateProductDto.nombre == '') {
      throw new Error('Nombre no puede ser vacío');
    }
    return this.prisma.producto.update({
      where: { id },
      data: UpdateProductDto,
    });
  }

  //remove one product from db
  remove(id: number) {
    return this.prisma.producto.delete({ where: { id } });
  }
}
