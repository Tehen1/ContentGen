import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum RewardType {
  ACTIVITY_COMPLETION = 'activity_completion',
  CHALLENGE_COMPLETION = 'challenge_completion',
  MILESTONE = 'milestone',
  ACHIEVEMENT = 'achievement',
  REFERRAL = 'referral',
  DAILY_BONUS = 'daily_bonus',
  COMMUNITY_EVENT = 'community_event',
}

export enum RewardStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  FAILED = 'failed',
  CLAIMED = 'claimed',
}

@Entity('rewards')
export class Reward {
  @ApiProperty({ description: 'ID unique de la récompense' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID de l\'utilisateur' })
  @Column()
  @Index()
  userId: string;

  @ApiProperty({ description: 'Montant de tokens FIXIE attribués' })
  @Column('decimal', { precision: 18, scale: 2 })
  amount: number;

  @ApiProperty({ description: 'Type de récompense' })
  @Column({
    type: 'enum',
    enum: RewardType,
    default: RewardType.ACTIVITY_COMPLETION,
  })
  type: RewardType;

  @ApiProperty({ description: 'Statut actuel de la récompense' })
  @Column({
    type: 'enum',
    enum: RewardStatus,
    default: RewardStatus.PENDING,
  })
  status: RewardStatus;

  @ApiProperty({ description: 'ID de l\'entité source (activité, challenge, etc.)' })
  @Column({ nullable: true })
  sourceId: string;

  @ApiProperty({ description: 'Type de source de la récompense' })
  @Column({ nullable: true })
  sourceType: string;

  @ApiProperty({ description: 'Hash de transaction blockchain pour le suivi' })
  @Column({ nullable: true })
  transactionHash: string;

  @ApiProperty({ description: 'Description de la récompense' })
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty({ description: 'Date et heure de la dernière tentative de traitement' })
  @Column('timestamptz', { nullable: true })
  processedAt: Date;

  @ApiProperty({ description: 'Multiplicateur de récompense basé sur les NFTs' })
  @Column('decimal', { precision: 5, scale: 2, default: 1.0 })
  multiplier: number;

  @ApiProperty({ description: 'Date et heure de création de l\'enregistrement' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date et heure de dernière modification de l\'enregistrement' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'Données supplémentaires spécifiques au type de récompense au format JSON' })
  @Column('jsonb', { nullable: true })
  metadata: object;
}