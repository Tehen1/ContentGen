import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ChallengeType, ChallengeDifficulty } from '../dto/create-challenge.dto';
import { UserChallenge } from './user-challenge.entity';

@Entity('challenges')
export class Challenge {
  @ApiProperty({ description: 'ID unique du défi' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Titre du défi' })
  @Column()
  @Index()
  title: string;

  @ApiProperty({ description: 'Description du défi' })
  @Column('text')
  description: string;

  @ApiProperty({ description: 'Type de défi' })
  @Column({
    type: 'enum',
    enum: ChallengeType,
  })
  type: ChallengeType;

  @ApiProperty({ description: 'Niveau de difficulté' })
  @Column({
    type: 'enum',
    enum: ChallengeDifficulty,
  })
  difficulty: ChallengeDifficulty;

  @ApiProperty({ description: 'Date de début du défi' })
  @Column('timestamptz')
  @Index()
  startDate: Date;

  @ApiProperty({ description: 'Date de fin du défi' })
  @Column('timestamptz')
  @Index()
  endDate: Date;

  @ApiProperty({ description: 'Objectifs du défi au format JSON' })
  @Column('jsonb')
  objectives: object;

  @ApiProperty({ description: 'Récompenses pour avoir complété le défi au format JSON' })
  @Column('jsonb')
  reward: object;

  @ApiProperty({ description: 'Indique si le défi est global pour tous les utilisateurs' })
  @Column('boolean', { default: false })
  isGlobal: boolean;

  @ApiProperty({ description: 'Indique si le défi est récurrent' })
  @Column('boolean', { default: false })
  isRecurring: boolean;

  @ApiProperty({ description: 'Liste des IDs d\'utilisateurs invités au format JSON' })
  @Column('jsonb', { nullable: true })
  invitedUsers: string[];

  @ApiProperty({ description: 'Données supplémentaires spécifiques au type de défi au format JSON' })
  @Column('jsonb', { nullable: true })
  metadata: object;

  @ApiProperty({ description: 'Indique si le défi est actif' })
  @Column('boolean', { default: true })
  isActive: boolean;

  @ApiProperty({ description: 'URL de l\'image du défi' })
  @Column({ nullable: true })
  imageUrl: string;

  @ApiProperty({ description: 'Date et heure de création de l\'enregistrement' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date et heure de dernière modification de l\'enregistrement' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => UserChallenge, userChallenge => userChallenge.challenge)
  userChallenges: UserChallenge[];
}