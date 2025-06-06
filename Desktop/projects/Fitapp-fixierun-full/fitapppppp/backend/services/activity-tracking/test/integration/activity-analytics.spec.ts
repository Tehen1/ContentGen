import { Test } from '@nestjs/testing';
import { AnalyticsService } from '../../../analytics/src/services/analytics.service';
import { ActivityService } from '../src/services/activity.service';
import { ActivityModule } from '../src/app.module';
import { AnalyticsModule } from '../../../analytics/src/app.module';

describe('Activity Analytics Integration', () => {
  let activityService: ActivityService;
  let analyticsService: AnalyticsService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ActivityModule, AnalyticsModule],
    }).compile();

    activityService = module.get<ActivityService>(ActivityService);
    analyticsService = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should sync activity data with analytics', async () => {
    const testActivity = await activityService.create({
      userId: 'user1',
      type: 'running',
      duration: 30,
    });
    
    const analytics = await analyticsService.getUserAnalytics('user1');
    expect(analytics.totalActivities).toBe(1);
    expect(analytics.totalDuration).toBe(30);
  });
});
