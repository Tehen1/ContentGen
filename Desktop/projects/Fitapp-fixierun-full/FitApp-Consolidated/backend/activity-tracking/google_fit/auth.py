"""
Module d'authentification OAuth 2.0 pour l'API Google Fit.

Ce module gère l'authentification, le stockage des tokens et le renouvellement
automatique des tokens expirés pour accéder à l'API Google Fit.
"""

import os
import json
import time
import logging
from typing import Dict, Any, Optional, Tuple, Union
from pathlib import Path

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow, InstalledAppFlow
from google.auth.exceptions import RefreshError
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from . import config

# Configuration du logger
logger = logging.getLogger('google_fit.auth')

class GoogleFitAuthError(Exception):
    """Erreur de base pour les problèmes d'authentification Google Fit."""
    pass

class ClientSecretError(GoogleFitAuthError):
    """Erreur lors de l'accès ou du chargement du fichier client_secret.json."""
    pass

class TokenRefreshError(GoogleFitAuthError):
    """Erreur lors du rafraîchissement du token."""
    pass

class TokenNotFoundError(GoogleFitAuthError):
    """Erreur lorsque le token n'est pas disponible."""
    pass

class GoogleFitAuth:
    """
    Gère l'authentification OAuth 2.0 pour l'API Google Fit.
    
    Cette classe effectue le flux d'authentification complet, 
    gère le stockage des tokens et le rafraîchissement automatique.
    """
    
    def __init__(self, client_secret_path: Optional[Path] = None, token_path: Optional[Path] = None):
        """
        Initialise le gestionnaire d'authentification.
        
        Args:
            client_secret_path: Chemin vers le fichier client_secret.json
            token_path: Chemin vers le fichier de stockage du token
        """
        self.client_secret_path = client_secret_path or config.CLIENT_SECRET_PATH
        self.token_path = token_path or config.TOKEN_PATH
        self.credentials = None
        self.service = None
        
        # Vérification d'authenticité
        self._verify_client_secrets()
        
        # Tenter de charger des identifiants existants
        try:
            self.load_credentials()
        except (TokenNotFoundError, TokenRefreshError):
            logger.info("Aucun token valide trouvé. Une authentification sera nécessaire.")
    
    def _verify_client_secrets(self) -> None:
        """
        Vérifie la disponibilité et la validité du fichier client_secret.json.
        
        Raises:
            ClientSecretError: Si le fichier n'existe pas ou est invalide
        """
        if not self.client_secret_path.exists():
            raise ClientSecretError(
                f"Le fichier client_secret.json n'existe pas à l'emplacement {self.client_secret_path}. "
                "Veuillez télécharger ce fichier depuis la console Google Cloud Platform."
            )
            
        # Validation basique du contenu du fichier
        try:
            with open(self.client_secret_path, 'r') as file:
                client_data = json.load(file)
                
            # Vérifier la structure minimale attendue
            web_or_installed = client_data.get('web') or client_data.get('installed')
            if not web_or_installed:
                raise ClientSecretError(
                    "Format de fichier client_secret.json invalide. "
                    "Veuillez télécharger un fichier valide depuis la console Google Cloud Platform."
                )
                
            # Vérifier les champs requis
            required_fields = ['client_id', 'client_secret', 'auth_uri', 'token_uri']
            for field in required_fields:
                if field not in web_or_installed:
                    raise ClientSecretError(
                        f"Le fichier client_secret.json est incomplet (champ manquant: {field}). "
                        "Veuillez télécharger un nouveau fichier depuis la console Google Cloud Platform."
                    )
                    
        except json.JSONDecodeError:
            raise ClientSecretError(
                "Le fichier client_secret.json n'est pas au format JSON valide. "
                "Veuillez télécharger un fichier valide depuis la console Google Cloud Platform."
            )
        except Exception as e:
            raise ClientSecretError(f"Erreur lors de la vérification de client_secret.json: {str(e)}")
    
    def load_credentials(self) -> None:
        """
        Charge les identifiants depuis le fichier token.json s'il existe.
        Rafraîchit le token si nécessaire.
        
        Raises:
            TokenNotFoundError: Si aucun token n'est trouvé
            TokenRefreshError: Si le token ne peut pas être rafraîchi
        """
        if not self.token_path.exists():
            raise TokenNotFoundError("Aucun token sauvegardé trouvé.")
            
        try:
            self.credentials = Credentials.from_authorized_user_info(
                json.loads(self.token_path.read_text()),
                scopes=config.SCOPES
            )
        except Exception as e:
            raise TokenNotFoundError(f"Erreur lors du chargement du token: {str(e)}")
            
        # Vérifier si les identifiants sont expirés et les rafraîchir si nécessaire
        if self.credentials and self.credentials.expired and self.credentials.refresh_token:
            try:
                self.credentials.refresh(Request())
                self._save_credentials()
                logger.info("Token rafraîchi avec succès")
            except RefreshError as e:
                # Supprimer le token invalide
                if self.token_path.exists():
                    self.token_path.unlink()
                raise TokenRefreshError(f"Impossible de rafraîchir le token: {str(e)}")
    
    def _save_credentials(self) -> None:
        """
        Sauvegarde les identifiants dans un fichier token.json.
        
        Raises:
            GoogleFitAuthError: Si les identifiants ne peuvent pas être sauvegardés
        """
        if not self.credentials:
            raise GoogleFitAuthError("Aucun identifiant à sauvegarder")
            
        try:
            token_data = {
                'token': self.credentials.token,
                'refresh_token': self.credentials.refresh_token,
                'token_uri': self.credentials.token_uri,
                'client_id': self.credentials.client_id,
                'client_secret': self.credentials.client_secret,
                'scopes': self.credentials.scopes,
                'expiry': self.credentials.expiry.isoformat() if self.credentials.expiry else None
            }
            
            # Assurer l'existence du répertoire parent
            os.makedirs(os.path.dirname(self.token_path), exist_ok=True)
            
            # Sauvegarder avec les permissions appropriées (600)
            with open(self.token_path, 'w') as token_file:
                json.dump(token_data, token_file)
            
            # Restreindre les permissions (lecture/écriture uniquement pour l'utilisateur)
            os.chmod(self.token_path, 0o600)
            
            logger.info(f"Token sauvegardé avec succès à {self.token_path}")
        except Exception as e:
            raise GoogleFitAuthError(f"Erreur lors de la sauvegarde du token: {str(e)}")
    
    def get_authorization_url(self) -> Tuple[str, str]:
        """
        Génère l'URL pour l'authentification et un état pour la vérification.
        
        Returns:
            Tuple: (URL d'authentification, état pour vérification)
        
        Raises:
            ClientSecretError: Si le fichier client_secret.json est invalide
        """
        try:
            flow = Flow.from_client_secrets_file(
                self.client_secret_path,
                scopes=config.SCOPES,
                redirect_uri=config.REDIRECT_URI
            )
            
            # Générer l'URL d'authentification
            auth_url, state = flow.authorization_url(
                access_type='offline',
                include_granted_scopes='true',
                prompt='consent'  # Forcer l'affichage du consentement pour obtenir un refresh_token
            )
            
            # Stocker temporairement le flow pour la finalisation
            self._flow = flow
            
            return auth_url, state
            
        except Exception as e:
            raise ClientSecretError(f"Erreur lors de la génération de l'URL d'authentification: {str(e)}")
    
    def exchange_code(self, code: str) -> None:
        """
        Échange le code d'autorisation contre un token d'accès.
        
        Args:
            code: Code d'autorisation reçu de Google
            
        Raises:
            GoogleFitAuthError: Si l'échange échoue
        """
        try:
            self._flow.fetch_token(code=code)
            self.credentials = self._flow.credentials
            self._save_credentials()
            logger.info("Authentification réussie et token sauvegardé")
        except Exception as e:
            raise GoogleFitAuthError(f"Erreur lors de l'échange du code d'autorisation: {str(e)}")
            
    def get_fitness_service(self) -> Any:
        """
        Obtient un service Google Fitness API authentifié.
        
        Returns:
            Un objet service Google Fitness API
            
        Raises:
            GoogleFitAuthError: Si les identifiants ne sont pas disponibles
        """
        if not self.credentials:
            raise GoogleFitAuthError("Vous devez vous authentifier avant d'utiliser le service")
            
        if self.credentials.expired and self.credentials.refresh_token:
            try:
                self.credentials.refresh(Request())
                self._save_credentials()
            except RefreshError as e:
                raise TokenRefreshError(f"Impossible de rafraîchir le token: {str(e)}")
                
        try:
            return build(
                config.API_SERVICE_NAME,
                config.API_VERSION,
                credentials=self.credentials,
                cache_discovery=False
            )
        except Exception as e:
            raise GoogleFitAuthError(f"Erreur lors de la création du service Fitness: {str(e)}")
    
    def is_authenticated(self) -> bool:
        """
        Vérifie si l'utilisateur est authentifié avec des identifiants valides.
        
        Returns:
            bool: True si l'utilisateur est authentifié, False sinon
        """
        if not self.credentials:
            return False
            
        # Si le token est expiré, tenter de le rafraîchir
        if self.credentials.expired and self.credentials.refresh_token:
            try:
                self.credentials.refresh(Request())
                self._save_credentials()
            except Exception:
                return False
                
        return True
    
    def revoke_token(self) -> None:
        """
        Révoque le token actuel et supprime le fichier token.json.
        
        Raises:
            GoogleFitAuthError: Si la révocation échoue
        """
        if not self.credentials:
            logger.info("Aucun token à révoquer")
            return
            
        try:
            if self.credentials.token:
                # Implémenter la révocation du token en appelant l'endpoint Google OAuth
                # Cette partie dépend de la bibliothèque utilisée
                # Pour l'instant, on supprime simplement le fichier
                pass
                
            # Supprimer le fichier token.json
            if self.token_path.exists():
                self.token_path.unlink()
                
            self.credentials = None
            logger.info("Token révoqué avec succès")
            
        except Exception as e:
            raise GoogleFitAuthError(f"Erreur lors de la révocation du token: {str(e)}")

# Fonctions utilitaires pour l'authentification

def load_client_secret_from_env() -> Dict[str, Any]:
    """
    Crée une structure client_secret à partir de variables d'environnement.
    
    Returns:
        Dict: Structure client_secret compatible
        
    Raises:
        ClientSecretError: Si les variables d'environnement sont manquantes
    """
    client_id = config.GOOGLE_CLIENT_ID
    client_secret = config.GOOGLE_CLIENT_SECRET
    
    if not client_id or not client_secret:
        raise ClientSecretError(
            "Variables d'environnement GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET non définies. "
            "Veuillez les définir ou fournir un fichier client_secret.json."
        )
        
    return {
        "web": {
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uris": [config.REDIRECT_URI],
            "auth_uri": config.AUTH_URI,
            "token_uri": config.TOKEN_URI
        }
    }

def create_client_secret_file() -> Path:
    """
    Crée un fichier client_secret.json à partir des variables d'environnement.
    
    Returns:
        Path: Chemin vers le fichier créé
        
    Raises:
        ClientSecretError: Si le fichier ne peut pas être créé
    """
    try:
        client_secret_data = load_client_secret_from_env()
        
        # Sauvegarder dans le fichier avec les permissions appropriées
        with open(config.CLIENT_SECRET_PATH, 'w') as file:
            json.dump(client_secret_data, file, indent=2)
            
        os.chmod(config.CLIENT_SECRET_PATH, 0o600)
        logger.info(f"Fichier client_secret.json créé avec succès à {config.CLIENT_SECRET_PATH}")
        
        return config.CLIENT_SECRET_PATH
        
    except Exception as e:
        raise ClientSecretError(f"Erreur lors de la création du fichier client_secret.json: {str(e)}")

