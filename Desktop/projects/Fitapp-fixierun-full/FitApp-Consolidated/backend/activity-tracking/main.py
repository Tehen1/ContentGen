from fastapi import FastAPI, HTTPException, Query, Depends, Response, Request
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import json
import os
from datetime import datetime
from pathlib import Path

from google_fit.auth import GoogleFitAuth, GoogleFitAuthError, ClientSecretError
from google_fit.data_fetcher import DataFetcher, GoogleFitDataError
import google_fit.config as gf_config

app = FastAPI(title="Activity Tracking API", version="1.0.0")

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Dans un environnement de production, spécifiez les domaines autorisés
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# État de l'authentification
auth_state = {}

# Répertoire pour stocker les données
DATA_DIR = Path(gf_config.DATA_DIR)
os.makedirs(DATA_DIR, exist_ok=True)

def get_google_fit_auth():
    """Dépendance pour obtenir une instance authentifiée de GoogleFitAuth."""
    try:
        auth = GoogleFitAuth()
        return auth
    except ClientSecretError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur de configuration OAuth: {str(e)}. Veuillez consulter SETUP_FR.md."
        )
    except GoogleFitAuthError as e:
        raise HTTPException(
            status_code=401,
            detail=f"Erreur d'authentification: {str(e)}"
        )

@app.get("/")
def read_root():
    return {
        "message": "API de suivi d'activité pour FitApp",
        "google_fit": {
            "auth_status": "/google-fit/auth/status",
            "auth_url": "/google-fit/auth/url",
            "data": "/google-fit/data"
        }
    }

@app.get("/google-fit/auth/status")
def check_auth_status(auth: GoogleFitAuth = Depends(get_google_fit_auth)):
    """Vérifie le statut d'authentification Google Fit."""
    return {
        "authenticated": auth.is_authenticated(),
        "auth_url": "/google-fit/auth/url" if not auth.is_authenticated() else None
    }

@app.get("/google-fit/auth/url")
def get_auth_url(request: Request, auth: GoogleFitAuth = Depends(get_google_fit_auth)):
    """Génère l'URL d'authentification Google Fit."""
    try:
        auth_url, state = auth.get_authorization_url()
        # Stocker l'état pour la vérification ultérieure
        auth_state[state] = {"created_at": datetime.now().isoformat()}
        return {"auth_url": auth_url, "state": state}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la génération de l'URL d'authentification: {str(e)}"
        )

@app.get("/google-fit/auth/callback")
def auth_callback(code: str, state: Optional[str] = None, auth: GoogleFitAuth = Depends(get_google_fit_auth)):
    """Callback pour l'authentification OAuth."""
    try:
        # Vérifier l'état si nécessaire
        if state and state not in auth_state:
            raise HTTPException(
                status_code=400,
                detail="État invalide, possible attaque CSRF"
            )
            
        # Échanger le code contre un token
        auth.exchange_code(code)
        
        # Nettoyer l'état
        if state and state in auth_state:
            del auth_state[state]
            
        return {"message": "Authentification réussie!"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de l'authentification: {str(e)}"
        )

@app.get("/google-fit/data")
def get_fitness_data(
    days: Optional[int] = Query(30, ge=1, le=gf_config.MAX_DAYS),
    activity: Optional[str] = None,
    auth: GoogleFitAuth = Depends(get_google_fit_auth)
):
    """Récupère les données Google Fit."""
    try:
        # Vérifier l'authentification
        if not auth.is_authenticated():
            return {
                "authenticated": False,
                "auth_url": "/google-fit/auth/url"
            }
            
        # Récupérer et formater les activités
        activity_types = activity.split(",") if activity else None
        data_fetcher = DataFetcher(auth)
        summary = data_fetcher.get_activity_summary(days=days, activity_types=activity_types)
        
        return summary
    except GoogleFitDataError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Erreur lors de la récupération des données: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur inattendue: {str(e)}"
        )

@app.get("/google-fit/export")
def export_fitness_data(
    days: Optional[int] = Query(30, ge=1, le=gf_config.MAX_DAYS),
    activity: Optional[str] = None,
    auth: GoogleFitAuth = Depends(get_google_fit_auth)
):
    """Exporte les données Google Fit au format JSON."""
    try:
        # Vérifier l'authentification
        if not auth.is_authenticated():
            return {
                "authenticated": False,
                "auth_url": "/google-fit/auth/url"
            }
            
        # Récupérer et formater les activités
        activity_types = activity.split(",") if activity else None
        data_fetcher = DataFetcher(auth)
        summary = data_fetcher.get_activity_summary(days=days, activity_types=activity_types)
        
        # Générer un nom de fichier avec la date actuelle
        date_str = datetime.now().strftime(gf_config.OUTPUT_DATE_FORMAT)
        filename = gf_config.OUTPUT_FILENAME_TEMPLATE.format(date=date_str)
        filepath = DATA_DIR / filename
        
        # Écrire les données dans un fichier JSON
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(summary, f, ensure_ascii=False, indent=2)
            
        return {
            "message": "Données exportées avec succès",
            "filename": filename,
            "download_url": f"/google-fit/download/{filename}"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de l'export des données: {str(e)}"
        )

@app.get("/google-fit/download/{filename}")
def download_fitness_data(filename: str):
    """Télécharge un fichier de données précédemment exporté."""
    try:
        filepath = DATA_DIR / filename
        
        # Vérifier que le fichier existe
        if not filepath.exists():
            raise HTTPException(
                status_code=404,
                detail=f"Fichier non trouvé: {filename}"
            )
            
        # Lire le contenu du fichier
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        return JSONResponse(content=data)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors du téléchargement du fichier: {str(e)}"
        )

@app.delete("/google-fit/auth/revoke")
def revoke_token(auth: GoogleFitAuth = Depends(get_google_fit_auth)):
    """Révoque le token d'authentification Google Fit."""
    try:
        auth.revoke_token()
        return {"message": "Token révoqué avec succès"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la révocation du token: {str(e)}"
        )

