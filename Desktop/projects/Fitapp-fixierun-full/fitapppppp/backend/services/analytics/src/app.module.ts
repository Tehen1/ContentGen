import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as Joi from 'joi';

// Import controllers
// We'll need to create an analytics controller
import { AnalyticsController } from './controllers/analytics.controller';

// Import services
import { AnalyticsService } from './services/analytics.service';

// Import entities
import { UserAnalytics } from './entities/user-analytics.entity';

@Module({
  imports: [
    // Configure environment variables with validation
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env' : `.env.${process.env.NODE_ENV || 'development'}`,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(3003),
        DATABASE_URL: Joi.string().required(),
        MONGODB_URL: Joi.string().required(),
        ACTIVITY_SERVICE_URL: Joi.string().default('http://activity-tracking-service:3001'),
        CHALLENGE_SERVICE_URL: Joi.string().default('http://challenges-service:3004'),
        REWARDS_SERVICE_URL: Joi.string().default('http://rewards-service:3002'),
      }),
    }),
    
    // Schedule module for recurring tasks
    ScheduleModule.forRoot(),
    
    // Configure HTTP module for calling other services
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    
    // Configure TypeORM for PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [UserAnalytics],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: configService.get<string>('NODE_ENV') === 'development',
        ssl: configService.get<string>('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),
    
    // Configure Mongoose for MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URL'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),
    
    // Configure entity repositories
    TypeOrmModule.forFeature([UserAnalytics]),
    
    // Configure logging
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        level: configService.get<string>('NODE_ENV') === 'production' ? 'info' : 'debug',
        format: winston.format.combine(
          winston.format.timestamp(),
          configService.get<string>('NODE_ENV') === 'production'
            ? winston.format.json()
            : winston.format.prettyPrint(),
        ),
        defaultMeta: { service: 'analytics-service' },
        transports: [
          new winston.transports.Console(),
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ],
      }),
    }),
  ],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
  ],
  exports: [
    AnalyticsService,
  ],
})
export class AppModule {}

