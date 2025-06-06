import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Challenge } from './challenge.entity';

export enum UserChallengeStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CLAIMED = 'claimed',
}

@Entity('user_challenges')
export class UserChallenge {
  @ApiProperty({ description: 'ID unique de la participation au défi' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID de l\'utilisateur' })
  @Column()
  @Index()
  userId: string;

  @ApiProperty({ description: 'ID du défi' })
  @Column()
  @Index()
  challengeId: string;

  @ApiProperty({ description: 'État actuel du défi pour l\'utilisateur' })
  @Column({
    type: 'enum',
    enum: UserChallengeStatus,
    default: UserChallengeStatus.PENDING,
  })
  status: UserChallengeStatus;

  @ApiProperty({ description: 'Progression actuelle au format JSON' })
  @Column('jsonb', { default: {} })
  progress: object;

  @ApiProperty({ description: 'Pourcentage de complétion (0-100)' })
  @Column('int', { default: 0 })
  completionPercentage: number;

  @ApiProperty({ description: 'Date et heure de complétion' })
  @Column('timestamptz', { nullable: true })
  completedAt: Date;

  @ApiProperty({ description: 'Date et heure de réclamation de la récompense' })
  @Column('timestamptz', { nullable: true })
  claimedAt: Date;

  @ApiProperty({ description: 'Hash de transaction pour la récompense en tokens' })
  @Column({ nullable: true })
  rewardTransactionHash: string;

  @ApiProperty({ description: 'ID du NFT attribué comme récompense' })
  @Column({ nullable: true })
  rewardNftId: string;

  @ApiProperty({ description: 'Métadonnées supplémentaires au format JSON' })
  @Column('jsonb', { nullable: true })
  metadata: object;

  @ApiProperty({ description: 'Date et heure de création de l\'enregistrement' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date et heure de dernière modification de l\'enregistrement' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Challenge, challenge => challenge.userChallenges)
  @JoinColumn({ name: 'challengeId' })
  challenge: Challenge;
}