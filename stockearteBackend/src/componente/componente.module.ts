import { Module } from '@nestjs/common';
import { ComponenteController } from './componente.controller';
import { ComponenteService } from './componente.service';

@Module({
  controllers: [ComponenteController],
  providers: [ComponenteService],
})
export class ComponenteModule {} 