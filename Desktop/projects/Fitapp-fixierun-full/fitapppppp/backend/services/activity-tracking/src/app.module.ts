import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityController } from './controllers/activity.controller';
import { ActivityService } from './services/activity.service';
import { Activity } from './entities/activity.entity';

@Module({
  imports: [
    // Configuration avec variables d'environnement
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    
    // Configuration de TypeORM pour la base de données
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'fixierun_activities'),
        entities: [Activity],
        synchronize: configService.get('NODE_ENV', 'development') !== 'production',
        logging: configService.get('NODE_ENV', 'development') !== 'production',
        ssl: configService.get('DB_SSL', 'false') === 'true',
      }),
    }),
    
    // Enregistrement de l'entité Activity
    TypeOrmModule.forFeature([Activity]),
  ],
  controllers: [ActivityController],
  providers: [ActivityService],
})
export class AppModule {}
