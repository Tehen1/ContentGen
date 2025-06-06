import { ApiProperty } from '@nestjs/swagger';

export class UserBalanceDto {
  @ApiProperty({ 
    description: 'ID de l\'utilisateur',
    example: '0x71C23bD19f56E521948a6D3111955C79557EB1C8'
  })
  userId: string;

  @ApiProperty({ 
    description: 'Solde on-chain (confirmé sur la blockchain)',
    example: 150.25
  })
  onChainBalance: number;

  @ApiProperty({ 
    description: 'Montant en attente de traitement',
    example: 25.5
  })
  pendingAmount: number;

  @ApiProperty({ 
    description: 'Montant traité mais non réclamé',
    example: 10
  })
  processedAmount: number;

  @ApiProperty({ 
    description: 'Solde total (on-chain + en attente)',
    example: 175.75
  })
  totalBalance: number;

  @ApiProperty({ 
    description: 'Date de la dernière mise à jour du solde',
    example: '2023-05-15T14:30:45.123Z'
  })
  lastUpdated: Date;
}