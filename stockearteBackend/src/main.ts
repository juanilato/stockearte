import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Configurar CORS
  app.enableCors({
    origin: true, // En producción, especifica los dominios permitidos
    credentials: true,
  });

  // Configurar prefijo global de API
  const apiPrefix = configService.get<string>('API_PREFIX') || 'api';
  app.setGlobalPrefix(apiPrefix);

  // Configurar puerto
  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);

  console.log(
    `🚀 Application is running on: http://localhost:${port}/${apiPrefix}`,
  );
  console.log(
    `📊 Environment: ${configService.get<string>('NODE_ENV') || 'development'}`,
  );
}
bootstrap();
