import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, In, FindOptionsWhere } from 'typeorm';
import { Challenge } from '../entities/challenge.entity';
import { UserChallenge, UserChallengeStatus } from '../entities/user-challenge.entity';
import { CreateChallengeDto } from '../dto/create-challenge.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ChallengesService {
  private readonly logger = new Logger(ChallengesService.name);

  constructor(
    @InjectRepository(Challenge)
    private challengeRepository: Repository<Challenge>,
    @InjectRepository(UserChallenge)
    private userChallengeRepository: Repository<UserChallenge>,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  /**
   * Créer un nouveau défi
   */
  async create(createChallengeDto: CreateChallengeDto): Promise<Challenge> {
    try {
      // Vérifier que la date de fin est postérieure à la date de début
      if (createChallengeDto.endDate <= createChallengeDto.startDate) {
        throw new BadRequestException('La date de fin doit être postérieure à la date de début');
      }

      // Créer le défi
      const challenge = this.challengeRepository.create({
        ...createChallengeDto,
        objectives: createChallengeDto.objectives,
        reward: createChallengeDto.reward,
        invitedUsers: createChallengeDto.invitedUsers || [],
        metadata: createChallengeDto.metadata || {},
      });

      // Sauvegarder dans la base de données
      const savedChallenge = await this.challengeRepository.save(challenge);
      this.logger.log(`Nouveau défi créé avec l'ID: ${savedChallenge.id}`);

      // Si le défi est global ou a des utilisateurs invités, créer les entrées UserChallenge
      if (savedChallenge.isGlobal) {
        // Pour un défi global, nous créerons les entrées UserChallenge lorsque les utilisateurs se connectent
        // ou via un processus batch
      } else if (savedChallenge.invitedUsers && savedChallenge.invitedUsers.length > 0) {
        // Créer des entrées pour chaque utilisateur invité
        const userChallenges = savedChallenge.invitedUsers.map(userId => ({
          userId,
          challengeId: savedChallenge.id,
          status: UserChallengeStatus.PENDING,
          progress: {},
          completionPercentage: 0,
        }));

        await this.userChallengeRepository.save(userChallenges);
        this.logger.log(`Entrées UserChallenge créées pour ${userChallenges.length} utilisateurs invités`);
      }

      return savedChallenge;
    } catch (error) {
      this.logger.error(`Erreur lors de la création du défi: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Trouver tous les défis actifs
   */
  async findAllActive(includeExpired: boolean = false): Promise<Challenge[]> {
    try {
      const now = new Date();
      const where: FindOptionsWhere<Challenge> = {
        isActive: true,
      };

      if (!includeExpired) {
        where.endDate = MoreThanOrEqual(now);
      }

      const challenges = await this.challengeRepository.find({
        where,
        order: {
          startDate: 'ASC',
        },
      });

      return challenges;
    } catch (error) {
      this.logger.error(`Erreur lors de la recherche des défis actifs: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Trouver tous les défis pour un utilisateur
   */
  async findAllForUser(userId: string, status?: UserChallengeStatus): Promise<any[]> {
    try {
      // Construire la clause where
      const whereClause: any = { userId };
      if (status) {
        whereClause.status = status;
      }

      // Récupérer les défis de l'utilisateur avec leurs détails
      const userChallenges = await this.userChallengeRepository.find({
        where: whereClause,
        relations: ['challenge'],
        order: {
          createdAt: 'DESC',
        },
      });

      // Récupérer les défis globaux actuels auxquels l'utilisateur n'est pas encore inscrit
      const now = new Date();
      const globalChallenges = await this.challengeRepository.find({
        where: {
          isGlobal: true,
          isActive: true,
          endDate: MoreThanOrEqual(now),
        },
      });

      // Filtrer les défis globaux que l'utilisateur n'a pas encore
      const userChallengeIds = userChallenges.map(uc => uc.challengeId);
      const newGlobalChallenges = globalChallenges.filter(
        gc => !userChallengeIds.includes(gc.id)
      );

      // Créer automatiquement des entrées UserChallenge pour les nouveaux défis globaux
      if (newGlobalChallenges.length > 0) {
        const newUserChallenges = newGlobalChallenges.map(challenge => ({
          userId,
          challengeId: challenge.id,
          status: UserChallengeStatus.PENDING,
          progress: {},
          completionPercentage: 0,
        }));

        await this.userChallengeRepository.save(newUserChallenges);
        this.logger.log(`Inscrit l'utilisateur ${userId} à ${newGlobalChallenges.length} nouveaux défis globaux`);

        // Récupérer les défis mis à jour
        return this.findAllForUser(userId, status);
      }

      // Formater les résultats
      return userChallenges.map(uc => ({
        id: uc.id,
        challengeId: uc.challengeId,
        status: uc.status,
        progress: uc.progress,
        completionPercentage: uc.completionPercentage,
        completedAt: uc.completedAt,
        claimedAt: uc.claimedAt,
        challenge: uc.challenge,
      }));
    } catch (error) {
      this.logger.error(`Erreur lors de la recherche des défis pour l'utilisateur ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Trouver un défi par ID
   */
  async findOne(id: string): Promise<Challenge> {
    try {
      const challenge = await this.challengeRepository.findOne({ where: { id } });

      if (!challenge) {
        throw new NotFoundException(`Défi avec l'ID ${id} non trouvé`);
      }

      return challenge;
    } catch (error) {
      this.logger.error(`Erreur lors de la recherche du défi: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtenir le statut d'un défi pour un utilisateur
   */
  async getUserChallengeStatus(challengeId: string, userId: string): Promise<UserChallenge> {
    try {
      const userChallenge = await this.userChallengeRepository.findOne({
        where: { challengeId, userId },
        relations: ['challenge'],
      });

      if (!userChallenge) {
        throw new NotFoundException(`Participation au défi non trouvée pour l'utilisateur ${userId} et le défi ${challengeId}`);
      }

      return userChallenge;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération du statut du défi: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Joindre un utilisateur à un défi
   */
  async joinChallenge(challengeId: string, userId: string): Promise<UserChallenge> {
    try {
      // Vérifier si le défi existe
      const challenge = await this.findOne(challengeId);

      // Vérifier si l'utilisateur est déjà inscrit
      const existingUserChallenge = await this.userChallengeRepository.findOne({
        where: { challengeId, userId },
      });

      if (existingUserChallenge) {
        return existingUserChallenge;
      }

      // Vérifier si l'utilisateur est autorisé à rejoindre ce défi
      if (!challenge.isGlobal && !challenge.invitedUsers?.includes(userId)) {
        throw new BadRequestException('L\'utilisateur n\'est pas autorisé à rejoindre ce défi');
      }

      // Créer une nouvelle inscription
      const userChallenge = this.userChallengeRepository.create({
        userId,
        challengeId,
        status: UserChallengeStatus.PENDING,
        progress: {},
        completionPercentage: 0,
      });

      // Sauvegarder dans la base de données
      const savedUserChallenge = await this.userChallengeRepository.save(userChallenge);
      this.logger.log(`Utilisateur ${userId} inscrit au défi ${challengeId}`);

      return savedUserChallenge;
    } catch (error) {
      this.logger.error(`Erreur lors de l'inscription au défi: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Mettre à jour la progression d'un utilisateur dans un défi
   */
  async updateUserProgress(challengeId: string, userId: string, progress: any): Promise<UserChallenge> {
    try {
      // Récupérer le défi et la participation de l'utilisateur
      const challenge = await this.findOne(challengeId);
      let userChallenge = await this.getUserChallengeStatus(challengeId, userId);

      // Vérifier si le défi est encore actif
      const now = new Date();
      if (now > challenge.endDate && userChallenge.status !== UserChallengeStatus.COMPLETED) {
        userChallenge.status = UserChallengeStatus.FAILED;
        return this.userChallengeRepository.save(userChallenge);
      }

      // Si le défi est déjà complété ou réclamé, ne pas mettre à jour
      if (userChallenge.status === UserChallengeStatus.COMPLETED || 
          userChallenge.status === UserChallengeStatus.CLAIMED) {
        return userChallenge;
      }

      // Mettre à jour la progression
      userChallenge.progress = progress;

      // Calculer le pourcentage de complétion
      userChallenge.completionPercentage = this.calculateCompletionPercentage(challenge, progress);

      // Mettre à jour le statut
      if (userChallenge.completionPercentage >= 100) {
        userChallenge.status = UserChallengeStatus.COMPLETED;
        userChallenge.completedAt = new Date();
      } else if (userChallenge.status === UserChallengeStatus.PENDING) {
        userChallenge.status = UserChallengeStatus.IN_PROGRESS;
      }

      // Sauvegarder les modifications
      const updatedUserChallenge = await this.userChallengeRepository.save(userChallenge);
      this.logger.log(`Progression mise à jour pour l'utilisateur ${userId} au défi ${challengeId}: ${userChallenge.completionPercentage}%`);

      // Si le défi est complété, déclencher l'attribution de récompense
      if (updatedUserChallenge.status === UserChallengeStatus.COMPLETED) {
        this.triggerReward(updatedUserChallenge, challenge).catch(error => {
          this.logger.error(`Erreur lors de l'attribution de la récompense: ${error.message}`);
        });
      }

      return updatedUserChallenge;
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour de la progression: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Réclamer la récompense d'un défi complété
   */
  async claimReward(userChallengeId: string, userId: string): Promise<UserChallenge> {
    try {
      // Récupérer la participation au défi
      const userChallenge = await this.userChallengeRepository.findOne({
        where: { id: userChallengeId, userId },
        relations: ['challenge'],
      });

      if (!userChallenge) {
        throw new NotFoundException(`Participation au défi non trouvée avec l'ID ${userChallengeId}`);
      }

      // Vérifier si le défi est complété mais pas encore réclamé
      if (userChallenge.status !== UserChallengeStatus.COMPLETED) {
        throw new BadRequestException(`Le défi doit être complété pour réclamer la récompense`);
      }

      // Attribuer la récompense
      const challenge = userChallenge.challenge;
      const reward = challenge.reward as any;
      
      try {
        // Appeler le service de récompenses
        const rewardServiceUrl = this.configService.get<string>('REWARD_SERVICE_URL');
        if (!rewardServiceUrl) {
          throw new Error('URL du service de récompenses non configurée');
        }

        // Créer la récompense
        const response = await lastValueFrom(
          this.httpService.post(`${rewardServiceUrl}/api/v1/rewards`, {
            userId: userId,
            amount: reward.tokens,
            type: 'challenge_completion',
            sourceId: challenge.id,
            sourceType: 'challenge',
            description: `Récompense pour avoir complété le défi: ${challenge.title}`,
            metadata: {
              challengeTitle: challenge.title,
              challengeType: challenge.type,
              difficulty: challenge.difficulty,
              completedAt: userChallenge.completedAt,
            },
          })
        );

        // Mettre à jour l'état de la réclamation
        userChallenge.status = UserChallengeStatus.CLAIMED;
        userChallenge.claimedAt = new Date();
        userChallenge.rewardTransactionHash = response.data.transactionHash;

        // Si la récompense inclut un NFT, l'attribuer
        if (reward.nftId) {
          // Appeler le service NFT
          // Cette partie dépend de l'implémentation du service NFT
        }

        // Sauvegarder les modifications
        const claimedUserChallenge = await this.userChallengeRepository.save(userChallenge);
        this.logger.log(`Récompense réclamée pour l'utilisateur ${userId} au défi ${challenge.id}`);

        return claimedUserChallenge;
      } catch (error) {
        this.logger.error(`Erreur lors de l'attribution de la récompense: ${error.message}`);
        throw new BadRequestException(`Erreur lors de l'attribution de la récompense: ${error.message}`);
      }
    } catch (error) {
      this.logger.error(`Erreur lors de la réclamation de la récompense: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Calculer le pourcentage de complétion d'un défi
   */
  private calculateCompletionPercentage(challenge: Challenge, progress: any): number {
    try {
      const objectives = challenge.objectives as any[];
      if (!objectives || objectives.length === 0) {
        return 0;
      }

      // Calculer le pourcentage pour chaque objectif
      const objectivePercentages = objectives.map(objective => {
        const type = objective.type;
        const target = objective.target;
        const current = progress[type] || 0;

        // Calculer le pourcentage (pas plus de 100%)
        return Math.min(100, (current / target) * 100);
      });

      // Faire la moyenne des pourcentages
      const averagePercentage = objectivePercentages.reduce((sum, percentage) => sum + percentage, 0) / 
                                objectivePercentages.length;

      return Math.round(averagePercentage);
    } catch (error) {
      this.logger.error(`Erreur lors du calcul du pourcentage de complétion: ${error.message}`);
      return 0;
    }
  }

  /**
   * Déclencher l'attribution de récompense pour un défi complété
   */
  private async triggerReward(userChallenge: UserChallenge, challenge: Challenge): Promise<void> {
    try {
      // Cette méthode est appelée automatiquement lorsqu'un défi est complété
      // Elle peut envoyer une notification ou préparer la récompense
      this.logger.log(`Défi complété par l'utilisateur ${userChallenge.userId}: ${challenge.title}`);

      // Mettre à jour les statistiques ou autres données si nécessaire
    } catch (error) {
      this.logger.error(`Erreur lors du déclenchement de la récompense: ${error.message}`);
    }
  }

  /**
   * Trouver les défis complétés à une date donnée
   */
  async findCompletedByDate(userId: string, date: string): Promise<any[]> {
    try {
      // Convertir en objet Date
      const targetDate = new Date(date);
      
      // Régler les limites de date (début et fin de la journée)
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Rechercher les défis complétés dans cet intervalle
      const completedChallenges = await this.userChallengeRepository.find({
        where: {
          userId,
          status: In([UserChallengeStatus.COMPLETED, UserChallengeStatus.CLAIMED]),
          completedAt: Between(startOfDay, endOfDay),
        },
        relations: ['challenge'],
      });

      return completedChallenges.map(uc => ({
        id: uc.id,
        challengeId: uc.challengeId,
        title: uc.challenge.title,
        type: uc.challenge.type,
        reward: uc.challenge.reward,
        completedAt: uc.completedAt,
        claimed: uc.status === UserChallengeStatus.CLAIMED,
      }));
    } catch (error) {
      this.logger.error(`Erreur lors de la recherche des défis complétés: ${error.message}`, error.stack);
      throw error;
    }
  }
}