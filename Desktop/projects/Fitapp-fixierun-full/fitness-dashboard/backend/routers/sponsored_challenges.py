from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from typing import List
from models import SponsoredChallenge, User
from schemas import ChallengeCreate, ChallengeDetails
from services.sponsored_challenges import SponsoredChallengeService
from database import get_db
from sqlalchemy.orm import Session
from .dependencies import get_current_user

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@router.post("/", response_model=ChallengeDetails)
async def create_challenge(
    challenge_data: ChallengeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Crée un nouveau défi sponsorisé"""
    if not current_user.is_sponsor:
        raise HTTPException(403, "Seuls les sponsors peuvent créer des défis")
    
    service = SponsoredChallengeService()
    return await service.create_challenge(
        sponsor_wallet=current_user.wallet_address,
        reward_pool=challenge_data.reward_pool,
        participant_limit=challenge_data.participant_limit,
        metadata_uri=challenge_data.metadata_uri,
        duration_days=challenge_data.duration_days,
        db=db
    )

@router.post("/{challenge_id}/join")
async def join_challenge(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Rejoindre un défi sponsorisé"""
    service = SponsoredChallengeService()
    return await service.join_challenge(
        user_wallet=current_user.wallet_address,
        challenge_id=challenge_id,
        db=db
    )

@router.get("/{challenge_id}", response_model=ChallengeDetails)
async def get_challenge(
    challenge_id: int,
    db: Session = Depends(get_db)
):
    """Récupère les détails d'un défi"""
    service = SponsoredChallengeService()
    return await service.get_challenge_details(challenge_id, db)

@router.get("/", response_model=List[ChallengeDetails])
async def list_challenges(
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """Liste tous les défis sponsorisés"""
    query = db.query(SponsoredChallenge)
    if active_only:
        query = query.filter(SponsoredChallenge.end_time > datetime.utcnow())
    
    challenges = query.all()
    service = SponsoredChallengeService()
    
    return [
        await service.get_challenge_details(ch.id, db)
        for ch in challenges
    ]