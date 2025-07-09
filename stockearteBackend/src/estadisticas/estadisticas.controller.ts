import { Controller, Get, Param } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';

@Controller('estadisticas')
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get(':empresaId')
  async getEstadisticas(@Param('empresaId') empresaId: string) {
    return this.estadisticasService.getEstadisticasPorEmpresa(+empresaId);
  }
} 