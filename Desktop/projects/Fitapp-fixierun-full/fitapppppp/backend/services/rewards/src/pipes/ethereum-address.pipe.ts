import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ethers } from 'ethers';

/**
 * Pipe that validates and transforms Ethereum addresses
 */
@Injectable()
export class ParseEthereumAddressPipe implements PipeTransform<string, string> {
  /**
   * Validates and transforms an Ethereum address
   * @param value The input Ethereum address
   * @param metadata Metadata about the parameter being processed
   * @returns Ethereum address in checksum format
   * @throws BadRequestException if the address is invalid
   */
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!value) {
      throw new BadRequestException('Ethereum address is required');
    }

    try {
      // Check if the value is a valid Ethereum address
      if (!ethers.utils.isAddress(value)) {
        throw new Error('Invalid Ethereum address format');
      }

      // Return the address in checksum format
      return ethers.utils.getAddress(value);
    } catch (error) {
      throw new BadRequestException(`Invalid Ethereum address: ${error.message}`);
    }
  }
}

