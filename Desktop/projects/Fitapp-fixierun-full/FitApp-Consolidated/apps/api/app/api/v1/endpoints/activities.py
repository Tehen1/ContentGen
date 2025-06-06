from datetime import datetime
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from uuid import UUID

from app.models.activity import Activity, ActivityCreate, ActivitySummary, UserActivityStats
from app.models.user import User
from app.api.deps import get_current_user, get_activity_service
from app.services.activity_service import ActivityService

router = APIRouter()

@router.post("/", response_model=Activity, status_code=status.HTTP_201_CREATED)
async def create_activity(
    activity_data: ActivityCreate,
    current_user: User = Depends(get_current_user),
    activity_service: ActivityService = Depends(get_activity_service)
):
    """
    Create a new activity record
    
    The activity will be verified and rewards will be processed if valid.
    """
    return await activity_service.create_activity(activity_data, current_user.id)

@router.get("/", response_model=List[ActivitySummary])
async def get_activities(
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    activity_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    activity_service: ActivityService = Depends(get_activity_service)
):
    """
    Get list of activities for the current user
    
    Can be filtered by date range and activity type.
    """
    return await activity_service.get_user_activities(
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        start_date=start_date,
        end_date=end_date,
        activity_type=activity_type
    )

@router.get("/{activity_id}", response_model=Activity)
async def get_activity(
    activity_id: UUID,
    current_user: User = Depends(get_current_user),
    activity_service: ActivityService = Depends(get_activity_service)
):
    """
    Get details for a specific activity
    """
    activity = await activity_service.get_activity_by_id(activity_id)
    
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Activity with ID {activity_id} not found"
        )
        
    # Check if user owns the activity
    if activity.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this activity"
        )
        
    return activity

@router.get("/stats/summary", response_model=UserActivityStats)
async def get_activity_stats(
    current_user: User = Depends(get_current_user),
    activity_service: ActivityService = Depends(get_activity_service)
):
    """
    Get activity statistics summary for the current user
    """
    return await activity_service.get_activity_stats(current_user.id)

@router.post("/{activity_id}/process-rewards", response_model=Dict[str, Any])
async def process_activity_rewards(
    activity_id: UUID,
    current_user: User = Depends(get_current_user),
    activity_service: ActivityService = Depends(get_activity_service)
):
    """
    Process rewards for a verified activity
    
    This endpoint is used to check and update reward status for an activity
    after blockchain confirmation.
    """
    # Check if user owns the activity
    activity = await activity_service.get_activity_by_id(activity_id)
    
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Activity with ID {activity_id} not found"
        )
        
    if activity.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this activity"
        )
        
    return await activity_service.process_activity_rewards(activity_id)