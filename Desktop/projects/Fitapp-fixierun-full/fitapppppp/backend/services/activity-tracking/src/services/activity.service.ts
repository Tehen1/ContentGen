import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { Activity, ActivityType } from '../entities/activity.entity';
import { CreateActivityDto } from '../dto/create-activity.dto';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
  ) {}

  /**
   * Créer une nouvelle activité
   */
  async create(createActivityDto: CreateActivityDto): Promise<Activity> {
    try {
      // Calculer la vitesse moyenne si non fournie
      if (!createActivityDto.averageSpeed && createActivityDto.distance && createActivityDto.duration) {
        createActivityDto.averageSpeed = this.calculateAverageSpeed(
          createActivityDto.distance,
          createActivityDto.duration,
        );
      }

      // Vérifier la cohérence des dates
      const startDate = new Date(createActivityDto.startedAt);
      const endDate = new Date(createActivityDto.finishedAt);
      
      if (startDate >= endDate) {
        throw new BadRequestException('La date de fin doit être postérieure à la date de début');
      }

      // Calculer les tokens gagnés
      createActivityDto.tokensEarned = this.calculateTokenRewards({
        ...createActivityDto,
        type: createActivityDto.type,
      } as Activity);

      // Créer une nouvelle entité Activity
      const newActivity = this.activityRepository.create({
        ...createActivityDto,
        startedAt: startDate,
        finishedAt: endDate,
      });

      // Sauvegarder dans la base de données
      const savedActivity = await this.activityRepository.save(newActivity);
      this.logger.log(`Nouvelle activité créée avec l'ID: ${savedActivity.id}`);
      
      return savedActivity;
    } catch (error) {
      this.logger.error(`Erreur lors de la création de l'activité: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Trouver toutes les activités d'un utilisateur
   */
  async findAll(userId: string, dateFrom?: Date, dateTo?: Date): Promise<Activity[]> {
    try {
      const where: FindOptionsWhere<Activity> = { userId };

      // Ajouter le filtre de dates si spécifié
      if (dateFrom && dateTo) {
        where.startedAt = Between(dateFrom, dateTo);
      }

      const activities = await this.activityRepository.find({
        where,
        order: { createdAt: 'DESC' },
      });

      return activities;
    } catch (error) {
      this.logger.error(`Erreur lors de la recherche des activités: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Trouver une activité par son ID
   */
  async findOne(id: string): Promise<Activity> {
    try {
      const activity = await this.activityRepository.findOne({
        where: { id },
      });
      
      if (!activity) {
        throw new NotFoundException(`Activité avec l'ID ${id} non trouvée`);
      }
      
      return activity;
    } catch (error) {
      this.logger.error(`Erreur lors de la recherche de l'activité: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Mettre à jour une activité
   */
  async update(id: string, updateData: Partial<Activity>): Promise<Activity> {
    try {
      const activity = await this.findOne(id);
      
      // Vérifier la cohérence des dates si elles sont mises à jour
      if (updateData.startedAt && updateData.finishedAt) {
        const startDate = new Date(updateData.startedAt);
        const endDate = new Date(updateData.finishedAt);
        
        if (startDate >= endDate) {
          throw new BadRequestException('La date de fin doit être postérieure à la date de début');
        }
      } else if (updateData.startedAt && !updateData.finishedAt) {
        const startDate = new Date(updateData.startedAt);
        const endDate = new Date(activity.finishedAt);
        
        if (startDate >= endDate) {
          throw new BadRequestException('La date de fin doit être postérieure à la date de début');
        }
      } else if (!updateData.startedAt && updateData.finishedAt) {
        const startDate = new Date(activity.startedAt);
        const endDate = new Date(updateData.finishedAt);
        
        if (startDate >= endDate) {
          throw new BadRequestException('La date de fin doit être postérieure à la date de début');
        }
      }
      
      // Update activity with new data
      Object.assign(activity, updateData);
      
      // If activity is being marked as completed, recalculate token rewards
      if (updateData.isCompleted === true) {
        activity.tokensEarned = this.calculateTokenRewards(activity);
      }
      
      const updatedActivity = await this.activityRepository.save(activity);
      this.logger.log(`Activité avec l'ID ${id} mise à jour`);
      
      return updatedActivity;
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour de l'activité: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Supprimer une activité
   */
  async remove(id: string, userId?: string): Promise<void> {
    try {
      const where: FindOptionsWhere<Activity> = { id };
      
      // Si userId est fourni, vérifier que l'activité appartient à l'utilisateur
      if (userId) {
        where.userId = userId;
      }
      
      const activity = await this.activityRepository.findOne({ where });
      
      if (!activity) {
        throw new NotFoundException(
          userId 
            ? `Activité avec l'ID ${id} non trouvée ou n'appartient pas à l'utilisateur ${userId}`
            : `Activité avec l'ID ${id} non trouvée`
        );
      }
      
      await this.activityRepository.remove(activity);
      this.logger.log(`Activité avec l'ID ${id} supprimée`);
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression de l'activité: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Récupérer les activités par type
   */
  async getActivitiesByType(userId: string, type: ActivityType): Promise<Activity[]> {
    try {
      return this.activityRepository.find({
        where: { userId, type },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des activités par type: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Récupérer les activités par plage de dates
   */
  async getActivitiesByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Activity[]> {
    try {
      return this.activityRepository.find({
        where: {
          userId,
          startedAt: Between(startDate, endDate),
        },
        order: { startedAt: 'ASC' },
      });
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des activités par plage de dates: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtenir les statistiques des activités d'un utilisateur
   */
  async getUserStats(userId: string): Promise<any> {
    try {
      // Récupérer toutes les activités de l'utilisateur
      const activities = await this.activityRepository.find({ where: { userId } });

      // Aucune activité trouvée
      if (activities.length === 0) {
        return {
          totalActivities: 0,
          totalDistance: 0,
          totalDuration: 0,
          totalTokensEarned: 0,
          averageSpeed: 0,
          activitiesByType: {},
        };
      }

      // Calculer les statistiques
      let totalDistance = 0;
      let totalDuration = 0;
      let totalTokensEarned = 0;
      let maxSpeed = 0;
      const activitiesByType = {};

      activities.forEach(activity => {
        totalDistance += Number(activity.distance);
        totalDuration += activity.duration;
        totalTokensEarned += activity.tokensEarned;
        
        if (activity.maxSpeed > maxSpeed) {
          maxSpeed = Number(activity.maxSpeed);
        }

        // Compter par type d'activité
        if (!activitiesByType[activity.type]) {
          activitiesByType[activity.type] = 0;
        }
        activitiesByType[activity.type]++;
      });

      // Calculer la vitesse moyenne globale
      const averageSpeed = totalDuration > 0 
        ? (totalDistance / (totalDuration / 3600)).toFixed(2) 
        : 0;

      return {
        totalActivities: activities.length,
        totalDistance: totalDistance.toFixed(2),
        totalDuration,
        totalTokensEarned,
        averageSpeed,
        maxSpeed,
        activitiesByType,
      };
    } catch (error) {
      this.logger.error(`Erreur lors du calcul des statistiques: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Calculer la vitesse moyenne en km/h
   */
  private calculateAverageSpeed(distance: number, durationInSeconds: number): number {
    // km / (seconds / 3600) = km/h
    return Number((distance / (durationInSeconds / 3600)).toFixed(2));
  }

  /**
   * Calculer les tokens gagnés basés sur les métriques de l'activité
   */
  private calculateTokenRewards(activity: Activity): number {
    let tokens = 0;
    
    // Base calculation: 1 token per km
    const distanceInKm = activity.distance / 1000;
    tokens += distanceInKm;
    
    // Bonus for longer activities
    if (activity.duration > 1800) { // More than 30 minutes
      tokens *= 1.2;
    }
    
    // Different multipliers based on activity type
    switch (activity.type) {
      case ActivityType.RUNNING:
        tokens *= 1.5;
        break;
      case ActivityType.CYCLING:
        tokens *= 1.2;
        break;
      case ActivityType.WALKING:
        tokens *= 1.0;
        break;
    }
    
    // Apply daily/user limits here if needed
    
    // Round to 2 decimal places
    return parseFloat(tokens.toFixed(2));
  }
}
