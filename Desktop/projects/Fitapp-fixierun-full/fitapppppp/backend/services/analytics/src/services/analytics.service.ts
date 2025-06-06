import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { UserAnalytics } from '../entities/user-analytics.entity';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(UserAnalytics)
    private analyticsRepository: Repository<UserAnalytics>,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  /**
   * Mettre à jour les statistiques quotidiennes d'un utilisateur
   * @param userId ID de l'utilisateur
   * @param date Date de l'analyse (optionnel, par défaut aujourd'hui)
   */
  async updateDailyStats(userId: string, date?: Date): Promise<UserAnalytics> {
    try {
      // Utiliser la date fournie ou la date actuelle
      const targetDate = date || new Date();
      
      // Format de la date YYYY-MM-DD
      const formattedDate = targetDate.toISOString().split('T')[0];
      
      // Rechercher une entrée existante ou en créer une nouvelle
      let analytics = await this.analyticsRepository.findOne({
        where: { 
          userId,
          date: new Date(formattedDate),
        },
      });

      if (!analytics) {
        analytics = this.analyticsRepository.create({
          userId,
          date: new Date(formattedDate),
        });
      }

      // Récupérer les activités de l'utilisateur pour la journée
      const activities = await this.fetchUserActivities(userId, formattedDate, formattedDate);
      
      if (activities && activities.length > 0) {
        // Calculer les statistiques
        let totalDistance = 0;
        let totalDuration = 0;
        let maxSpeed = 0;
        let tokensEarned = 0;
        const activityTypeCount = {};
        
        activities.forEach(activity => {
          // Additionner les totaux
          totalDistance += Number(activity.distance);
          totalDuration += activity.duration;
          tokensEarned += activity.tokensEarned;
          
          // Déterminer la vitesse maximale
          if (Number(activity.maxSpeed) > maxSpeed) {
            maxSpeed = Number(activity.maxSpeed);
          }
          
          // Compter par type d'activité
          const type = activity.type;
          if (!activityTypeCount[type]) {
            activityTypeCount[type] = 0;
          }
          activityTypeCount[type]++;
        });

        // Mettre à jour l'objet analytics
        analytics.totalDistance = totalDistance;
        analytics.totalDuration = totalDuration;
        analytics.activityCount = activities.length;
        analytics.maxSpeed = maxSpeed;
        analytics.tokensEarned = tokensEarned;
        analytics.activityTypeBreakdown = activityTypeCount;
        
        // Calculer la vitesse moyenne
        if (totalDuration > 0) {
          analytics.averageSpeed = Number((totalDistance / (totalDuration / 3600)).toFixed(2));
        }
        
        // Estimer les calories brûlées (simplification)
        // Formule simplifiée: calories = poids(kg) * distance(km) * 1.036
        const userWeight = 70; // Poids par défaut si non disponible
        analytics.caloriesBurned = Math.round(userWeight * totalDistance * 1.036);
        
        // Récupérer les défis complétés
        const completedChallenges = await this.fetchCompletedChallenges(userId, formattedDate);
        analytics.challengesCompleted = completedChallenges?.length || 0;
        
        // Métriques de performance supplémentaires
        analytics.performanceMetrics = {
          pacePerKm: totalDistance > 0 ? Math.round(totalDuration / totalDistance / 60) : 0, // min/km
          averageSessionTime: activities.length > 0 ? Math.round(totalDuration / activities.length) : 0, // sec
          improvementFromLastWeek: await this.calculateImprovement(userId, new Date(formattedDate)),
        };
      }
      
      // Sauvegarder les analyses
      const savedAnalytics = await this.analyticsRepository.save(analytics);
      this.logger.log(`Statistiques mises à jour pour l'utilisateur ${userId} à la date ${formattedDate}`);
      
      return savedAnalytics;
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour des statistiques quotidiennes: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtenir les statistiques d'un utilisateur pour une période donnée
   * @param userId ID de l'utilisateur
   * @param startDate Date de début
   * @param endDate Date de fin
   */
  async getUserStatsForPeriod(userId: string, startDate: Date, endDate: Date): Promise<any> {
    try {
      const analytics = await this.analyticsRepository.find({
        where: {
          userId,
          date: Between(startDate, endDate),
        },
        order: {
          date: 'ASC',
        },
      });
      
      if (analytics.length === 0) {
        // Si aucune donnée n'existe, essayer de générer des statistiques à la volée
        const activities = await this.fetchUserActivities(
          userId, 
          startDate.toISOString().split('T')[0], 
          endDate.toISOString().split('T')[0]
        );
        
        if (activities.length === 0) {
          return {
            userId,
            period: {
              start: startDate,
              end: endDate,
            },
            totalDistance: 0,
            totalDuration: 0,
            activityCount: 0,
            tokensEarned: 0,
            dailyBreakdown: [],
          };
        }
        
        // Générer des statistiques à partir des activités
        const stats = this.generateStatsFromActivities(activities);
        return {
          userId,
          period: {
            start: startDate,
            end: endDate,
          },
          ...stats,
          dailyBreakdown: [],
        };
      }
      
      // Agréger les données
      let totalDistance = 0;
      let totalDuration = 0;
      let activityCount = 0;
      let tokensEarned = 0;
      let caloriesBurned = 0;
      
      analytics.forEach(day => {
        totalDistance += Number(day.totalDistance);
        totalDuration += day.totalDuration;
        activityCount += day.activityCount;
        tokensEarned += Number(day.tokensEarned);
        caloriesBurned += day.caloriesBurned;
      });
      
      // Calculer la vitesse moyenne sur la période
      const averageSpeed = totalDuration > 0 
        ? Number((totalDistance / (totalDuration / 3600)).toFixed(2)) 
        : 0;
      
      return {
        userId,
        period: {
          start: startDate,
          end: endDate,
        },
        totalDistance,
        totalDuration,
        averageSpeed,
        activityCount,
        tokensEarned,
        caloriesBurned,
        dailyBreakdown: analytics,
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des statistiques pour la période: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Générer des tendances d'activité pour un utilisateur
   * @param userId ID de l'utilisateur
   * @param months Nombre de mois à analyser (défaut: 3)
   */
  async generateActivityTrends(userId: string, months: number = 3): Promise<any> {
    try {
      // Calculer la date de début (il y a X mois)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
      
      // Format des dates YYYY-MM-DD
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      // Récupérer toutes les analyses pour cette période
      const analytics = await this.analyticsRepository.find({
        where: {
          userId,
          date: Between(startDate, endDate),
        },
        order: {
          date: 'ASC',
        },
      });
      
      // Regrouper par semaine
      const weeklyData = {};
      const monthlyData = {};
      
      analytics.forEach(day => {
        // Obtenir le numéro de semaine
        const date = new Date(day.date);
        const weekNumber = this.getWeekNumber(date);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        // Initialiser les objets si nécessaire
        if (!weeklyData[weekNumber]) {
          weeklyData[weekNumber] = {
            distance: 0,
            duration: 0,
            activities: 0,
            tokens: 0,
          };
        }
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            distance: 0,
            duration: 0,
            activities: 0,
            tokens: 0,
            daysActive: 0,
          };
        }
        
        // Ajouter les données à la semaine correspondante
        weeklyData[weekNumber].distance += Number(day.totalDistance);
        weeklyData[weekNumber].duration += day.totalDuration;
        weeklyData[weekNumber].activities += day.activityCount;
        weeklyData[weekNumber].tokens += Number(day.tokensEarned);
        
        // Ajouter les données au mois correspondant
        monthlyData[monthKey].distance += Number(day.totalDistance);
        monthlyData[monthKey].duration += day.totalDuration;
        monthlyData[monthKey].activities += day.activityCount;
        monthlyData[monthKey].tokens += Number(day.tokensEarned);
        // Compter comme jour actif s'il y a eu au moins une activité
        if (day.activityCount > 0) {
          monthlyData[monthKey].daysActive++;
        }
      });
      
      // Calculer les tendances
      const weeklyTrend = this.calculateTrend(Object.values(weeklyData).map(w => w.distance));
      const monthlyTrend = this.calculateTrend(Object.values(monthlyData).map(m => m.distance));
      
      // Trouver les meilleurs jours
      const bestDayByDistance = analytics.reduce((best, current) => {
        return Number(current.totalDistance) > Number(best?.totalDistance || 0) ? current : best;
      }, null);
      
      return {
        userId,
        period: {
          start: formattedStartDate,
          end: formattedEndDate,
        },
        trends: {
          weekly: {
            data: weeklyData,
            trend: weeklyTrend,
          },
          monthly: {
            data: monthlyData,
            trend: monthlyTrend,
          },
        },
        bestPerformances: {
          bestDayByDistance: bestDayByDistance ? {
            date: bestDayByDistance.date,
            distance: bestDayByDistance.totalDistance,
          } : null,
        },
        consistency: {
          activeDays: analytics.filter(a => a.activityCount > 0).length,
          totalDays: this.getDaysBetweenDates(startDate, endDate),
          consistencyRate: this.calculateConsistencyRate(analytics, startDate, endDate),
        },
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la génération des tendances: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Récupérer les activités d'un utilisateur depuis le service d'activités
   * @param userId ID de l'utilisateur
   * @param startDate Date de début (format YYYY-MM-DD)
   * @param endDate Date de fin (format YYYY-MM-DD)
   */
  private async fetchUserActivities(userId: string, startDate: string, endDate: string): Promise<any[]> {
    try {
      const activityServiceUrl = this.configService.get<string>('ACTIVITY_SERVICE_URL');
      if (!activityServiceUrl) {
        throw new Error('URL du service d\'activités non configurée');
      }
      
      const response = await lastValueFrom(
        this.httpService.get(
          `${activityServiceUrl}/api/v1/activities/user/${userId}`,
          {
            params: {
              start: startDate,
              end: endDate,
            },
          }
        )
      );
      
      return response.data || [];
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des activités: ${error.message}`);
      return [];
    }
  }

  /**
   * Récupérer les défis complétés d'un utilisateur
   */
  private async fetchCompletedChallenges(userId: string, date: string): Promise<any[]> {
    try {
      const challengeServiceUrl = this.configService.get<string>('CHALLENGE_SERVICE_URL');
      if (!challengeServiceUrl) {
        this.logger.warn('URL du service de défis non configurée');
        return [];
      }
      
      const response = await lastValueFrom(
        this.httpService.get(
          `${challengeServiceUrl}/api/v1/challenges/completed/${userId}`,
          {
            params: {
              date,
            },
          }
        )
      );
      
      return response.data || [];
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des défis: ${error.message}`);
      return [];
    }
  }

  /**
   * Calculer l'amélioration par rapport à la semaine précédente
   */
  private async calculateImprovement(userId: string, currentDate: Date): Promise<number> {
    try {
      // Date de la semaine précédente
      const previousWeekDate = new Date(currentDate);
      previousWeekDate.setDate(previousWeekDate.getDate() - 7);
      
      // Format des dates YYYY-MM-DD
      const previousFormattedDate = previousWeekDate.toISOString().split('T')[0];
      
      // Chercher les statistiques de la semaine précédente
      const previousStats = await this.analyticsRepository.findOne({
        where: {
          userId,
          date: previousWeekDate,
        },
      });
      
      if (!previousStats || previousStats.totalDistance === 0) {
        return 0;
      }
      
      // Calculer le pourcentage d'amélioration
      const currentDistance = Number(await this.analyticsRepository.findOne({
        where: {
          userId,
          date: currentDate,
        },
      })?.totalDistance || 0);
      
      if (currentDistance <= 0) {
        return 0;
      }
      
      const improvement = ((currentDistance - Number(previousStats.totalDistance)) / Number(previousStats.totalDistance)) * 100;
      return Number(improvement.toFixed(1));
    } catch (error) {
      this.logger.error(`Erreur lors du calcul de l'amélioration: ${error.message}`);
      return 0;
    }
  }

  /**
   * Générer des statistiques à partir d'activités
   */
  private generateStatsFromActivities(activities: any[]): any {
    let totalDistance = 0;
    let totalDuration = 0;
    let tokensEarned = 0;
    
    activities.forEach(activity => {
      totalDistance += Number(activity.distance);
      totalDuration += activity.duration;
      tokensEarned += activity.tokensEarned || 0;
    });
    
    const averageSpeed = totalDuration > 0 
      ? Number((totalDistance / (totalDuration / 3600)).toFixed(2)) 
      : 0;
    
    return {
      totalDistance,
      totalDuration,
      averageSpeed,
      activityCount: activities.length,
      tokensEarned,
    };
  }

  /**
   * Obtenir le numéro de semaine d'une date
   */
  private getWeekNumber(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
  }

  /**
   * Calculer la tendance à partir d'une série de valeurs
   */
  private calculateTrend(values: number[]): string {
    if (values.length < 2) {
      return 'stable';
    }
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const changePct = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    
    if (changePct >= 10) {
      return 'increasing';
    } else if (changePct <= -10) {
      return 'decreasing';
    } else {
      return 'stable';
    }
  }

  /**
   * Calculer le nombre de jours entre deux dates
   */
  private getDaysBetweenDates(startDate: Date, endDate: Date): number {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculer le taux de cohérence (jours actifs / total des jours)
   */
  private calculateConsistencyRate(analytics: UserAnalytics[], startDate: Date, endDate: Date): number {
    const activeDays = analytics.filter(a => a.activityCount > 0).length;
    const totalDays = this.getDaysBetweenDates(startDate, endDate);
    
    return Number(((activeDays / totalDays) * 100).toFixed(1));
  }
}