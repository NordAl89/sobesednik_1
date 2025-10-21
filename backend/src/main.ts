import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ExpertsService } from './experts/experts.service'; // Добавьте этот импорт
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Включаем CORS для фронтенда
  app.enableCors({
    origin: 'http://localhost:3000', // Nuxt dev server
    credentials: true,
  });

  // Валидация
  app.useGlobalPipes(new ValidationPipe());

  // Статические файлы
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  // Swagger документация
  const config = new DocumentBuilder()
    .setTitle('Experts API')
    .setDescription('API для системы экспертов-собеседников')
    .setVersion('1.0')
    .addTag('experts')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Запускаем планировщик проверки истекших анкет
  const expertsService = app.get(ExpertsService);
  await expertsService.startExpirationChecker();

  await app.listen(4000);
  console.log('Server is running on http://localhost:4000');
  console.log('Swagger documentation: http://localhost:4000/api');
}
bootstrap();