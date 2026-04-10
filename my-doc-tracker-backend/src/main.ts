import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'], 
  });
  const configService = app.get(ConfigService);
  const seedService = app.get(SeedService);
  const logger = new Logger('Bootstrap');

  await seedService.createAdmin();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: false, 
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const corsOrigin = configService.get<string>('CORS_ORIGIN', 'http://localhost:5173');

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
  logger.log('Application is starting...');
  logger.log('Application is running on: http://localhost:3000');
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port, '0.0.0.0');
  console.log(`Backend running on http://0.0.0.0:${port}`);
}

void bootstrap();
