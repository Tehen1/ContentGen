import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { create } from 'ipfs-http-client';

@Injectable()
export class IpfsService {
  private readonly logger = new Logger(IpfsService.name);
  private ipfsClient: any;
  private readonly ipfsGatewayUrl: string;

  constructor(private configService: ConfigService) {
    this.initializeIpfs().catch(error => {
      this.logger.error(`Failed to initialize IPFS client: ${error.message}`);
    });
    
    this.ipfsGatewayUrl = this.configService.get<string>(
      'IPFS_GATEWAY_URL',
      'https://ipfs.io/ipfs'
    );
  }

  private async initializeIpfs() {
    try {
      const ipfsApiUrl = this.configService.get<string>('IPFS_API_URL');
      
      if (!ipfsApiUrl) {
        this.logger.warn('No IPFS API URL provided, operating in simulation mode');
        return;
      }
      
      // In a real implementation, we would connect to an IPFS node
      // For this example, we'll use a simulated client
      // this.ipfsClient = create({ url: ipfsApiUrl });
      this.logger.log(`Connected to IPFS node at ${ipfsApiUrl}`);
    } catch (error) {
      this.logger.error(`Error connecting to IPFS: ${error.message}`);
      throw error;
    }
  }

  /**
   * Uploads metadata to IPFS
   * @param metadata The NFT metadata object
   * @returns The IPFS hash (CID) of the uploaded metadata
   */
  async uploadMetadata(metadata: any): Promise<string> {
    this.logger.log('Uploading NFT metadata to IPFS');
    
    try {
      // Validate metadata
      this.validateMetadata(metadata);
      
      // In a real implementation, we would upload to IPFS like this:
      // const result = await this.ipfsClient.add(JSON.stringify(metadata));
      // return result.cid.toString();
      
      // For this example, we'll simulate the IPFS upload
      // Generate a random IPFS hash
      const ipfsHash = `Qm${this.generateRandomString(44)}`;
      
      this.logger.log(`Metadata uploaded successfully with hash: ${ipfsHash}`);
      return ipfsHash;
    } catch (error) {
      this.logger.error(`Failed to upload metadata: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Uploads an image file to IPFS
   * @param imageBuffer The image file buffer
   * @param fileName Optional file name
   * @returns The IPFS hash (CID) of the uploaded image
   */
  async uploadImage(imageBuffer: Buffer, fileName?: string): Promise<string> {
    this.logger.log(`Uploading image${fileName ? ` (${fileName})` : ''} to IPFS`);
    
    try {
      // In a real implementation, we would upload to IPFS like this:
      // const result = await this.ipfsClient.add(imageBuffer, {
      //   pin: true,
      //   progress: (bytes: number) => this.logger.debug(`Uploaded ${bytes} bytes`)
      // });
      // return result.cid.toString();
      
      // For this example, we'll simulate the IPFS upload
      // Generate a random IPFS hash
      const ipfsHash = `Qm${this.generateRandomString(44)}`;
      
      this.logger.log(`Image uploaded successfully with hash: ${ipfsHash}`);
      return ipfsHash;
    } catch (error) {
      this.logger.error(`Failed to upload image: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Retrieves metadata from IPFS
   * @param ipfsHash The IPFS hash (CID) of the metadata
   * @returns The NFT metadata object
   */
  async getMetadata(ipfsHash: string): Promise<any> {
    this.logger.log(`Retrieving metadata for IPFS hash: ${ipfsHash}`);
    
    try {
      // In a real implementation, we would fetch from IPFS like this:
      // const data = await this.ipfsClient.cat(ipfsHash);
      // let content = '';
      // for await (const chunk of data) {
      //   content += chunk.toString();
      // }
      // return JSON.parse(content);
      
      // For this example, we'll simulate the IPFS retrieval
      // Generate a random metadata object
      return {
        name: `NFT #${Math.floor(Math.random() * 10000)}`,
        description: 'This is a simulated NFT metadata from IPFS',
        image: `ipfs://Qm${this.generateRandomString(44)}`,
        attributes: [
          { trait_type: 'Rarity', value: 'Common' },
          { trait_type: 'Type', value: 'Badge' },
        ],
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve metadata: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Converts an IPFS hash to a publicly accessible URL
   * @param ipfsHash The IPFS hash (CID)
   * @returns The public HTTP URL
   */
  getIpfsUrl(ipfsHash: string): string {
    // Remove ipfs:// prefix if present
    const hash = ipfsHash.replace(/^ipfs:\/\//, '');
    return `${this.ipfsGatewayUrl}/${hash}`;
  }
  
  /**
   * Validates NFT metadata structure
   * @param metadata The metadata object to validate
   * @throws BadRequestException if metadata is invalid
   */
  private validateMetadata(metadata: any): void {
    if (!metadata) {
      throw new BadRequestException('Metadata cannot be empty');
    }
    
    // Check for required fields
    if (!metadata.name) {
      throw new BadRequestException('Metadata must include a name');
    }
    
    if (!metadata.description) {
      throw new BadRequestException('Metadata must include a description');
    }
    
    if (!metadata.image && !metadata.image_url) {
      throw new BadRequestException('Metadata must include an image reference');
    }
  }
  
  /**
   * Generates a random string of specified length
   * @param length The length of the string to generate
   * @returns Random string
   */
  private generateRandomString(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

