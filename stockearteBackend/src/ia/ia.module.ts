// Módulo de IA: registra el service y los controllers de IA
import { Module } from '@nestjs/common';
import { IaController } from './ia.controller';
import { IaService } from './ia.service';
import { MistralService } from './mistral.service';
import { FileExtractorService } from './file-extractor.service';

@Module({
  controllers: [IaController],
  providers: [IaService, MistralService, FileExtractorService],
  exports: [IaService],
})
export class IaModule {}
