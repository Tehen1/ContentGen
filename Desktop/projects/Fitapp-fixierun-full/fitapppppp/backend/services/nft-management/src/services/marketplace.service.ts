import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Marketplace, ListingStatus } from '../entities/marketplace.entity';
import { Nft } from '../entities/nft.entity';
import { BlockchainService } from './blockchain.service';

interface MarketplaceQueryOptions {
  page: number;
  limit: number;
  type?: string;
}

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name);

  constructor(
    @InjectRepository(Marketplace)
    private marketplaceRepository: Repository<Marketplace>,
    @InjectRepository(Nft)
    private nftRepository: Repository<Nft>,
    private blockchainService: BlockchainService,
  ) {}

  /**
   * List an NFT for sale on the marketplace
   * @param nftId The ID of the NFT to list
   * @param listingData The listing details
   * @returns The created marketplace listing
   */
  async listNft(nftId: string, listingData: any): Promise<Marketplace> {
    this.logger.log(`Listing NFT ${nftId} on marketplace`);
    
    // Find the NFT
    const nft = await this.nftRepository.findOne({ where: { id: nftId } });
    if (!nft) {
      throw new NotFoundException(`NFT with ID ${nftId} not found`);
    }
    
    // Verify the seller is the NFT owner
    if (nft.ownerId !== listingData.sellerId) {
      throw new BadRequestException('Only the owner can list an NFT for sale');
    }
    
    // Check if the NFT is already listed
    const existingListing = await this.marketplaceRepository.findOne({
      where: { 
        nftId,
        status: ListingStatus.ACTIVE,
      },
    });
    
    if (existingListing) {
      throw new BadRequestException('This NFT is already listed for sale');
    }
    
    // Create the marketplace listing
    const listing = this.marketplaceRepository.create({
      nftId,
      sellerId: listingData.sellerId,
      price: listingData.price,
      currency: listingData.currency || 'FIXIE',
      listingDate: new Date(),
      expirationDate: listingData.expirationDate,
      contractAddress: nft.contractAddress,
      isAuction: listingData.isAuction || false,
      minimumBid: listingData.minimumBid,
      auctionEndDate: listingData.auctionEndDate,
      status: ListingStatus.ACTIVE,
      transactionHistory: [{
        type: 'listing',
        sellerId: listingData.sellerId,
        price: listingData.price,
        timestamp: new Date(),
      }],
    });
    
    // Update the NFT's listing status
    nft.isListed = true;
    nft.listingPrice = listingData.price;
    await this.nftRepository.save(nft);
    
    // Save and return the listing
    return this.marketplaceRepository.save(listing);
  }
  
  /**
   * Remove an NFT listing from the marketplace
   * @param nftId The ID of the NFT to delist
   * @returns Success message
   */
  async removeListing(nftId: string): Promise<{ message: string }> {
    this.logger.log(`Removing NFT ${nftId} from marketplace`);
    
    // Find the NFT
    const nft = await this.nftRepository.findOne({ where: { id: nftId } });
    if (!nft) {
      throw new NotFoundException(`NFT with ID ${nftId} not found`);
    }
    
    // Find the listing
    const listing = await this.marketplaceRepository.findOne({
      where: { 
        nftId,
        status: ListingStatus.ACTIVE,
      },
    });
    
    if (!listing) {
      throw new NotFoundException(`No active listing found for NFT ${nftId}`);
    }
    
    // Update the listing status
    listing.status = ListingStatus.CANCELLED;
    
    // Add to transaction history
    const transactionHistory = listing.transactionHistory || [];
    transactionHistory.push({
      type: 'cancellation',
      sellerId: listing.sellerId,
      timestamp: new Date(),
    });
    listing.transactionHistory = transactionHistory;
    
    // Update the NFT's listing status
    nft.isListed = false;
    nft.listingPrice = null;
    await this.nftRepository.save(nft);
    
    // Save the updated listing
    await this.marketplaceRepository.save(listing);
    
    return { message: 'Listing removed successfully' };
  }
  
  /**
   * Purchase an NFT from the marketplace
   * @param listingId The ID of the marketplace listing
   * @param purchaseData The purchase details
   * @returns The updated marketplace listing
   */
  async purchaseNft(listingId: string, purchaseData: any): Promise<Marketplace> {
    this.logger.log(`Processing purchase for listing ${listingId}`);
    
    // Find the listing
    const listing = await this.marketplaceRepository.findOne({ where: { id: listingId } });
    if (!listing) {
      throw new NotFoundException(`Listing with ID ${listingId} not found`);
    }
    
    // Verify the listing is active
    if (listing.status !== ListingStatus.ACTIVE) {
      throw new BadRequestException(`Listing is not active (status: ${listing.status})`);
    }
    
    // Find the NFT
    const nft = await this.nftRepository.findOne({ where: { id: listing.nftId } });
    if (!nft) {
      throw new NotFoundException(`NFT with ID ${listing.nftId} not found`);
    }
    
    // In a real implementation, we would verify payment here
    // For this example, we'll assume payment has been made
    
    // Execute the NFT transfer on the blockchain
    await this.blockchainService.transferToken(
      listing.sellerId,
      purchaseData.buyerId,
      nft.tokenId,
    );
    
    // Update the NFT ownership
    nft.ownerId = purchaseData.buyerId;
    nft.isListed = false;
    nft.listingPrice = null;
    nft.txHash = `0x${Math.random().toString(16).substring(2, 42)}`; // Simulated transaction hash
    await this.nftRepository.save(nft);
    
    // Update the listing status
    listing.status = ListingStatus.SOLD;
    listing.buyerId = purchaseData.buyerId;
    listing.soldDate = new Date();
    listing.txHash = nft.txHash;
    
    // Add to transaction history
    const transactionHistory = listing.transactionHistory || [];
    transactionHistory.push({
      type: 'purchase',
      sellerId: listing.sellerId,
      buyerId: purchaseData.buyerId,
      price: listing.price,
      timestamp: new Date(),
      txHash: listing.txHash,
    });
    listing.transactionHistory = transactionHistory;
    
    // Save and return the updated listing
    return this.marketplaceRepository.save(listing);
  }
  
  /**
   * Update the price of a marketplace listing
   * @param listingId The ID of the marketplace listing
   * @param updateData The updated listing data
   * @returns The updated marketplace listing
   */
  async updateListingPrice(listingId: string, updateData: any): Promise<Marketplace> {
    this.logger.log(`Updating price for listing ${listingId}`);
    
    // Find the listing
    const listing = await this.marketplaceRepository.findOne({ where: { id: listingId } });
    if (!listing) {
      throw new NotFoundException(`Listing with ID ${listingId} not found`);
    }
    
    // Verify the listing is active
    if (listing.status !== ListingStatus.ACTIVE) {
      throw new BadRequestException(`Listing is not active (status: ${listing.status})`);
    }
    
    // Verify the seller is the one updating the price
    if (listing.sellerId !== updateData.sellerId) {
      throw new BadRequestException('Only the seller can update the listing price');
    }
    
    // Update the listing price
    const oldPrice = listing.price;
    listing.price = updateData.price;
    
    // Add to transaction history
    const transactionHistory = listing.transactionHistory || [];
    transactionHistory.push({
      type: 'price_update',
      sellerId: listing.sellerId,
      oldPrice,
      newPrice: updateData.price,
      timestamp: new Date(),
    });
    listing.transactionHistory = transactionHistory;
    
    // Update the NFT's listing price
    const nft = await this.nftRepository.findOne({ where: { id: listing.nftId } });
    if (nft) {
      nft.listingPrice = updateData.price;
      await this.nftRepository.save(nft);
    }
    
    // Save and return the updated listing
    return this.marketplaceRepository.save(listing);
  }
  
  /**
   * Place a bid on an auction listing
   * @param listingId The ID of the marketplace listing
   * @param bidData The bid data
   * @returns The updated marketplace listing
   */
  async placeBid(listingId: string, bidData: any): Promise<Marketplace> {
    this.logger.log(`Processing bid for listing ${listingId}`);
    
    // Find the listing
    const listing = await this.marketplaceRepository.findOne({ where: { id: listingId } });
    if (!listing) {
      throw new NotFoundException(`Listing with ID ${listingId} not found`);
    }
    
    // Verify the listing is active
    if (listing.status !== ListingStatus.ACTIVE) {
      throw new BadRequestException(`Listing is not active (status: ${listing.status})`);
    }
    
    // Verify this is an auction listing
    if (!listing.isAuction) {
      throw new BadRequestException('This listing is not an auction');
    }
    
    // Verify the auction hasn't ended
    if (listing.auctionEndDate && new Date(listing.auctionEndDate) < new Date()) {
      throw new BadRequestException('This auction has ended');
    }
    
    // Verify the bid is higher than the minimum bid
    if (listing.minimumBid && bidData.amount < listing.minimumBid) {
      throw new BadRequestException(`Bid must be at least ${listing.minimumBid}`);
    }
    
    // Verify the bid is higher than the current highest bid
    const bids = listing.bids || [];
    const highestBid = bids.length > 0 
      ? bids.reduce((prev, current) => 
          (prev.amount > current.amount) ? prev : current
        ) 
      : null;
      
    if (highestBid && bidData.amount <= highestBid.amount) {
      throw new BadRequestException(`Bid must be higher than the current highest bid of ${highestBid.amount}`);
    }
    
    // Add the new bid
    bids.push({
      bidderId: bidData.bidderId,
      amount: bidData.amount,
      timestamp: new Date(),
    });
    listing.bids = bids;
    
    // Save and return the updated listing
    return this.marketplaceRepository.save(listing);
  }
  
  /**
   * Find all marketplace listings with pagination
   * @param options Query options (pagination, filtering)
   * @returns Paginated marketplace listings
   */
  async findAllListings(options: MarketplaceQueryOptions): Promise<{ items: Marketplace[]; total: number }> {
    const { page, limit, type } = options;
    const skip = (page - 1) * limit;
    
    const queryBuilder = this.marketplaceRepository.createQueryBuilder('listing')
      .leftJoinAndSelect('nfts', 'nft', 'nft.id = listing.nftId')
      .where('listing.status = :status', { status: ListingStatus.ACTIVE })
      .orderBy('listing.createdAt', 'DESC')
      .skip(skip)
      .take(limit);
      
    if (type) {
      queryBuilder.andWhere('nft.type = :type', { type });
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
    };
  }
  
  /**
   * Find listings by seller
   * @param sellerId The ID of the seller
   * @param options Query options (pagination)
   * @returns Paginated marketplace listings by seller
   */
  async findListingsBySeller(
    sellerId: string,
    options: MarketplaceQueryOptions,
  ): Promise<{ items: Marketplace[]; total: number }> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;
    
    const [items, total] = await this.marketplaceRepository.findAndCount({
      where: { sellerId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      items,
      total,
    };
  }
  
  /**
   * Find listing details by ID
   * @param id The ID of the marketplace listing
   * @returns The marketplace listing with NFT details
   */
  async findListingById(id: string): Promise<any> {
    const listing = await this.marketplaceRepository.findOne({ where: { id } });
    if (!listing) {
      throw new NotFoundException(`Listing with ID ${id} not found`);
    }
    
    // Get the associated NFT
    const nft = await this.nftRepository.findOne({ where: { id: listing.nftId } });
    
    return {
      ...listing,
      nft,
    };
  }
}

