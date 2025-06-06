import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as Joi from 'joi';

// Import controllers
import { NftController } from './controllers/nft.controller';

// Import services
import { NftService } from './services/nft.service';
import { BlockchainService } from './services/blockchain.service';
import { IpfsService } from './services/ipfs.service';
import { MarketplaceService } from './services/marketplace.service';

// Import entities
import { Nft } from './entities/nft.entity';
import { Marketplace } from './entities/marketplace.entity';

@Module({
  imports: [
    // Configure environment variables with validation
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env' : `.env.${process.env.NODE_ENV || 'development'}`,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(3005),
        DATABASE_URL: Joi.string().required(),
        BLOCKCHAIN_NODE_URL: Joi.string().required(),
        IPFS_API_URL: Joi.string().default('https://ipfs.infura.io:5001'),
        IPFS_GATEWAY_URL: Joi.string().default('https://ipfs.io/ipfs'),
      }),
    }),
    
    // Schedule module for recurring tasks
    ScheduleModule.forRoot(),
    
    // Configure TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [Nft, Marketplace],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: configService.get<string>('NODE_ENV') === 'development',
        ssl: configService.get<string>('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),
    
    // Configure entity repositories
    TypeOrmModule.forFeature([Nft, Marketplace]),
    
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
        defaultMeta: { service: 'nft-management-service' },
        transports: [
          new winston.transports.Console(),
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ],
      }),
    }),
  ],
  controllers: [NftController],
  providers: [
    NftService,
    BlockchainService,
    IpfsService,
    MarketplaceService,
  ],
  exports: [
    NftService,
  ],
})
export class AppModule {}

