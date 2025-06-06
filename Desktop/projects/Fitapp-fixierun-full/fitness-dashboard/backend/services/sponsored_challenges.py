from web3 import Web3
import json
from fastapi import HTTPException
from models import SponsoredChallenge, User
from database import get_db
from sqlalchemy.orm import Session
from datetime import datetime
from .web3_service import Web3Service

class SponsoredChallengeService:
    def __init__(self, w3: Web3, contract_address: str, contract_abi: list):
        self.w3 = w3
        self.contract = w3.eth.contract(
            address=contract_address,
            abi=contract_abi
        )
        self.web3_service = Web3Service(w3)

    async def create_challenge(
        self,
        sponsor_wallet: str,
        reward_pool: float,
        participant_limit: int,
        metadata_uri: str,
        duration_days: int,
        db: Session
    ):
        """Crée un nouveau défi sponsorisé"""
        try:
            # Convertir la récompense en wei
            reward_wei = self.w3.toWei(reward_pool, 'ether')
            
            # Générer la preuve ZK (simplifiée pour l'exemple)
            zk_proof = self.web3_service.generate_zk_proof(sponsor_wallet)
            
            # Appel au contrat
            tx_hash = self.contract.functions.createChallenge(
                reward_wei,
                participant_limit,
                metadata_uri,
                duration_days * 86400,  # Convertir en secondes
                zk_proof
            ).transact({
                'from': sponsor_wallet,
                'value': reward_wei
            })
            
            # Récupérer l'ID du défi
            tx_receipt = self.w3.eth.waitForTransactionReceipt(tx_hash)
            challenge_id = self.contract.events.ChallengeCreated().processReceipt(tx_receipt)[0]['args']['challengeId']
            
            # Sauvegarde en base de données
            db_challenge = SponsoredChallenge(
                id=challenge_id,
                sponsor_wallet=sponsor_wallet,
                reward_pool=reward_pool,
                participant_limit=participant_limit,
                metadata_uri=metadata_uri,
                start_time=datetime.utcnow(),
                end_time=datetime.utcnow() + timedelta(days=duration_days)
            )
            db.add(db_challenge)
            db.commit()
            
            return {
                "challenge_id": challenge_id,
                "tx_hash": tx_hash.hex()
            }
            
        except Exception as e:
            db.rollback()
            raise HTTPException(400, f"Erreur création défi: {str(e)}")

    async def join_challenge(
        self,
        user_wallet: str,
        challenge_id: int,
        db: Session
    ):
        """Permet à un utilisateur de rejoindre un défi"""
        try:
            # Vérifier que le défi existe
            challenge = db.query(SponsoredChallenge).get(challenge_id)
            if not challenge:
                raise HTTPException(404, "Défi non trouvé")
                
            # Générer la preuve ZK
            zk_proof = self.web3_service.generate_zk_proof(user_wallet)
            
            # Appel au contrat
            tx_hash = self.contract.functions.joinChallenge(
                challenge_id,
                zk_proof
            ).transact({
                'from': user_wallet
            })
            
            return {"tx_hash": tx_hash.hex()}
            
        except Exception as e:
            raise HTTPException(400, f"Erreur participation: {str(e)}")

    async def get_challenge_details(self, challenge_id: int, db: Session):
        """Récupère les détails d'un défi"""
        challenge = db.query(SponsoredChallenge).get(challenge_id)
        if not challenge:
            raise HTTPException(404, "Défi non trouvé")
            
        # Récupérer les données on-chain
        onchain_data = self.contract.functions.challenges(challenge_id).call()
        
        return {
            **challenge.to_dict(),
            "onchain_data": {
                "reward_pool": self.w3.fromWei(onchain_data[1], 'ether'),
                "participant_count": self.contract.functions.getParticipantCount(challenge_id).call()
            }
        }