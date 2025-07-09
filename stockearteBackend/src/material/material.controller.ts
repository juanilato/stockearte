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

  @Post()
  create(@Body() createMaterialDto: CreateMaterialDto) {
    return this.materialService.create(createMaterialDto);
  }

  @Post('create-with-variante')
  createMaterialAndVariante(@Body() createData: CreateMaterialAndVarianteDto) {
    return this.materialService.createMaterialAndVariante(createData);
  }

  @Get()
  findAll() {
    return this.materialService.findAll();
  }

  @Get('empresa/:empresaId')
  findByEmpresa(@Param('empresaId') empresaId: string) {
    return this.materialService.findByEmpresa(+empresaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materialService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMaterialDto: UpdateMaterialDto,
  ) {
    return this.materialService.update(+id, updateMaterialDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.materialService.remove(+id);
  }
}
