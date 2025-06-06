import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  ParseBoolPipe,
  DefaultValuePipe,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { ChallengesService } from '../services/challenges.service';
import { CreateChallengeDto } from '../dto/create-challenge.dto';
import { UserChallengeStatus } from '../entities/user-challenge.entity';

@ApiTags('challenges')
@ApiBearerAuth()
@Controller('challenges')
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new challenge' })
  @ApiBody({ type: CreateChallengeDto, description: 'Challenge data' })
  @ApiResponse({ status: 201, description: 'Challenge created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async createChallenge(@Body() createChallengeDto: CreateChallengeDto) {
    return this.challengesService.create(createChallengeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active challenges' })
  @ApiQuery({ name: 'includeExpired', required: false, type: Boolean, description: 'Include expired challenges' })
  @ApiResponse({ status: 200, description: 'Return all active challenges.' })
  async findAllActive(
    @Query('includeExpired', new DefaultValuePipe(false), ParseBoolPipe) includeExpired: boolean,
  ) {
    return this.challengesService.findAllActive(includeExpired);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all challenges for a user' })
  @ApiParam({ name: 'userId', required: true, description: 'User ID' })
  @ApiQuery({ name: 'status', required: false, enum: UserChallengeStatus, description: 'Filter by challenge status' })
  @ApiResponse({ status: 200, description: 'Return all challenges for the user.' })
  async findAllForUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('status') status?: UserChallengeStatus,
  ) {
    return this.challengesService.findAllForUser(userId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a challenge by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Challenge ID' })
  @ApiResponse({ status: 200, description: 'Return the challenge.' })
  @ApiResponse({ status: 404, description: 'Challenge not found.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.challengesService.findOne(id);
  }

  @Get(':id/user/:userId')
  @ApiOperation({ summary: 'Get a user\'s status for a challenge' })
  @ApiParam({ name: 'id', required: true, description: 'Challenge ID' })
  @ApiParam({ name: 'userId', required: true, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Return the user\'s challenge status.' })
  @ApiResponse({ status: 404, description: 'Challenge or user challenge not found.' })
  async getUserChallengeStatus(
    @Param('id', ParseUUIDPipe) challengeId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.challengesService.getUserChallengeStatus(challengeId, userId);
  }

  @Post(':id/join/:userId')
  @ApiOperation({ summary: 'Join a user to a challenge' })
  @ApiParam({ name: 'id', required: true, description: 'Challenge ID' })
  @ApiParam({ name: 'userId', required: true, description: 'User ID' })
  @ApiResponse({ status: 201, description: 'User joined the challenge successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data or user not eligible.' })
  @ApiResponse({ status: 404, description: 'Challenge not found.' })
  async joinChallenge(
    @Param('id', ParseUUIDPipe) challengeId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.challengesService.joinChallenge(challengeId, userId);
  }

  @Patch(':id/progress/:userId')
  @ApiOperation({ summary: 'Update a user\'s progress in a challenge' })
  @ApiParam({ name: 'id', required: true, description: 'Challenge ID' })
  @ApiParam({ name: 'userId', required: true, description: 'User ID' })
  @ApiBody({ description: 'Progress data' })
  @ApiResponse({ status: 200, description: 'Progress updated successfully.' })
  @ApiResponse({ status: 404, description: 'Challenge or user challenge not found.' })
  async updateUserProgress(
    @Param('id', ParseUUIDPipe) challengeId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() progressData: any,
  ) {
    return this.challengesService.updateUserProgress(challengeId, userId, progressData);
  }

  @Post('user-challenge/:id/claim/:userId')
  @ApiOperation({ summary: 'Claim the reward for a completed challenge' })
  @ApiParam({ name: 'id', required: true, description: 'User Challenge ID' })
  @ApiParam({ name: 'userId', required: true, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Reward claimed successfully.' })
  @ApiResponse({ status: 400, description: 'Challenge not completed or already claimed.' })
  @ApiResponse({ status: 404, description: 'User challenge not found.' })
  async claimReward(
    @Param('id', ParseUUIDPipe) userChallengeId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.challengesService.claimReward(userChallengeId, userId);
  }

  @Get('completed/:userId')
  @ApiOperation({ summary: 'Get challenges completed by a user on a specific date' })
  @ApiParam({ name: 'userId', required: true, description: 'User ID' })
  @ApiQuery({ name: 'date', required: true, description: 'Date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Return completed challenges for the date.' })
  async findCompletedByDate(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('date') date: string,
  ) {
    return this.challengesService.findCompletedByDate(userId, date);
  }

  @Get('leaderboard/:id')
  @ApiOperation({ summary: 'Get leaderboard for a challenge' })
  @ApiParam({ name: 'id', required: true, description: 'Challenge ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of users to include' })
  @ApiResponse({ status: 200, description: 'Return the challenge leaderboard.' })
  @ApiResponse({ status: 404, description: 'Challenge not found.' })
  async getChallengeLeaderboard(
    @Param('id', ParseUUIDPipe) challengeId: string,
    @Query('limit', new DefaultValuePipe(10)) limit: number,
  ) {
    // This would need to be implemented in the service
    return {
      challengeId,
      message: 'Leaderboard functionality not implemented yet',
      users: [],
    };
  }
}

