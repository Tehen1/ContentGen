import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityService } from '../src/services/activity.service';
import { Activity, ActivityType } from '../src/entities/activity.entity';
import { CreateActivityDto } from '../src/dto/create-activity.dto';
import { UpdateActivityDto } from '../src/dto/update-activity.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// Mocks
const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
});

type MockRepository<T extends object = object> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('ActivityService', () => {
  let service: ActivityService;
  let repository: MockRepository<Activity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityService,
        {
          provide: getRepositoryToken(Activity),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
    repository = module.get<MockRepository<Activity>>(getRepositoryToken(Activity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create an activity', async () => {
      const mockDto: CreateActivityDto = {
        userId: 'user123',
        type: ActivityType.RUNNING,
        distance: 5.0,
        duration: 1800, // 30 minutes
        startedAt: '2023-05-01T08:00:00Z',
        endedAt: '2023-05-01T08:30:00Z',
      };

      const mockActivity = {
        id: 'activity123',
        ...mockDto,
        averageSpeed: 10.0,
        maxSpeed: null,
        routeData: null,
        notes: null,
        isMultiplayer: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        startedAt: new Date(mockDto.startedAt!),
        endedAt: new Date(mockDto.endedAt!),
        tokensEarned: 25,
      };

      repository.create?.mockReturnValue(mockActivity);
      repository.save?.mockResolvedValue(mockActivity);

      const result = await service.create(mockDto);
      
      expect(repository.create).toHaveBeenCalledWith(expect.any(Object));
      expect(repository.save).toHaveBeenCalledWith(mockActivity);
      expect(result).toEqual(mockActivity);
    });

    it('should throw BadRequestException if end date is before start date', async () => {
      const mockDto: CreateActivityDto = {
        userId: 'user123',
        type: ActivityType.RUNNING,
        distance: 5.0,
        duration: 1800,
        startedAt: '2023-05-01T09:00:00Z', // Later than endedAt
        endedAt: '2023-05-01T08:30:00Z',
      };

      await expect(service.create(mockDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all activities for a user', async () => {
      const mockActivities = [
        { id: 'activity1', userId: 'user123' },
        { id: 'activity2', userId: 'user123' },
      ];

      repository.find?.mockResolvedValue(mockActivities);

      const result = await service.findAll('user123');
      
      expect(repository.find).toHaveBeenCalledWith({
        where: { userId: 'user123' },
        order: { startedAt: 'DESC' },
      });
      expect(result).toEqual(mockActivities);
    });
  });

  describe('findOne', () => {
    it('should return an activity if found', async () => {
      const mockActivity = { id: 'activity123', userId: 'user123' };
      
      repository.findOne?.mockResolvedValue(mockActivity);

      const result = await service.findOne('activity123');
      
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'activity123' } });
      expect(result).toEqual(mockActivity);
    });

    it('should throw NotFoundException if activity not found', async () => {
      repository.findOne?.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an activity successfully', async () => {
      const mockActivity = {
        id: 'activity123',
        userId: 'user123',
        type: ActivityType.RUNNING,
        distance: 5.0,
        duration: 1800,
        averageSpeed: 10.0,
        startedAt: new Date('2023-05-01T08:00:00Z'),
        endedAt: new Date('2023-05-01T08:30:00Z'),
      };

      const updateDto: UpdateActivityDto = {
        distance: 6.0,
        comment: 'Updated comment',
      };

      const updatedActivity = {
        ...mockActivity,
        ...updateDto,
        averageSpeed: 12.0, // Should be recalculated
      };

      repository.findOne?.mockResolvedValue(mockActivity);
      repository.save?.mockResolvedValue(updatedActivity);

      const result = await service.update('activity123', updateDto as Partial<Activity>);
      
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'activity123' } });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedActivity);
    });
  });

  describe('remove', () => {
    it('should remove an activity successfully', async () => {
      const mockActivity = { id: 'activity123', userId: 'user123' };
      
      repository.findOne?.mockResolvedValue(mockActivity);

      await service.remove('activity123');
      
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'activity123' } });
      expect(repository.remove).toHaveBeenCalledWith(mockActivity);
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      const mockActivities = [
        {
          id: 'activity1',
          userId: 'user123',
          type: ActivityType.RUNNING,
          distance: 5.0,
          duration: 1800,
          tokensEarned: 25,
          maxSpeed: 12.0,
          startedAt: new Date('2023-05-01T08:00:00Z'),
          endedAt: new Date('2023-05-01T08:30:00Z'),
        },
        {
          id: 'activity2',
          userId: 'user123',
          type: ActivityType.CYCLING,
          distance: 10.0,
          duration: 2400,
          tokensEarned: 20,
          maxSpeed: 15.0,
          startedAt: new Date('2023-05-02T09:00:00Z'),
          endedAt: new Date('2023-05-02T09:40:00Z'),
        },
      ];

      repository.find?.mockResolvedValue(mockActivities);

      const result = await service.getUserStats('user123');
      
      expect(repository.find).toHaveBeenCalledWith({ where: { userId: 'user123' } });
      expect(result.totalActivities).toBe(2);
      expect(result.totalDistance).toBe(15);
      expect(result.totalTokensEarned).toBe(45);
      expect(result.bestPerformances.fastestSpeed).toBe(15.0);
    });

    it('should return default values when no activities found', async () => {
      repository.find?.mockResolvedValue([]);

      const result = await service.getUserStats('user123');
      
      expect(result.totalActivities).toBe(0);
      expect(result.totalDistance).toBe(0);
      expect(result.latestActivity).toBeNull();
    });
  });

  describe('token rewards', () => {
    it('should calculate token rewards when creating an activity', async () => {
      const mockDto: CreateActivityDto = {
        userId: 'user123',
        type: ActivityType.RUNNING,
        distance: 5.0,
        duration: 1800, // 30 minutes
        startedAt: '2023-05-01T08:00:00Z',
        endedAt: '2023-05-01T08:30:00Z',
      };

      const mockActivity = {
        id: 'activity123',
        ...mockDto,
        averageSpeed: 10.0,
        maxSpeed: null,
        routeData: null,
        notes: null,
        isMultiplayer: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        startedAt: new Date(mockDto.startedAt!),
        endedAt: new Date(mockDto.endedAt!),
        tokensEarned: 25,
      };

      repository.create?.mockReturnValue(mockActivity);
      repository.save?.mockResolvedValue(mockActivity);

      const result = await service.create(mockDto);
      
      expect(result.tokensEarned).toBeGreaterThan(0);
    });

    it('should calculate different token rewards for different activity types', async () => {
      const mockActivities = [
        {
          id: 'activity1',
          userId: 'user123',
          type: ActivityType.RUNNING,
          distance: 5.0,
          duration: 1800,
          startedAt: '2023-05-01T08:00:00Z',
          endedAt: '2023-05-01T08:30:00Z',
        },
        {
          id: 'activity2',
          userId: 'user123',
          type: ActivityType.CYCLING,
          distance: 5.0,
          duration: 1800,
          startedAt: '2023-05-01T08:00:00Z',
          endedAt: '2023-05-01T08:30:00Z',
        },
        {
          id: 'activity3',
          userId: 'user123',
          type: ActivityType.WALKING,
          distance: 5.0,
          duration: 1800,
          startedAt: '2023-05-01T08:00:00Z',
          endedAt: '2023-05-01T08:30:00Z',
        },
      ];

      const results = await Promise.all(
        mockActivities.map(async (activity) => {
          const mockActivity = {
            ...activity,
            averageSpeed: 10.0,
            maxSpeed: null,
            routeData: null,
            notes: null,
            isMultiplayer: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            startedAt: new Date(activity.startedAt),
            endedAt: new Date(activity.endedAt),
            tokensEarned: 0,
          };

          repository.create?.mockReturnValue(mockActivity);
          repository.save?.mockResolvedValue(mockActivity);

          return service.create(activity);
        })
      );

      // Verify that each activity type gets a different token reward
      const uniqueRewards = new Set(results.map(r => r.tokensEarned));
      expect(uniqueRewards.size).toBeGreaterThan(1);
    });
  });
});