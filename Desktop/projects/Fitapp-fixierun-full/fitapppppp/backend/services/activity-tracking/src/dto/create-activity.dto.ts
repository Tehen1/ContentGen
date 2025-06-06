import { ApiProperty } from '@nestjs/swagger';
import { 
  IsNotEmpty, 
  IsString, 
  IsEnum, 
  IsNumber, 
  IsInt, 
  Min, 
  IsBoolean, 
  IsOptional, 
  IsObject, 
  IsISO8601, 
  MaxLength,
  IsUUID,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { ActivityType } from '../entities/activity.entity';

class GpsPoint {
  @ApiProperty({ description: 'Latitude', example: 48.8566 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ description: 'Longitude', example: 2.3522 })
  @IsNumber()
  longitude: number;

  @ApiProperty({ description: 'Élévation en mètres', example: 35 })
  @IsNumber()
  elevation: number;

  @ApiProperty({ description: 'Horodatage du point GPS', example: '2023-05-01T08:30:15Z' })
  @IsISO8601()
  timestamp: string;
}

class HeartRatePoint {
  @ApiProperty({ description: 'Fréquence cardiaque en BPM', example: 145 })
  @IsNumber()
  @Min(0)
  bpm: number;

  @ApiProperty({ description: 'Horodatage de la mesure', example: '2023-05-01T08:30:15Z' })
  @IsISO8601()
  timestamp: string;
}

export class CreateActivityDto {
  @ApiProperty({ 
    description: 'ID de l\'utilisateur',
    example: '123e4567-e89b-12d3-a456-426614174000' 
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({ 
    description: 'Type d\'activité',
    enum: ActivityType,
    example: 'RUNNING' 
  })
  @IsNotEmpty()
  @IsEnum(ActivityType)
  type: ActivityType;

  @ApiProperty({ 
    description: 'Distance parcourue en kilomètres',
    example: 5.25
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  distance: number;

  @ApiProperty({ 
    description: 'Calories brûlées',
    example: 350,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  calories?: number;

  @ApiProperty({ 
    description: 'Durée de l\'activité en secondes',
    example: 1800
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  duration: number;

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
    description: 'Données GPS de l\'activité',
    type: [GpsPoint],
    required: false
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => GpsPoint)
  gpsData?: GpsPoint[];

  @ApiProperty({ 
    description: 'Données de fréquence cardiaque',
    type: [HeartRatePoint],
    required: false
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => HeartRatePoint)
  heartRateData?: HeartRatePoint[];

  @ApiProperty({ 
    description: 'Indique si l\'activité est terminée',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @ApiProperty({ 
    description: 'Notes ou commentaires sur l\'activité',
    example: 'Super course matinale !',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

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
  endedAt?: string;
}
