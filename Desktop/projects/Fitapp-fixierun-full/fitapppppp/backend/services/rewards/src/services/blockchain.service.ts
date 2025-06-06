import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import * as FixieTokenABI from '../abi/FixieToken.json';

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.providers.Provider;
  private wallet: ethers.Wallet;
  private tokenContract: ethers.Contract;

  constructor(private configService: ConfigService) {
    this.initializeBlockchain();
  }

  /**
   * Initialisation des connexions blockchain et contrats
   */
  private initializeBlockchain() {
    try {
      // Récupérer la configuration
      const rpcUrl = this.configService.get<string>('BLOCKCHAIN_NODE_URL');
      const privateKey = this.configService.get<string>('SERVICE_WALLET_PRIVATE_KEY');
      const tokenContractAddress = this.configService.get<string>('TOKEN_CONTRACT_ADDRESS');
      
      // Vérifier que les configurations essentielles sont présentes
      if (!rpcUrl || !privateKey || !tokenContractAddress) {
        throw new Error('Configuration blockchain incomplète');
      }

      // Créer le provider et le wallet
      this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      
      // Initialiser le contrat de tokens
      this.tokenContract = new ethers.Contract(
        tokenContractAddress,
        FixieTokenABI,
        this.wallet
      );

      this.logger.log('Connexion blockchain et contrats initialisés avec succès');
    } catch (error) {
      this.logger.error(`Échec de l'initialisation blockchain: ${error.message}`, error.stack);
      // Ne pas planter l'application, mais signaler clairement l'erreur
      this.logger.error('Le service blockchain ne sera pas fonctionnel!');
    }
  }

  /**
   * Transférer des tokens FIXIE à un utilisateur
   * @param userAddress Adresse Ethereum de l'utilisateur
   * @param amount Montant de tokens à transférer
   * @returns Hash de la transaction
   */
  async transferTokens(userAddress: string, amount: number): Promise<string> {
    try {
      // Valider l'adresse Ethereum
      if (!ethers.utils.isAddress(userAddress)) {
        throw new Error(`Adresse invalide: ${userAddress}`);
      }

      // Convertir le montant en format blockchain (avec les décimales)
      const tokenDecimals = await this.tokenContract.decimals();
      const amountWithDecimals = ethers.utils.parseUnits(
        amount.toString(),
        tokenDecimals
      );

      // Vérifier le solde du service
      const serviceBalance = await this.tokenContract.balanceOf(this.wallet.address);
      if (serviceBalance.lt(amountWithDecimals)) {
        throw new Error(
          `Solde insuffisant dans le portefeuille de service: ${ethers.utils.formatUnits(serviceBalance, tokenDecimals)} tokens`
        );
      }

      // Effectuer le transfert
      this.logger.log(`Transfert de ${amount} tokens à ${userAddress}`);
      const tx = await this.tokenContract.transfer(userAddress, amountWithDecimals);
      
      // Attendre que la transaction soit minée
      await tx.wait();
      
      this.logger.log(`Transfert réussi: ${tx.hash}`);
      return tx.hash;
    } catch (error) {
      this.logger.error(`Erreur lors du transfert de tokens: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Récupérer le solde de tokens FIXIE d'un utilisateur
   * @param userAddress Adresse Ethereum de l'utilisateur
   * @returns Solde de tokens
   */
  async getTokenBalance(userAddress: string): Promise<number> {
    try {
      // Valider l'adresse Ethereum
      if (!ethers.utils.isAddress(userAddress)) {
        throw new Error(`Adresse invalide: ${userAddress}`);
      }

      // Récupérer le solde
      const balanceWei = await this.tokenContract.balanceOf(userAddress);
      const tokenDecimals = await this.tokenContract.decimals();
      
      // Convertir de Wei à un nombre décimal
      const balance = parseFloat(
        ethers.utils.formatUnits(balanceWei, tokenDecimals)
      );
      
      return balance;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération du solde: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Récupérer les détails du contrat de tokens
   * @returns Détails du contrat (nom, symbole, offre totale)
   */
  async getTokenDetails(): Promise<any> {
    try {
      const name = await this.tokenContract.name();
      const symbol = await this.tokenContract.symbol();
      const totalSupplyWei = await this.tokenContract.totalSupply();
      const decimals = await this.tokenContract.decimals();
      
      const totalSupply = parseFloat(
        ethers.utils.formatUnits(totalSupplyWei, decimals)
      );
      
      return {
        name,
        symbol,
        totalSupply,
        decimals,
        contractAddress: this.tokenContract.address,
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des détails du token: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Vérifier la connexion blockchain 
   * @returns Statut de la connexion
   */
  async checkConnection(): Promise<{ connected: boolean; blockNumber?: number; network?: string }> {
    try {
      // Tenter de récupérer le numéro de bloc actuel
      const blockNumber = await this.provider.getBlockNumber();
      const network = await this.provider.getNetwork();
      
      return {
        connected: true,
        blockNumber,
        network: `${network.name} (${network.chainId})`,
      };
    } catch (error) {
      this.logger.error(`Vérification de connexion blockchain échouée: ${error.message}`);
      return {
        connected: false,
      };
    }
  }
}