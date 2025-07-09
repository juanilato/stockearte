import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { CompanyModule } from './company/company.module';
import { ProductModule } from './product/product.module';
import { MaterialModule } from './material/material.module';
import { ComponenteModule } from './componente/componente.module';
import { VarianteModule } from './variante/variante.module';
import { SaleModule } from './sale/sale.module';
import { IaModule } from './ia/ia.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { EstadisticasModule } from './estadisticas/estadisticas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    CompanyModule,
    ProductModule,
    MaterialModule,
    ComponenteModule,
    VarianteModule,
    SaleModule,
    IaModule,
    EstadisticasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
