import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create the NestJS application
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Get configuration
  const port = configService.get<number>('PORT', 3002);
  const environment = configService.get<string>('NODE_ENV', 'development');
  
  // Configure global prefix
  app.setGlobalPrefix('api/v1');

  // Enable CORS
  app.enableCors({
    origin: true, // Allow from any origin in development, configure specifically in production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Set up global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in the DTO
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transform: true, // Transform payloads to be objects typed according to their DTO classes
      transformOptions: {
        enableImplicitConversion: true, // Allow implicit type conversion
      },
    }),
  );

  // Set up Swagger documentation
  if (environment !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('FIXIE Rewards Service API')
      .setDescription('API documentation for the FIXIE rewards microservice')
      .setVersion('1.0')
      .addTag('rewards')
      .addBearerAuth()
      .build();
      
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    
    logger.log('Swagger documentation is available at /api/docs');
  }

  // Start the server
  await app.listen(port);
  logger.log(`Rewards microservice running on port ${port} in ${environment} mode`);
  logger.log(`API available at http://localhost:${port}/api/v1`);
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the application
bootstrap().catch(err => {
  console.error('Failed to start the application:', err);
  process.exit(1);
});

