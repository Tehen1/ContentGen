import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsEnum, 
  IsNumber, 
  IsInt, 
  Min, 
  IsBoolean, 
  IsOptional, 
  IsObject, 
  IsISO8601, 
  MaxLength 
} from 'class-validator';
import { Type } from 'class-transformer';
import { ActivityType } from '../entities/activity.entity';

export class UpdateActivityDto {
  @ApiProperty({ 
    description: 'Type d\'activité (course ou vélo)',
    enum: ActivityType,
    example: ActivityType.RUN,
    required: false
  })
  @IsOptional()
  @IsEnum(ActivityType)
  type?: ActivityType;

  @ApiProperty({ 
    description: 'Distance parcourue en kilomètres',
    example: 5.25,
    required: false
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  distance?: number;

  @ApiProperty({ 
    description: 'Durée de l\'activité en secondes',
    example: 1800,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  duration?: number;

  @ApiProperty({ 
    description: 'Vitesse moyenne en km/h',
    example: 10.5,
    required: false
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  averageSpeed?: number;

  @ApiProperty({ 
    description: 'Vitesse maximale atteinte en km/h',
    example: 15.2,
    required: false
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  maxSpeed?: number;

  @ApiProperty({ 
    description: 'Nombre de points/tokens gagnés',
    example: 25,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  tokensEarned?: number;

  @ApiProperty({ 
    description: 'Trace GPS de l\'activité au format GeoJSON',
    required: false,
    example: {
      type: 'LineString',
      coordinates: [[2.3522, 48.8566], [2.3523, 48.8567]]
    }
  })
  @IsOptional()
  @IsObject()
  routeData?: object;

  @ApiProperty({ 
    description: 'Commentaire de l\'utilisateur sur l\'activité',
    example: 'Super course matinale !',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;

  @ApiProperty({ 
    description: 'Indique si l\'activité était en mode multijoueur',
    example: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isMultiplayer?: boolean;

  @ApiProperty({ 
    description: 'Date et heure de début de l\'activité',
    example: '2023-05-01T08:30:00Z',
    required: false
  })
  @IsOptional()
  @IsISO8601()
  startedAt?: string;

  @ApiProperty({ 
    description: 'Date et heure de fin de l\'activité',
    example: '2023-05-01T09:15:00Z',
    required: false
  })
  @IsOptional()
  @IsISO8601()
  finishedAt?: string;
}