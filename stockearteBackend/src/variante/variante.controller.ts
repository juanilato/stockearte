import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { VarianteService, CreateVarianteDto, UpdateVarianteDto } from './variante.service';

@Controller('variante')
export class VarianteController {
  constructor(private readonly varianteService: VarianteService) {}

  @Post()
  create(@Body() createVarianteDto: CreateVarianteDto) {
    return this.varianteService.create(createVarianteDto);
  }

  @Get()
  findAll() {
    return this.varianteService.findAll();
  }

  @Get('producto/:productoId')
  findByProducto(@Param('productoId') productoId: string) {
    return this.varianteService.findByProducto(+productoId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.varianteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVarianteDto: UpdateVarianteDto) {
    return this.varianteService.update(+id, updateVarianteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.varianteService.remove(+id);
  }
} 