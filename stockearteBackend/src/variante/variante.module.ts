import { Module } from '@nestjs/common';
import { VarianteController } from './variante.controller';
import { VarianteService } from './variante.service';

@Module({
  controllers: [VarianteController],
  providers: [VarianteService],
})
export class VarianteModule {} 