import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpStatus,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { NftService } from '../services/nft.service';
import { IpfsService } from '../services/ipfs.service';
import { MarketplaceService } from '../services/marketplace.service';

// Assuming these DTOs would be created in the dto directory
// import { CreateNftDto } from '../dto/create-nft.dto';
// import { UpdateNftDto } from '../dto/update-nft.dto';
// import { ListNftDto } from '../dto/list-nft.dto';
// import { TransferNftDto } from '../dto/transfer-nft.dto';

@ApiTags('nft')
@ApiBearerAuth()
@Controller('nft')
export class NftController {
  constructor(
    private readonly nftService: NftService,
    private readonly ipfsService: IpfsService,
    private readonly marketplaceService: MarketplaceService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Mint a new NFT' })
  @ApiResponse({ status: 201, description: 'NFT minted successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async mintNft(@Body() createNftDto: any) { // Replace with CreateNftDto
    return this.nftService.mintNft(createNftDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all NFTs for a user' })
  @ApiQuery({ name: 'userId', required: true, description: 'User ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @ApiResponse({ status: 200, description: 'Return all NFTs for the user.' })
  async findAll(
    @Query('userId', ParseUUIDPipe) userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.nftService.findAllByUser(userId, { page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an NFT by ID' })
  @ApiResponse({ status: 200, description: 'Return the NFT.' })
  @ApiResponse({ status: 404, description: 'NFT not found.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.nftService.findOne(id);
  }

  @Get('token/:tokenId')
  @ApiOperation({ summary: 'Get an NFT by token ID' })
  @ApiResponse({ status: 200, description: 'Return the NFT.' })
  @ApiResponse({ status: 404, description: 'NFT not found.' })
  async findByTokenId(@Param('tokenId') tokenId: string) {
    return this.nftService.findByTokenId(tokenId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update NFT metadata' })
  @ApiResponse({ status: 200, description: 'NFT updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'NFT not found.' })
  async updateMetadata(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNftDto: any, // Replace with UpdateNftDto
  ) {
    return this.nftService.updateMetadata(id, updateNftDto);
  }

  @Post(':id/transfer')
  @ApiOperation({ summary: 'Transfer NFT ownership' })
  @ApiResponse({ status: 200, description: 'NFT transferred successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'NFT not found.' })
  async transferNft(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() transferNftDto: any, // Replace with TransferNftDto
  ) {
    return this.nftService.transferOwnership(id, transferNftDto);
  }

  @Post(':id/list')
  @ApiOperation({ summary: 'List NFT on marketplace' })
  @ApiResponse({ status: 201, description: 'NFT listed successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'NFT not found.' })
  async listOnMarketplace(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() listNftDto: any, // Replace with ListNftDto
  ) {
    return this.marketplaceService.listNft(id, listNftDto);
  }

  @Delete(':id/list')
  @ApiOperation({ summary: 'Remove NFT listing from marketplace' })
  @ApiResponse({ status: 200, description: 'NFT listing removed successfully.' })
  @ApiResponse({ status: 404, description: 'NFT or listing not found.' })
  async removeFromMarketplace(@Param('id', ParseUUIDPipe) id: string) {
    return this.marketplaceService.removeListing(id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get NFT transaction history' })
  @ApiResponse({ status: 200, description: 'Return the NFT transaction history.' })
  @ApiResponse({ status: 404, description: 'NFT not found.' })
  async getNftHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.nftService.getTransactionHistory(id);
  }

  @Get('marketplace/listings')
  @ApiOperation({ summary: 'Get all marketplace listings' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @ApiQuery({ name: 'type', required: false, description: 'NFT type filter' })
  @ApiResponse({ status: 200, description: 'Return all marketplace listings.' })
  async getMarketplaceListings(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('type') type?: string,
  ) {
    return this.marketplaceService.findAllListings({ page, limit, type });
  }

  @Post('upload/metadata')
  @ApiOperation({ summary: 'Upload NFT metadata to IPFS' })
  @ApiResponse({ status: 201, description: 'Metadata uploaded successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid metadata.' })
  async uploadMetadata(@Body() metadata: any) {
    return this.ipfsService.uploadMetadata(metadata);
  }
}

