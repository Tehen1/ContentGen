import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum ActivityType {
  RUNNING = 'running',
  CYCLING = 'cycling',
  WALKING = 'walking',
}

@Entity('activities')
export class Activity {
  @ApiProperty({ description: 'Unique ID of the activity' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'User ID' })
  @Column()
  @Index()
  userId: string;

  @ApiProperty({ description: 'Type of activity (running, cycling, walking)' })
  @Column({
    type: 'enum',
    enum: ActivityType,
    default: ActivityType.RUNNING,
  })
  type: ActivityType;

  @ApiProperty({ description: 'Distance covered in meters' })
  @Column('decimal', { precision: 10, scale: 2 })
  distance: number; // in meters

  @ApiProperty({ description: 'Calories burned' })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  calories: number;

  @ApiProperty({ description: 'Duration of activity in seconds' })
  @Column('int')
  duration: number; // in seconds

  @ApiProperty({ description: 'Average speed in meters per second' })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  averageSpeed: number; // in meters per second

  @ApiProperty({ description: 'Maximum speed in meters per second' })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  maxSpeed: number;

  @ApiProperty({ description: 'GPS route data in GeoJSON format' })
  @Column('jsonb', { nullable: true })
  routeData: any;

  @ApiProperty({ description: 'Heart rate data during activity' })
  @Column('jsonb', { nullable: true })
  heartRateData: any;

  @ApiProperty({ description: 'Indicates if the activity is completed' })
  @Column({ default: false })
  isCompleted: boolean;

  @ApiProperty({ description: 'Indicates if the activity was in multiplayer mode' })
  @Column('boolean', { default: false })
  isMultiplayer: boolean;

  @ApiProperty({ description: 'User notes or comments about the activity' })
  @Column('text', { nullable: true })
  notes: string;

  @ApiProperty({ description: 'Tokens earned for this activity' })
  @Column('int', { default: 0 })
  tokensEarned: number;

  @ApiProperty({ description: 'Creation timestamp of the record' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp of the record' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'Start time of the activity' })
  @Column('timestamptz', { nullable: true })
  startedAt: Date;

  @ApiProperty({ description: 'End time of the activity' })
  @Column('timestamptz', { nullable: true })
  endedAt: Date;
}
