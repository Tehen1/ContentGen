import { ApiProperty } from '@nestjs/swagger';
import { 
  IsNotEmpty, 
  IsString, 
  IsEnum, 
  IsNumber, 
  IsOptional, 
  IsObject,
  MinLength,
  Min
} from 'class-validator';
import { Type } from 'class-transformer';
import { RewardType } from '../entities/reward.entity';

export class CreateRewardDto {
  @ApiProperty({ 
    description: 'ID de l\'utilisateur',
    example: '0x71C23bD19f56E521948a6D3111955C79557EB1C8'
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  userId: string;

  @ApiProperty({ 
    description: 'Montant de tokens FIXIE à attribuer',
    example: 25.5
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @ApiProperty({ 
    description: 'Type de récompense',
    enum: RewardType,
    example: RewardType.ACTIVITY_COMPLETION
  })
  @IsNotEmpty()
  @IsEnum(RewardType)
  type: RewardType;

  @ApiProperty({ 
    description: 'ID de l\'entité source (activité, challenge, etc.)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  @IsOptional()
  @IsString()
  sourceId?: string;

  @ApiProperty({ 
    description: 'Type de source de la récompense',
    example: 'activity',
    required: false
  })
  @IsOptional()
  @IsString()
  sourceType?: string;

  @ApiProperty({ 
    description: 'Description de la récompense',
    example: 'Récompense pour avoir complété une course de 5km',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'Données supplémentaires spécifiques au type de récompense au format JSON',
    example: {
      distance: 5.2,
      duration: 1800,
      speed: 10.4
    },
    required: false
  })
  @IsOptional()
  @IsObject()
  metadata?: object;
}