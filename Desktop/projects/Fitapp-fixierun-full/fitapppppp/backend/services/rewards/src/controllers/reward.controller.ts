import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
  BadRequestException,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RewardService } from '../services/reward.service';
import { BlockchainService } from '../services/blockchain.service';
import { CreateRewardDto } from '../dto/create-reward.dto';
import { UserBalanceDto } from '../dto/user-balance.dto';
import { Reward, RewardStatus } from '../entities/reward.entity';
import { ParseEthereumAddressPipe } from '../pipes/ethereum-address.pipe';

@ApiTags('rewards')
@Controller('rewards')
export class RewardController {
  constructor(
    private readonly rewardService: RewardService,
    private readonly blockchainService: BlockchainService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reward' })
  @ApiBody({ type: CreateRewardDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The reward has been successfully created.',
    type: Reward,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  async createReward(@Body(ValidationPipe) createRewardDto: CreateRewardDto): Promise<Reward> {
    try {
      return await this.rewardService.create(createRewardDto);
    } catch (error) {
      throw new BadRequestException(`Failed to create reward: ${error.message}`);
    }
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all rewards for a user' })
  @ApiParam({
    name: 'userId',
    description: 'Ethereum address of the user',
    example: '0x71C23bD19f56E521948a6D3111955C79557EB1C8',
  })
  @ApiQuery({
    name: 'from',
    description: 'Start date for filtering rewards (ISO format)',
    required: false,
    example: '2023-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'to',
    description: 'End date for filtering rewards (ISO format)',
    required: false,
    example: '2023-12-31T23:59:59Z',
  })
  @ApiQuery({
    name: 'status',
    description: 'Filter by reward status',
    required: false,
    enum: RewardStatus,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of rewards for the user',
    type: [Reward],
  })
  async getUserRewards(
    @Param('userId', ParseEthereumAddressPipe) userId: string,
    @Query('from') fromDate?: string,
    @Query('to') toDate?: string,
    @Query('status') status?: RewardStatus,
  ): Promise<Reward[]> {
    const dateFrom = fromDate ? new Date(fromDate) : undefined;
    const dateTo = toDate ? new Date(toDate) : undefined;
    
    return this.rewardService.findAllByUser(userId, dateFrom, dateTo, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific reward by ID' })
  @ApiParam({
    name: 'id',
    description: 'Reward UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The reward',
    type: Reward,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Reward not found',
  })
  async getReward(@Param('id', ParseUUIDPipe) id: string): Promise<Reward> {
    try {
      return await this.rewardService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to retrieve reward: ${error.message}`);
    }
  }

  @Put(':id/process')
  @ApiOperation({ summary: 'Process a pending reward (send tokens)' })
  @ApiParam({
    name: 'id',
    description: 'Reward UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The reward has been processed',
    type: Reward,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Unable to process reward',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Reward not found',
  })
  async processReward(@Param('id', ParseUUIDPipe) id: string): Promise<Reward> {
    try {
      return await this.rewardService.processReward(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to process reward: ${error.message}`);
    }
  }

  @Put(':id/claim')
  @ApiOperation({ summary: 'Claim a processed reward' })
  @ApiParam({
    name: 'id',
    description: 'Reward UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'userId',
    description: 'Ethereum address of the user claiming the reward',
    required: true,
    example: '0x71C23bD19f56E521948a6D3111955C79557EB1C8',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The reward has been claimed',
    type: Reward,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Unable to claim reward',
  })
  async claimReward(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('userId', ParseEthereumAddressPipe) userId: string,
  ): Promise<Reward> {
    try {
      return await this.rewardService.claimReward(id, userId);
    } catch (error) {
      throw new BadRequestException(`Failed to claim reward: ${error.message}`);
    }
  }

  @Get('balance/:userId')
  @ApiOperation({ summary: 'Get a user\'s token balance' })
  @ApiParam({
    name: 'userId',
    description: 'Ethereum address of the user',
    example: '0x71C23bD19f56E521948a6D3111955C79557EB1C8',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User balance information',
    type: UserBalanceDto,
  })
  async getUserBalance(
    @Param('userId', ParseEthereumAddressPipe) userId: string,
  ): Promise<UserBalanceDto> {
    try {
      return await this.rewardService.getUserBalance(userId);
    } catch (error) {
      throw new BadRequestException(`Failed to retrieve balance: ${error.message}`);
    }
  }

  @Get('summary/:userId')
  @ApiOperation({ summary: 'Get a summary of a user\'s rewards' })
  @ApiParam({
    name: 'userId',
    description: 'Ethereum address of the user',
    example: '0x71C23bD19f56E521948a6D3111955C79557EB1C8',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User rewards summary',
  })
  async getUserRewardSummary(
    @Param('userId', ParseEthereumAddressPipe) userId: string,
  ): Promise<any> {
    try {
      return await this.rewardService.getUserRewardSummary(userId);
    } catch (error) {
      throw new BadRequestException(`Failed to retrieve reward summary: ${error.message}`);
    }
  }

  @Get('token/details')
  @ApiOperation({ summary: 'Get FIXIE token details' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token details including name, symbol, and total supply',
  })
  async getTokenDetails(): Promise<any> {
    try {
      return await this.blockchainService.getTokenDetails();
    } catch (error) {
      throw new BadRequestException(`Failed to retrieve token details: ${error.message}`);
    }
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service health information',
  })
  async healthCheck(): Promise<any> {
    const blockchainStatus = await this.blockchainService.checkConnection();
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      blockchain: blockchainStatus,
    };
  }
}

