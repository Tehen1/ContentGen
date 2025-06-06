import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AnalyticsService } from '../services/analytics.service';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('users/:userId/daily-stats')
  @ApiOperation({ summary: 'Update daily statistics for a user' })
  @ApiParam({ name: 'userId', required: true, description: 'User ID' })
  @ApiQuery({ name: 'date', required: false, description: 'Date for the statistics (YYYY-MM-DD format). Defaults to today if not provided.' })
  @ApiResponse({ status: 201, description: 'Daily statistics updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async updateDailyStats(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('date') dateStr?: string,
  ) {
    const date = dateStr ? new Date(dateStr) : undefined;
    return this.analyticsService.updateDailyStats(userId, date);
  }

  @Get('users/:userId/stats')
  @ApiOperation({ summary: 'Get user statistics for a specific period' })
  @ApiParam({ name: 'userId', required: true, description: 'User ID' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Start date for the period (YYYY-MM-DD format)' })
  @ApiQuery({ name: 'endDate', required: true, description: 'End date for the period (YYYY-MM-DD format)' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async getUserStatsForPeriod(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('startDate') startDateStr: string,
    @Query('endDate') endDateStr: string,
  ) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    return this.analyticsService.getUserStatsForPeriod(userId, startDate, endDate);
  }

  @Get('users/:userId/trends')
  @ApiOperation({ summary: 'Generate activity trends for a user' })
  @ApiParam({ name: 'userId', required: true, description: 'User ID' })
  @ApiQuery({ name: 'months', required: false, description: 'Number of months to analyze', type: Number })
  @ApiResponse({ status: 200, description: 'Activity trends generated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async generateActivityTrends(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('months', new DefaultValuePipe(3), ParseIntPipe) months: number,
  ) {
    return this.analyticsService.generateActivityTrends(userId, months);
  }

  @Get('platform/summary')
  @ApiOperation({ summary: 'Get platform-wide analytics summary' })
  @ApiResponse({ status: 200, description: 'Platform summary retrieved successfully.' })
  async getPlatformSummary() {
    // This endpoint would need to be implemented in the AnalyticsService
    // For now, return a placeholder response
    return {
      totalUsers: 0,
      totalActivities: 0,
      totalDistance: 0,
      totalTokensAwarded: 0,
      activeUsersLast7Days: 0,
      averageActivitiesPerUser: 0,
      message: 'Platform summary statistics not implemented yet.'
    };
  }

  @Get('platform/leaderboard')
  @ApiOperation({ summary: 'Get platform leaderboard' })
  @ApiQuery({ name: 'metric', required: false, description: 'Metric to rank by (distance, activities, tokens)', enum: ['distance', 'activities', 'tokens'] })
  @ApiQuery({ name: 'period', required: false, description: 'Time period (daily, weekly, monthly, allTime)', enum: ['daily', 'weekly', 'monthly', 'allTime'] })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of users to include', type: Number })
  @ApiResponse({ status: 200, description: 'Leaderboard retrieved successfully.' })
  async getLeaderboard(
    @Query('metric', new DefaultValuePipe('distance')) metric: string,
    @Query('period', new DefaultValuePipe('weekly')) period: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    // This endpoint would need to be implemented in the AnalyticsService
    // For now, return a placeholder response
    return {
      metric,
      period,
      users: [],
      message: 'Leaderboard functionality not implemented yet.'
    };
  }
}

