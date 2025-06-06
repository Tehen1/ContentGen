import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as Joi from 'joi';

// Import controllers
// We'll need to create a challenges controller
import { ChallengesController } from './controllers/challenges.controller';

// Import services
import { ChallengesService } from './services/challenges.service';

// Import entities
import { Challenge } from './entities/challenge.entity';
import { UserChallenge } from './entities/user-challenge.entity';

@Module({
  imports: [
    // Configure environment variables with validation
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env' : `.env.${process.env.NODE_ENV || 'development'}`,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(3004),
        DATABASE_URL: Joi.string().required(),
        REDIS_URL: Joi.string().default('redis://redis:6379'),
        ACTIVITY_SERVICE_URL: Joi.string().default('http://activity-tracking-service:3001'),
        REWARD_SERVICE_URL: Joi.string().default('http://rewards-service:3002'),
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
        entities: [Challenge, UserChallenge],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: configService.get<string>('NODE_ENV') === 'development',
        ssl: configService.get<string>('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),
    
    // Configure entity repositories
    TypeOrmModule.forFeature([Challenge, UserChallenge]),
    
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
        defaultMeta: { service: 'challenges-service' },
        transports: [
          new winston.transports.Console(),
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ],
      }),
    }),
  ],
  controllers: [ChallengesController],
  providers: [
    ChallengesService,
  ],
  exports: [
    ChallengesService,
  ],
})
export class AppModule {}

