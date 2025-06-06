import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum NftType {
  BADGE = 'badge',
  COLLECTIBLE = 'collectible',
  ACHIEVEMENT = 'achievement',
}

@Entity('nfts')
export class Nft {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  @Index()
  tokenId: string;

  @Column({ type: 'uuid' })
  @Index()
  ownerId: string;

  @Column({
    type: 'enum',
    enum: NftType,
    default: NftType.BADGE,
  })
  type: NftType;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: false })
  ipfsHash: string; // IPFS hash of the metadata

  @Column({ nullable: true })
  imageUrl: string; // URL or IPFS hash to the image

  @Column('jsonb', { nullable: true })
  attributes: object; // Additional attributes like rarity, traits, etc.

  @Column({ nullable: true })
  achievementId: string; // Reference to the achievement this NFT represents

  @Column({ nullable: true })
  contractAddress: string; // Blockchain contract address

  @Column({ nullable: true })
  txHash: string; // Transaction hash on the blockchain

  @Column({ default: false })
  isListed: boolean; // Whether NFT is listed in marketplace

  @Column('decimal', { precision: 18, scale: 8, nullable: true })
  listingPrice: number; // Price if listed on marketplace

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

