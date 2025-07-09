import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ComponenteService, CreateComponenteDto, UpdateComponenteDto } from './componente.service';

@Controller('componente')
export class ComponenteController {
  constructor(private readonly componenteService: ComponenteService) {}

  @Post()
  create(@Body() createComponenteDto: CreateComponenteDto) {
    return this.componenteService.create(createComponenteDto);
  }

  @Get('producto/:productoId')
  findByProducto(@Param('productoId') productoId: string) {
    return this.componenteService.findByProducto(+productoId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.componenteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateComponenteDto: UpdateComponenteDto) {
    return this.componenteService.update(+id, updateComponenteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.componenteService.remove(+id);
  }
} 