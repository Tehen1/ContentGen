"""
REST API module for Fixie.Run.

This module provides a simple REST API for remote access to Fixie.Run functionality.
It allows integrating the cycling rewards system with external apps and services.
"""

import logging
import json
from typing import Dict, Any, Optional, List, Union
from pathlib import Path
import os
from datetime import datetime

from fastapi import FastAPI, HTTPException, Depends, Body, Query, Path as PathParam
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel, Field

from fixie_run.config import settings
from fixie_run.core.rewards import ActivityData, calculate_rewards, rewards_to_dict
from fixie_run.core.blockchain import BlockchainClient
from fixie_run.adapters.report_adapter import extract_cycling_stats, ReportParsingError

# Configure logging
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Fixie.Run API",
    description="API for cycling rewards on zkEVM blockchain",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models for API requests and responses
class CyclingStatsRequest(BaseModel):
    """Model for cycling statistics input."""
    distance_km: float = Field(..., gt=0, description="Distance cycled in kilometers")
    duration_hours: float = Field(..., gt=0, description="Duration of cycling in hours")
    elevation_m: Optional[float] = Field(None, ge=0, description="Elevation gained in meters")
    num_activities: Optional[int] = Field(None, ge=0, description="Number of cycling activities")
    avg_speed: Optional[float] = Field(None, ge=0, description="Average cycling speed in km/h")

class RewardsResponse(BaseModel):
    """Model for rewards calculation response."""
    base: float = Field(..., description="Base rewards in FIXIE tokens")
    distance: float = Field(..., description="Distance-based rewards in FIXIE tokens")
    time: float = Field(..., description="Time-based rewards in FIXIE tokens")
    weekly_bonus: float = Field(..., description="Weekly challenge bonus in FIXIE tokens")
    total: float = Field(..., description="Total rewards in FIXIE tokens")
    tier: str = Field(..., description="Reward tier based on distance")

class ClaimRequest(BaseModel):
    """Model for reward claim request."""
    wallet_address: str = Field(..., description="Ethereum wallet address to receive tokens")
    amount: float = Field(..., gt=0, description="Amount of FIXIE tokens to claim")

class ClaimResponse(BaseModel):
    """Model for reward claim response."""
    success: bool = Field(..., description="Whether the claim was successful")
    transaction_hash: Optional[str] = Field(None, description="Blockchain transaction hash if successful")
    error: Optional[str] = Field(None, description="Error message if unsuccessful")

class StatusResponse(BaseModel):
    """Model for API status response."""
    status: str = Field(..., description="API status")
    version: str = Field(..., description="API version")
    blockchain_enabled: bool = Field(..., description="Whether blockchain integration is enabled")
    timestamp: str = Field(..., description="Current server timestamp")

# Initialize blockchain client
blockchain_client = None
if settings.BLOCKCHAIN_ENABLED:
    blockchain_client = BlockchainClient()

# API endpoints

@app.get("/", response_model=StatusResponse)
async def get_status():
    """Get API status information."""
    return {
        "status": "online",
        "version": "0.1.0",
        "blockchain_enabled": settings.BLOCKCHAIN_ENABLED,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/rewards/calculate", response_model=RewardsResponse)
async def calculate_rewards_endpoint(stats: CyclingStatsRequest):
    """
    Calculate rewards based on cycling statistics.
    
    This endpoint calculates the rewards a user would earn based on their
    cycling activity data, following the Fixie.Run reward model.
    """
    try:
        # Convert request model to ActivityData
        activity_data = ActivityData(
            distance_km=stats.distance_km,
            duration_hours=stats.duration_hours,
            elevation_m=stats.elevation_m,
            num_activities=stats.num_activities,
            avg_speed=stats.avg_speed
        )
        
        # Calculate rewards
        rewards = calculate_rewards(activity_data)
        
        # Create response
        response_data = rewards_to_dict(rewards)
        response_data["tier"] = calculate_reward_tier(activity_data.distance_km)
        
        return response_data
    except Exception as e:
        logger.error(f"Error calculating rewards: {e}")
        raise HTTPException(status_code=500, detail=f"Error calculating rewards: {e}")

@app.post("/rewards/claim", response_model=ClaimResponse)
async def claim_rewards(claim_request: ClaimRequest):
    """
    Claim FIXIE token rewards to a wallet address.
    
    This endpoint processes a request to send FIXIE tokens to a user's
    wallet address on the zkEVM blockchain.
    """
    if not settings.BLOCKCHAIN_ENABLED or not blockchain_client:
        raise HTTPException(
            status_code=503, 
            detail="Blockchain integration is not enabled"
        )
    
    try:
        # Validate wallet address (simplified check)
        wallet_address = claim_request.wallet_address
        if not wallet_address.startswith("0x") or len(wallet_address) != 42:
            raise HTTPException(
                status_code=400,
                detail="Invalid wallet address format"
            )
        
        # Send tokens
        tx_hash = blockchain_client.send_reward_tokens(
            recipient_address=wallet_address,
            amount=claim_request.amount
        )
        
        if tx_hash:
            return {
                "success": True,
                "transaction_hash": tx_hash,
                "error": None
            }
        else:
            return {
                "success": False,
                "transaction_hash": None,
                "error": "Transaction failed"
            }
    except Exception as e:
        logger.error(f"Error claiming rewards: {e}")
        return {
            "success": False,
            "transaction_hash": None,
            "error": str(e)
        }

@app.get("/rewards/tiers")
async def get_reward_tiers():
    """Get information about available reward tiers."""
    return {
        "tiers": [
            {
                "name": "Bronze",
                "min_distance": 0,
                "max_distance": 100,
                "description": "Entry-level tier for new cyclists"
            },
            {
                "name": "Silver",
                "min_distance": 101,
                "max_distance": 250,
                "description": "Regular cyclist with moderate distances"
            },
            {
                "name": "Gold",
                "min_distance": 251,
                "max_distance": 500,
                "description": "Dedicated cyclist with substantial distances"
            },
            {
                "name": "Platinum",
                "min_distance": 501,
                "max_distance": 1000,
                "description": "Serious cyclist with impressive distances"
            },
            {
                "name": "Diamond",
                "min_distance": 1001,
                "max_distance": None,
                "description": "Elite cyclist with extraordinary distances"
            }
        ]
    }

@app.get("/reports/{report_id}")
async def get_report(report_id: str):
    """Get a specific cycling report by ID."""
    # In a real implementation, this would fetch from a database
    # Here we just check if the file exists
    try:
        report_path = settings.OUTPUT_DIR / f"{report_id}.md"
        if not report_path.exists():
            raise HTTPException(status_code=404, detail="Report not found")
        
        return FileResponse(report_path)
    except Exception as e:
        logger.error(f"Error retrieving report: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving report: {e}")

@app.post("/reports/parse")
async def parse_report_content(content: str = Body(..., embed=True)):
    """Parse cycling statistics from report content."""
    try:
        stats = extract_cycling_stats(content)
        return {
            "distance_km": stats.distance_km,
            "duration_hours": stats.duration_hours,
            "elevation_m": stats.elevation_m,
            "num_activities": stats.num_activities,
            "avg_speed": stats.avg_speed
        }
    except ReportParsingError as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse report: {e}")
    except Exception as e:
        logger.error(f"Error parsing report content: {e}")
        raise HTTPException(status_code=500, detail=f"Error parsing report: {e}")

# Helper functions

def calculate_reward_tier(distance_km: float) -> str:
    """Calculate reward tier based on distance."""
    if distance_km > 1000:
        return "Diamond"
    elif distance_km > 500:
        return "Platinum"
    elif distance_km > 250:
        return "Gold"
    elif distance_km > 100:
        return "Silver"
    else:
        return "Bronze"

# Run the API using Uvicorn when module is executed directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("fixie_run.api.rest_api:app", host="0.0.0.0", port=8000, reload=True)