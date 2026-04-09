import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const seedService = app.get(SeedService);

  await seedService.createAdmin();

  // Глобальная валидация DTO (только для входящих запросов)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: false, // Отключаем whitelist — он удаляет свойства Sequelize-моделей
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const corsOrigin = configService.get<string>('CORS_ORIGIN', 'http://localhost:5173');

  // Поддержка нескольких источников для CORS в Docker-окружении
  const corsOptions = {
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      'http://frontend:5173',
      'http://nest_frontend:5173',
      'http://backend:3000',
      'http://nest_backend:3000',
      corsOrigin,
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
  };

  app.enableCors(corsOptions);

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port, '0.0.0.0');
  console.log(`Backend running on http://0.0.0.0:${port}`);
}

void bootstrap();
