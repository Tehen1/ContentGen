import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put, 
  Delete, 
  Query, 
  HttpStatus,
  ParseUUIDPipe,
  UseGuards
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiBearerAuth 
} from '@nestjs/swagger';
import { ActivityService } from '../services/activity.service';
import { Activity, ActivityType } from '../entities/activity.entity';
import { CreateActivityDto } from '../dto/create-activity.dto';
import { UpdateActivityDto } from '../dto/update-activity.dto';

@ApiTags('activities')
@ApiBearerAuth()
@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new activity' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'The activity has been successfully created',
    type: Activity
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid data provided' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized' 
  })
  create(@Body() createActivityDto: CreateActivityDto): Promise<Activity> {
    return this.activityService.create(createActivityDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Find all activities for a user' })
  @ApiParam({ 
    name: 'userId', 
    description: 'User ID', 
    example: '12345abcde' 
  })
  @ApiQuery({ 
    name: 'start', 
    required: false, 
    description: 'Start date in ISO format (YYYY-MM-DD)', 
    example: '2023-01-01' 
  })
  @ApiQuery({ 
    name: 'end', 
    required: false, 
    description: 'End date in ISO format (YYYY-MM-DD)', 
    example: '2023-12-31' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'List of activities',
    type: [Activity] 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized' 
  })
  findAll(
    @Param('userId') userId: string,
    @Query('start') startDate?: string,
    @Query('end') endDate?: string,
  ): Promise<Activity[]> {
    if (startDate && endDate) {
      return this.activityService.getActivitiesByDateRange(
        userId,
        new Date(startDate),
        new Date(endDate),
      );
    }
    return this.activityService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find an activity by ID' })
  @ApiParam({ 
    name: 'id', 
    description: 'Activity ID', 
    example: '123e4567-e89b-12d3-a456-426614174000' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'The activity has been found',
    type: Activity 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Activity not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized' 
  })
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Activity> {
    return this.activityService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an activity' })
  @ApiParam({ 
    name: 'id', 
    description: 'Activity ID to update', 
    example: '123e4567-e89b-12d3-a456-426614174000' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'The activity has been successfully updated',
    type: Activity 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Activity not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid data provided' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized' 
  })
  update(
    @Param('id', new ParseUUIDPipe()) id: string, 
    @Body() updateData: UpdateActivityDto
  ): Promise<Activity> {
    return this.activityService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an activity' })
  @ApiParam({ 
    name: 'id', 
    description: 'Activity ID to delete', 
    example: '123e4567-e89b-12d3-a456-426614174000' 
  })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'The activity has been successfully deleted' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Activity not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized' 
  })
  remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.activityService.remove(id);
  }

  @Get('user/:userId/type/:type')
  @ApiOperation({ summary: 'Find activities by type for a user' })
  @ApiParam({ 
    name: 'userId', 
    description: 'User ID', 
    example: '12345abcde' 
  })
  @ApiParam({ 
    name: 'type', 
    description: 'Activity type', 
    enum: ActivityType 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'List of activities by type',
    type: [Activity] 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized' 
  })
  getByType(
    @Param('userId') userId: string,
    @Param('type') type: ActivityType,
  ): Promise<Activity[]> {
    return this.activityService.getActivitiesByType(userId, type);
  }

  @Get('stats/user/:userId')
  @ApiOperation({ summary: 'Get activity statistics for a user' })
  @ApiParam({ 
    name: 'userId', 
    description: 'User ID', 
    example: '12345abcde' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User activity statistics' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized' 
  })
  getUserStats(@Param('userId') userId: string): Promise<any> {
    return this.activityService.getUserStats(userId);
  }
}
