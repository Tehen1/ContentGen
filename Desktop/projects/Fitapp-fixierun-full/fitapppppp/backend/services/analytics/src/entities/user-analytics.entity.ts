import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('user_analytics')
export class UserAnalytics {
  @ApiProperty({ description: 'ID unique de l\'entrée analytique' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID de l\'utilisateur' })
  @Column()
  @Index()
  userId: string;

  @ApiProperty({ description: 'Date de l\'analyse (jour)' })
  @Column('date')
  @Index()
  date: Date;

  @ApiProperty({ description: 'Distance totale parcourue ce jour (km)' })
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalDistance: number;

  @ApiProperty({ description: 'Durée totale d\'activité ce jour (secondes)' })
  @Column('int', { default: 0 })
  totalDuration: number;

  @ApiProperty({ description: 'Nombre d\'activités ce jour' })
  @Column('int', { default: 0 })
  activityCount: number;

  @ApiProperty({ description: 'Vitesse moyenne (km/h)' })
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  averageSpeed: number;

  @ApiProperty({ description: 'Vitesse maximale (km/h)' })
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  maxSpeed: number;

  @ApiProperty({ description: 'Tokens gagnés ce jour' })
  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  tokensEarned: number;

  @ApiProperty({ description: 'Nombre de défis complétés ce jour' })
  @Column('int', { default: 0 })
  challengesCompleted: number;

  @ApiProperty({ description: 'Calories estimées brûlées' })
  @Column('int', { default: 0 })
  caloriesBurned: number;

  @ApiProperty({ description: 'Scores par type d\'activité au format JSON' })
  @Column('jsonb', { nullable: true })
  activityTypeBreakdown: object;

  @ApiProperty({ description: 'Indicateurs de performance au format JSON' })
  @Column('jsonb', { nullable: true })
  performanceMetrics: object;

  @ApiProperty({ description: 'Date et heure de création de l\'enregistrement' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date et heure de dernière mise à jour de l\'enregistrement' })
  @UpdateDateColumn()
  updatedAt: Date;
}