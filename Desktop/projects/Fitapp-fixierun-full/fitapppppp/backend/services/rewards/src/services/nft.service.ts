import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ethers } from 'ethers';
import * as FixieNFTABI from '../abi/FixieNFT.json';

@Injectable()
export class NFTService {
  private readonly logger = new Logger(NFTService.name);
  private provider: ethers.providers.Provider;
  private nftContract: ethers.Contract;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.initializeNFTContract();
  }

  /**
   * Initialisation de la connexion au contrat NFT
   */
  private initializeNFTContract() {
    try {
      const rpcUrl = this.configService.get<string>('BLOCKCHAIN_NODE_URL');
      const nftContractAddress = this.configService.get<string>('NFT_CONTRACT_ADDRESS');
      
      // Vérifier que les configurations essentielles sont présentes
      if (!rpcUrl || !nftContractAddress) {
        throw new Error('Configuration NFT incomplète');
      }

      // Créer le provider et le contrat
      this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      this.nftContract = new ethers.Contract(
        nftContractAddress,
        FixieNFTABI,
        this.provider
      );

      this.logger.log('Connexion au contrat NFT initialisée avec succès');
    } catch (error) {
      this.logger.error(`Échec de l'initialisation du contrat NFT: ${error.message}`, error.stack);
      this.logger.error('La fonctionnalité NFT ne sera pas disponible!');
    }
  }

  /**
   * Récupérer le boost total de récompenses basé sur les NFTs d'un utilisateur
   * @param userAddress Adresse Ethereum de l'utilisateur
   * @returns Pourcentage de boost (0-100)
   */
  async getUserNFTBoost(userAddress: string): Promise<number> {
    try {
      // Valider l'adresse Ethereum
      if (!ethers.utils.isAddress(userAddress)) {
        throw new Error(`Adresse invalide: ${userAddress}`);
      }

      // Appeler le contrat pour obtenir le boost total
      const totalBoost = await this.nftContract.getTotalRewardBoost(userAddress);
      this.logger.log(`Boost NFT pour ${userAddress}: ${totalBoost}%`);
      
      return totalBoost;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération du boost NFT: ${error.message}`, error.stack);
      
      // En cas d'erreur, essayer de récupérer les informations via l'API du microservice NFT
      try {
        const nftServiceUrl = this.configService.get<string>('NFT_SERVICE_URL');
        if (nftServiceUrl) {
          const response = await lastValueFrom(
            this.httpService.get(`${nftServiceUrl}/api/v1/nfts/boost/${userAddress}`)
          );
          
          return response.data.boostPercentage || 0;
        }
      } catch (secondaryError) {
        this.logger.error('Échec de la récupération du boost via le service NFT', secondaryError.stack);
      }
      
      // Valeur par défaut si tout échoue
      return 0;
    }
  }

  /**
   * Récupérer tous les NFTs d'un utilisateur
   * @param userAddress Adresse Ethereum de l'utilisateur
   * @returns Liste des NFTs avec leurs métadonnées
   */
  async getUserNFTs(userAddress: string): Promise<any[]> {
    try {
      // Valider l'adresse Ethereum
      if (!ethers.utils.isAddress(userAddress)) {
        throw new Error(`Adresse invalide: ${userAddress}`);
      }

      // Appeler le service NFT dédié
      const nftServiceUrl = this.configService.get<string>('NFT_SERVICE_URL');
      if (!nftServiceUrl) {
        throw new Error('URL du service NFT non configurée');
      }
      
      const response = await lastValueFrom(
        this.httpService.get(`${nftServiceUrl}/api/v1/nfts/user/${userAddress}`)
      );
      
      return response.data || [];
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des NFTs: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * Vérifier si un utilisateur possède un NFT spécifique
   * @param userAddress Adresse Ethereum de l'utilisateur
   * @param nftType Type de NFT à vérifier
   * @param minRarity Niveau de rareté minimum (optionnel)
   * @returns Booléen indiquant la possession
   */
  async userHasNFTOfType(userAddress: string, nftType: string, minRarity?: number): Promise<boolean> {
    try {
      const nfts = await this.getUserNFTs(userAddress);
      
      for (const nft of nfts) {
        if (nft.type === nftType) {
          if (!minRarity || nft.rarityLevel >= minRarity) {
            return true;
          }
        }
      }
      
      return false;
    } catch (error) {
      this.logger.error(`Erreur lors de la vérification des NFTs: ${error.message}`, error.stack);
      return false;
    }
  }
}