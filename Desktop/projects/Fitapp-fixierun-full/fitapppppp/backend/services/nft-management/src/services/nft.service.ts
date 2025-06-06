import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nft, NftType } from '../entities/nft.entity';
import { BlockchainService } from './blockchain.service';
// Assuming these DTOs would be created
// import { CreateNftDto } from '../dto/create-nft.dto';
// import { UpdateNftDto } from '../dto/update-nft.dto';
// import { TransferNftDto } from '../dto/transfer-nft.dto';

interface PaginationOptions {
  page: number;
  limit: number;
  type?: NftType;
}

@Injectable()
export class NftService {
  private readonly logger = new Logger(NftService.name);

  constructor(
    @InjectRepository(Nft)
    private nftRepository: Repository<Nft>,
    private blockchainService: BlockchainService,
  ) {}

  async mintNft(createNftDto: any): Promise<Nft> {
    this.logger.log(`Minting NFT for user ${createNftDto.ownerId}`);
    
    // Verify if the metadata is valid
    if (!createNftDto.ipfsHash) {
      throw new BadRequestException('NFT metadata IPFS hash is required');
    }
    
    // In a real implementation, we would interact with the blockchain to mint the NFT
    // For this example, we'll simulate the blockchain interaction
    const tokenId = await this.blockchainService.mintToken(
      createNftDto.ownerId, 
      createNftDto.ipfsHash
    );
    
    // Create a new NFT entity with the blockchain token ID
    const nft = this.nftRepository.create({
      ...createNftDto,
      tokenId,
      txHash: `0x${Math.random().toString(16).substring(2, 42)}`, // Simulated transaction hash
    });
    
    return this.nftRepository.save(nft);
  }

  async findAllByUser(
    userId: string,
    options: PaginationOptions,
  ): Promise<{ items: Nft[]; total: number }> {
    const { page, limit, type } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.nftRepository.createQueryBuilder('nft')
      .where('nft.ownerId = :userId', { userId })
      .orderBy('nft.createdAt', 'DESC')
      .skip(skip)
      .take(limit);
      
    if (type) {
      queryBuilder.andWhere('nft.type = :type', { type });
    }

    const [nfts, total] = await queryBuilder.getManyAndCount();

    return {
      items: nfts,
      total,
    };
  }

  async findOne(id: string): Promise<Nft> {
    const nft = await this.nftRepository.findOne({ where: { id } });
    
    if (!nft) {
      this.logger.error(`NFT with ID ${id} not found`);
      throw new NotFoundException(`NFT with ID ${id} not found`);
    }
    
    return nft;
  }

  async findByTokenId(tokenId: string): Promise<Nft> {
    const nft = await this.nftRepository.findOne({ where: { tokenId } });
    
    if (!nft) {
      this.logger.error(`NFT with token ID ${tokenId} not found`);
      throw new NotFoundException(`NFT with token ID ${tokenId} not found`);
    }
    
    return nft;
  }

  async updateMetadata(id: string, updateNftDto: any): Promise<Nft> {
    const nft = await this.findOne(id);
    
    // In a real implementation, we would update the metadata on IPFS
    // and possibly update the blockchain if necessary
    
    // For this example, we'll just update the database record
    Object.assign(nft, updateNftDto);
    
    // If IPFS hash is being updated, we should update it on the blockchain too
    if (updateNftDto.ipfsHash && updateNftDto.ipfsHash !== nft.ipfsHash) {
      await this.blockchainService.updateTokenMetadata(nft.tokenId, updateNftDto.ipfsHash);
      nft.txHash = `0x${Math.random().toString(16).substring(2, 42)}`; // Simulated transaction hash
    }
    
    return this.nftRepository.save(nft);
  }

  async transferOwnership(id: string, transferNftDto: any): Promise<Nft> {
    const nft = await this.findOne(id);
    
    // Verify the sender is the current owner
    if (nft.ownerId !== transferNftDto.fromUserId) {
      throw new BadRequestException('Only the owner can transfer an NFT');
    }
    
    // In a real implementation, we would interact with the blockchain to transfer the NFT
    await this.blockchainService.transferToken(
      transferNftDto.fromUserId,
      transferNftDto.toUserId,
      nft.tokenId
    );
    
    // Update the NFT ownership in our database
    nft.ownerId = transferNftDto.toUserId;
    nft.txHash = `0x${Math.random().toString(16).substring(2, 42)}`; // Simulated transaction hash
    
    // Record the transfer in the transaction history
    const transactionHistory = nft.attributes?.transactionHistory || [];
    transactionHistory.push({
      type: 'transfer',
      fromUserId: transferNftDto.fromUserId,
      toUserId: transferNftDto.toUserId,
      timestamp: new Date(),
      txHash: nft.txHash,
    });
    
    nft.attributes = {
      ...nft.attributes,
      transactionHistory,
    };
    
    return this.nftRepository.save(nft);
  }

  async getTransactionHistory(id: string): Promise<any> {
    const nft = await this.findOne(id);
    
    // In a real implementation, we would query the blockchain for the complete transaction history
    // For this example, we'll just return the transaction history stored in our database
    
    return {
      nftId: nft.id,
      tokenId: nft.tokenId,
      history: nft.attributes?.transactionHistory || [],
    };
  }
}

