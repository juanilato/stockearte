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

  // Create a new component
  // It accepts a CreateComponenteDto containing the component details
  @Post()
  create(@Body() createComponenteDto: CreateComponenteDto) {
    return this.componenteService.create(createComponenteDto);
  }

  // Get all components from a specific product
  @Get('producto/:productoId')
  findByProducto(@Param('productoId') productoId: string) {
    return this.componenteService.findByProducto(+productoId);
  }

  // Get one component by its ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.componenteService.findOne(+id);
  }

  // Edit component data: name, description, and material by ID
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateComponenteDto: UpdateComponenteDto) {
    return this.componenteService.update(+id, updateComponenteDto);
  }

  // Delete a component by its ID
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.componenteService.remove(+id);
  }
} 