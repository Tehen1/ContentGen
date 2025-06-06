import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { Reward, RewardType, RewardStatus } from '../entities/reward.entity';
import { CreateRewardDto } from '../dto/create-reward.dto';
import { BlockchainService } from './blockchain.service';
import { NFTService } from './nft.service';
import { UserBalanceDto } from '../dto/user-balance.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RewardService {
  private readonly logger = new Logger(RewardService.name);

  constructor(
    @InjectRepository(Reward)
    private rewardRepository: Repository<Reward>,
    private blockchainService: BlockchainService,
    private nftService: NFTService,
    private configService: ConfigService,
  ) {}

  /**
   * Créer une nouvelle récompense
   */
  async create(createRewardDto: CreateRewardDto): Promise<Reward> {
    try {
      // Vérifier que le montant est positif
      if (createRewardDto.amount <= 0) {
        throw new BadRequestException('Le montant de la récompense doit être positif');
      }

      // Récupérer le multiplicateur de récompense basé sur les NFTs de l'utilisateur
      const multiplier = await this.getNFTMultiplier(createRewardDto.userId);

      // Appliquer le multiplicateur au montant
      const adjustedAmount = createRewardDto.amount * multiplier;

      // Créer l'enregistrement de récompense
      const reward = this.rewardRepository.create({
        ...createRewardDto,
        amount: adjustedAmount,
        multiplier,
        status: RewardStatus.PENDING,
      });

      // Sauvegarder dans la base de données
      const savedReward = await this.rewardRepository.save(reward);
      this.logger.log(`Nouvelle récompense créée avec l'ID: ${savedReward.id}`);

      // Traiter la récompense immédiatement si configuré
      if (this.configService.get('PROCESS_REWARDS_IMMEDIATELY', 'true') === 'true') {
        this.processReward(savedReward.id).catch(error => {
          this.logger.error(`Erreur lors du traitement automatique de la récompense: ${error.message}`);
        });
      }

      return savedReward;
    } catch (error) {
      this.logger.error(`Erreur lors de la création de la récompense: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Récupérer toutes les récompenses d'un utilisateur
   */
  async findAllByUser(userId: string, dateFrom?: Date, dateTo?: Date, status?: RewardStatus): Promise<Reward[]> {
    try {
      const where: FindOptionsWhere<Reward> = { userId };

      // Ajouter le filtre de dates si spécifié
      if (dateFrom && dateTo) {
        where.createdAt = Between(dateFrom, dateTo);
      }

      // Ajouter le filtre de statut si spécifié
      if (status) {
        where.status = status;
      }

      const rewards = await this.rewardRepository.find({
        where,
        order: { createdAt: 'DESC' },
      });

      return rewards;
    } catch (error) {
      this.logger.error(`Erreur lors de la recherche des récompenses: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Récupérer une récompense par son ID
   */
  async findOne(id: string): Promise<Reward> {
    try {
      const reward = await this.rewardRepository.findOne({ where: { id } });

      if (!reward) {
        throw new NotFoundException(`Récompense avec l'ID ${id} non trouvée`);
      }

      return reward;
    } catch (error) {
      this.logger.error(`Erreur lors de la recherche de la récompense: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Traiter une récompense en attente (envoi de tokens)
   */
  async processReward(id: string): Promise<Reward> {
    try {
      const reward = await this.findOne(id);

      // Vérifier si la récompense est dans un état qui peut être traité
      if (reward.status !== RewardStatus.PENDING && reward.status !== RewardStatus.FAILED) {
        throw new BadRequestException(`La récompense avec l'ID ${id} ne peut pas être traitée car son statut est ${reward.status}`);
      }

      // Appeler le service blockchain pour transférer les tokens
      try {
        const txHash = await this.blockchainService.transferTokens(
          reward.userId,
          Number(reward.amount),
        );

        // Mettre à jour la récompense avec le hash de transaction et le statut
        reward.transactionHash = txHash;
        reward.status = RewardStatus.PROCESSED;
        reward.processedAt = new Date();

        const updatedReward = await this.rewardRepository.save(reward);
        this.logger.log(`Récompense avec l'ID ${id} traitée avec succès, hash de transaction: ${txHash}`);

        return updatedReward;
      } catch (error) {
        // En cas d'échec de la transaction, mettre à jour le statut
        reward.status = RewardStatus.FAILED;
        reward.processedAt = new Date();
        reward.metadata = {
          ...reward.metadata as object,
          error: error.message,
          failedAt: new Date().toISOString(),
        };

        const failedReward = await this.rewardRepository.save(reward);
        this.logger.error(`Échec du traitement de la récompense avec l'ID ${id}: ${error.message}`);

        throw new Error(`Échec du traitement de la récompense: ${error.message}`);
      }
    } catch (error) {
      this.logger.error(`Erreur lors du traitement de la récompense: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Marquer une récompense comme réclamée
   */
  async claimReward(id: string, userId: string): Promise<Reward> {
    try {
      const reward = await this.findOne(id);

      // Vérifier que la récompense appartient à l'utilisateur
      if (reward.userId !== userId) {
        throw new BadRequestException('Cette r��compense n\'appartient pas à l\'utilisateur spécifié');
      }

      // Vérifier que la récompense a été traitée avec succès
      if (reward.status !== RewardStatus.PROCESSED) {
        throw new BadRequestException(`La récompense ne peut pas être réclamée car son statut est ${reward.status}`);
      }

      // Mettre à jour le statut
      reward.status = RewardStatus.CLAIMED;
      const claimedReward = await this.rewardRepository.save(reward);
      this.logger.log(`Récompense avec l'ID ${id} réclamée par l'utilisateur ${userId}`);

      return claimedReward;
    } catch (error) {
      this.logger.error(`Erreur lors de la réclamation de la récompense: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Calculer le solde total des récompenses d'un utilisateur
   */
  async getUserBalance(userId: string): Promise<UserBalanceDto> {
    try {
      // Récupérer le solde blockchain (réel)
      const onChainBalance = await this.blockchainService.getTokenBalance(userId);

      // Calculer les récompenses en attente (non traitées)
      const pendingRewards = await this.rewardRepository.find({
        where: { 
          userId,
          status: RewardStatus.PENDING,
        },
      });

      const pendingAmount = pendingRewards.reduce(
        (sum, reward) => sum + Number(reward.amount),
        0,
      );

      // Calculer les récompenses traitées mais non réclamées
      const processedRewards = await this.rewardRepository.find({
        where: { 
          userId,
          status: RewardStatus.PROCESSED,
        },
      });

      const processedAmount = processedRewards.reduce(
        (sum, reward) => sum + Number(reward.amount),
        0,
      );

      return {
        userId,
        onChainBalance,
        pendingAmount,
        processedAmount,
        totalBalance: onChainBalance + pendingAmount,
        lastUpdated: new Date(),
      };
    } catch (error) {
      this.logger.error(`Erreur lors du calcul du solde de l'utilisateur: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Résumer les récompenses par type pour un utilisateur
   */
  async getUserRewardSummary(userId: string): Promise<any> {
    try {
      const rewards = await this.rewardRepository.find({
        where: { userId },
      });

      if (rewards.length === 0) {
        return {
          totalRewards: 0,
          totalAmount: 0,
          rewardsByType: {},
          rewardsByMonth: {},
        };
      }

      // Initialiser les compteurs
      let totalAmount = 0;
      const rewardsByType = {};
      const rewardsByMonth = {};

      // Parcourir les récompenses
      rewards.forEach(reward => {
        // Accumulation du montant total
        totalAmount += Number(reward.amount);

        // Regrouper par type
        if (!rewardsByType[reward.type]) {
          rewardsByType[reward.type] = {
            count: 0,
            amount: 0,
          };
        }
        rewardsByType[reward.type].count++;
        rewardsByType[reward.type].amount += Number(reward.amount);

        // Regrouper par mois
        const month = reward.createdAt.toISOString().substring(0, 7); // Format YYYY-MM
        if (!rewardsByMonth[month]) {
          rewardsByMonth[month] = {
            count: 0,
            amount: 0,
          };
        }
        rewardsByMonth[month].count++;
        rewardsByMonth[month].amount += Number(reward.amount);
      });

      return {
        totalRewards: rewards.length,
        totalAmount,
        rewardsByType,
        rewardsByMonth,
      };
    } catch (error) {
      this.logger.error(`Erreur lors du calcul du résumé des récompenses: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Calculer le multiplicateur de récompense basé sur les NFTs de l'utilisateur
   */
  private async getNFTMultiplier(userId: string): Promise<number> {
    try {
      // Récupérer les NFTs de l'utilisateur via le service NFT
      const nftBoost = await this.nftService.getUserNFTBoost(userId);
      
      // Le multiplicateur de base est 1.0 (100%)
      // Le boost NFT est exprimé en pourcentage (ex: 25 pour 25%)
      const multiplier = 1 + (nftBoost / 100);
      
      return parseFloat(multiplier.toFixed(2));
    } catch (error) {
      this.logger.warn(`Impossible de récupérer le multiplicateur NFT pour l'utilisateur ${userId}: ${error.message}`);
      return 1.0; // Valeur par défaut si erreur
    }
  }
}