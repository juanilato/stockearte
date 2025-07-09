import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  //Product creation
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    console.log("PRODUCTO A CREAR", createProductDto);
    return this.productService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  // Get all products from a specific company
  @Get('empresa/:empresaId')
  findAllByEmpresa(@Param('empresaId') empresaId: string) {
    return this.productService.findAllByEmpresa(+empresaId);
  }

  // Get product by barcode
  @Get('barcode/:codigoBarras')
  findByBarcode(@Param('codigoBarras') codigoBarras: string) {
    return this.productService.findByBarcode(codigoBarras);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
