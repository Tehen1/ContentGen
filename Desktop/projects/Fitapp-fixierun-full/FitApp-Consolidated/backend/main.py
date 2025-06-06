from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

app = FastAPI(title="FitApp API", version="1.0.0")

class Activity(BaseModel):
    id: int
    user_id: int
    type: str
    distance: float
    duration: int
    calories: int
    timestamp: datetime

class User(BaseModel):
    id: int
    name: str
    email: str
    level: int
    experience: int
    token_balance: float

class NFT(BaseModel):
    id: int
    name: str
    rarity: str
    level: int
    boost: str

# Mock database
activities_db = []
users_db = []
nfts_db = []

@app.get("/")
async def root():
    return {"message": "Welcome to FitApp API"}

@app.post("/api/v1/activity", response_model=Activity)
async def create_activity(activity: Activity):
    activity.id = len(activities_db) + 1
    activities_db.append(activity)
    return activity

@app.get("/api/v1/activity", response_model=List[Activity])
async def get_activities(user_id: Optional[int] = None):
    if user_id:
        return [a for a in activities_db if a.user_id == user_id]
    return activities_db

@app.get("/api/v1/user/{user_id}", response_model=User)
async def get_user(user_id: int):
    user = next((u for u in users_db if u.id == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.get("/api/v1/nft/{user_id}", response_model=List[NFT])
async def get_user_nfts(user_id: int):
    return [n for n in nfts_db if n.user_id == user_id]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
