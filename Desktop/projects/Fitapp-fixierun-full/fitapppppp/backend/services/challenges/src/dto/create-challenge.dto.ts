import { ApiProperty } from '@nestjs/swagger';
import { 
  IsNotEmpty, 
  IsString, 
  IsEnum, 
  IsNumber, 
  IsDate, 
  IsBoolean,
  IsOptional, 
  IsObject,
  IsArray,
  MinLength,
  Min,
  ArrayMinSize,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ChallengeType {
  DISTANCE = 'distance',
  DURATION = 'duration',
  SPEED = 'speed',
  FREQUENCY = 'frequency',
  COMMUNITY = 'community',
  SPECIAL = 'special',
}

export enum ChallengeDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXTREME = 'extreme',
}

export class ChallengeReward {
  @ApiProperty({ 
    description: 'Montant de tokens FIXIE pour la récompense',
    example: 100
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  tokens: number;

  @ApiProperty({ 
    description: 'ID du NFT à attribuer comme récompense (si applicable)',
    example: '1',
    required: false
  })
  @IsOptional()
  @IsString()
  nftId?: string;

  @ApiProperty({ 
    description: 'Titre d\'utilisateur débloqué',
    example: 'Weekend Warrior',
    required: false
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ 
    description: 'Augmentation du multiplicateur de récompense',
    example: 5,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  multiplierBoost?: number;
}

export class ChallengeObjective {
  @ApiProperty({ 
    description: 'Type d\'objectif',
    example: 'distance',
    enum: ['distance', 'duration', 'speed', 'activities', 'days']
  })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({ 
    description: 'Valeur cible à atteindre',
    example: 10.0
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  target: number;

  @ApiProperty({ 
    description: 'Unité de mesure',
    example: 'km',
    enum: ['km', 'min', 'km/h', 'count', 'days']
  })
  @IsNotEmpty()
  @IsString()
  unit: string;
}

export class CreateChallengeDto {
  @ApiProperty({ 
    description: 'Titre du défi',
    example: 'Weekend Warrior'
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ 
    description: 'Description du défi',
    example: 'Parcourir 10 km pendant le weekend'
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ 
    description: 'Type de défi',
    enum: ChallengeType,
    example: ChallengeType.DISTANCE
  })
  @IsNotEmpty()
  @IsEnum(ChallengeType)
  type: ChallengeType;

  @ApiProperty({ 
    description: 'Niveau de difficulté',
    enum: ChallengeDifficulty,
    example: ChallengeDifficulty.MEDIUM
  })
  @IsNotEmpty()
  @IsEnum(ChallengeDifficulty)
  difficulty: ChallengeDifficulty;

  @ApiProperty({ 
    description: 'Date de début du défi',
    example: '2023-06-01T00:00:00Z'
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({ 
    description: 'Date de fin du défi',
    example: '2023-06-30T23:59:59Z'
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty({ 
    type: [ChallengeObjective],
    description: 'Objectifs du défi'
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ChallengeObjective)
  objectives: ChallengeObjective[];

  @ApiProperty({ 
    type: ChallengeReward,
    description: 'Récompenses pour avoir complété le défi'
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ChallengeReward)
  reward: ChallengeReward;

  @ApiProperty({ 
    description: 'Indique si le défi est global pour tous les utilisateurs',
    example: true
  })
  @IsNotEmpty()
  @IsBoolean()
  isGlobal: boolean;

  @ApiProperty({ 
    description: 'Indique si le défi est récurrent',
    example: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiProperty({ 
    description: 'Liste des IDs d\'utilisateurs invités (si non global)',
    example: ['user1', 'user2'],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  invitedUsers?: string[];

  @ApiProperty({ 
    description: 'Données supplémentaires spécifiques au type de défi',
    example: {
      requiredActivityType: 'run',
      requiredNFT: 'shoes'
    },
    required: false
  })
  @IsOptional()
  @IsObject()
  metadata?: object;
}