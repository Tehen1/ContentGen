import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';

// Entities
import { Reward } from './entities/reward.entity';

// Controllers
import { RewardController } from './controllers/reward.controller';

// Services
import { RewardService } from './services/reward.service';
import { BlockchainService } from './services/blockchain.service';
import { NFTService } from './services/nft.service';

// Configuration validation
import * as Joi from 'joi';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', `${process.cwd()}/config/env/${process.env.NODE_ENV || 'development'}.env`],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3002),
        DATABASE_URL: Joi.string().required(),
        BLOCKCHAIN_NODE_URL: Joi.string().required(),
        SERVICE_WALLET_PRIVATE_KEY: Joi.string().required(),
        TOKEN_CONTRACT_ADDRESS: Joi.string().required(),
        NFT_CONTRACT_ADDRESS: Joi.string().required(),
        NFT_SERVICE_URL: Joi.string().optional(),
        PROCESS_REWARDS_IMMEDIATELY: Joi.boolean().default(true),
      }),
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [Reward],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: configService.get<string>('NODE_ENV') === 'development',
        ssl: configService.get<string>('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),

    // Entity repositories
    TypeOrmModule.forFeature([Reward]),

    // HTTP for external API calls
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),

    // Task scheduling for processing rewards
    ScheduleModule.forRoot(),
  ],
  controllers: [RewardController],
  providers: [
    RewardService,
    BlockchainService,
    NFTService,
    // Add additional providers as needed
  ],
})
export class AppModule {}

