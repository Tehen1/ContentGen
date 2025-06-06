import pandas as pd
from keplergl import KeplerGl
import json
from fastapi import APIRouter
from geopy.distance import geodesic
from typing import List
from models import CyclingActivity
from database import get_db
from sqlalchemy.orm import Session

router = APIRouter()

def generate_heatmap(activities: List[CyclingActivity]):
    """Génère une heatmap à partir des activités"""
    points = []
    for activity in activities:
        points.extend([
            {'lat': coord[0], 'lon': coord[1]} 
            for coord in json.loads(activity.coordinates)
        ])
    
    df = pd.DataFrame(points)
    
    map_config = {
        "version": "v1",
        "config": {
            "mapState": {
                "bearing": 0,
                "pitch": 45,
                "zoom": 12
            },
            "mapStyle": "dark"
        }
    }
    
    kepler_map = KeplerGl(data={"Cycling": df}, config=map_config)
    return kepler_map

@router.get("/heatmap/{user_id}")
async def get_user_heatmap(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Endpoint pour récupérer la heatmap d'un utilisateur"""
    activities = db.query(CyclingActivity).filter(
        CyclingActivity.user_id == user_id
    ).all()
    
    if not activities:
        return {"error": "Aucune activité trouvée"}
    
    heatmap = generate_heatmap(activities)
    return {"heatmap": heatmap.to_json()}

@router.get("/heatmap/global")
async def get_global_heatmap(db: Session = Depends(get_db)):
    """Heatmap globale de toutes les activités"""
    activities = db.query(CyclingActivity).all()
    heatmap = generate_heatmap(activities)
    return {"heatmap": heatmap.to_json()}