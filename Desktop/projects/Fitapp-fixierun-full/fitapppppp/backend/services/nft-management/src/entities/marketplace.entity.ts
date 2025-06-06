import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Nft } from './nft.entity';

export enum ListingStatus {
  ACTIVE = 'active',
  SOLD = 'sold',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum TransactionType {
  LIST = 'list',
  PURCHASE = 'purchase',
  CANCEL = 'cancel',
  UPDATE_PRICE = 'update_price',
}

@Entity('marketplace_listings')
export class Marketplace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  nftId: string;

  @Column({ type: 'uuid' })
  @Index()
  sellerId: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  buyerId: string;

  @Column('decimal', { precision: 18, scale: 8, nullable: false })
  price: number;

  @Column('varchar', { length: 10, default: 'FIXIE' })
  currency: string;

  @Column({
    type: 'enum',
    enum: ListingStatus,
    default: ListingStatus.ACTIVE,
  })
  status: ListingStatus;

  @Column({ nullable: true })
  txHash: string; // Transaction hash for the listing/purchase

  @Column('decimal', { precision: 5, scale: 2, default: 2.5 })
  platformFeePercentage: number; // Platform commission percentage

  @Column('jsonb', { nullable: true })
  transactionHistory: object[]; // Array of transaction events (listings, price changes, sales)

  @Column({ type: 'timestamp', nullable: true })
  listingDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  expirationDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  soldDate: Date;

  @Column({ nullable: true })
  contractAddress: string; // Blockchain contract address

  @Column({ default: false })
  isAuction: boolean; // Whether this is an auction vs fixed price

  @Column({ type: 'timestamp', nullable: true })
  auctionEndDate: Date;

  @Column('decimal', { precision: 18, scale: 8, nullable: true })
  minimumBid: number;

  @Column('jsonb', { nullable: true })
  bids: object[]; // Array of bid events with bidder, amount, timestamp

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

