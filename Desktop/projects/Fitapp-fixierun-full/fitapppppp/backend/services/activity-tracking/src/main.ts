import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Configuration CORS pour permettre les appels depuis les applications frontend et mobile
  app.enableCors({
    origin: [
      'http://localhost:3000', // frontend dev
      'https://fitapp.com',    // frontend prod
      'capacitor://localhost', // mobile app
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // Configuration des pipes de validation globaux
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,      // Supprime les propriétés non définies dans les DTOs
      forbidNonWhitelisted: true, // Rejette les requêtes avec des propriétés non définies
      transform: true,      // Transforme les données entrantes au type désiré
    }),
  );

  // Préfixe pour toutes les routes de l'API
  app.setGlobalPrefix('api/v1');

  // Configuration de la documentation Swagger
  const config = new DocumentBuilder()
    .setTitle('FitApp Activity Tracking API')
    .setDescription('API pour le suivi des activités physiques dans l\'application FitApp')
    .setVersion('1.0')
    .addTag('activities')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Démarrer le serveur
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Activity Tracking Service running on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();
