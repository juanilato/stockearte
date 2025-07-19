import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { MaterialService, CreateMaterialDto, UpdateMaterialDto, CreateMaterialAndVarianteDto } from './material.service';

@Controller('material')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  // creation of a material
  @Post()
  create(@Body() createMaterialDto: CreateMaterialDto) {
    return this.materialService.create(createMaterialDto);
  }

  // creation of a Material with a Variant
  @Post('create-with-variante')
  createMaterialAndVariante(@Body() createData: CreateMaterialAndVarianteDto) {
    return this.materialService.createMaterialAndVariante(createData);
  }

  // Get all materials
  @Get()
  findAll() {
    return this.materialService.findAll();
  }

  // Get materials of a specific company
  @Get('empresa/:empresaId')
  findByEmpresa(@Param('empresaId') empresaId: string) {
    return this.materialService.findByEmpresa(+empresaId);
  }

  // get one material by its id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materialService.findOne(+id);
  }

  // Patch and update a material by its id
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMaterialDto: UpdateMaterialDto,
  ) {
    return this.materialService.update(+id, updateMaterialDto);
  }

  // Delete a material by its id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.materialService.remove(+id);
  }
}
