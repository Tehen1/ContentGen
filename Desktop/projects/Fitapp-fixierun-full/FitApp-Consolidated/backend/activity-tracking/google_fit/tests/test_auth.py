#!/usr/bin/env python3
"""
Tests pour le module d'authentification Google Fit.
"""

import os
import json
import unittest
from unittest.mock import patch, MagicMock, mock_open
from pathlib import Path

import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from auth import (
    GoogleFitAuth, 
    GoogleFitAuthError, 
    ClientSecretError, 
    TokenRefreshError, 
    TokenNotFoundError,
    load_client_secret_from_env,
    create_client_secret_file
)
from config import CLIENT_SECRET_PATH, TOKEN_PATH

class TestGoogleFitAuth(unittest.TestCase):
    """Tests pour la classe GoogleFitAuth."""
    
    def setUp(self):
        """Configuration initiale pour chaque test."""
        # Créer un patch pour Path.exists
        self.exists_patch = patch('pathlib.Path.exists')
        self.mock_exists = self.exists_patch.start()
        
        # Par défaut, aucun fichier n'existe
        self.mock_exists.return_value = False
        
        # Créer un patch pour open
        self.open_patch = patch('builtins.open', new_callable=mock_open)
        self.mock_open = self.open_patch.start()
        
        # Créer un patch pour json.load
        self.json_load_patch = patch('json.load')
        self.mock_json_load = self.json_load_patch.start()
        
        # Configurer le mock de json.load pour renvoyer un objet client_secret valide
        self.mock_json_load.return_value = {
            "web": {
                "client_id": "mock_client_id",
                "client_secret": "mock_client_secret",
                "redirect_uris": ["http://localhost:3000/oauth2callback"],
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token"
            }
        }
        
    def tearDown(self):
        """Nettoyage après chaque test."""
        # Arrêter tous les patches
        self.exists_patch.stop()
        self.open_patch.stop()
        self.json_load_patch.stop()
    
    def test_init_missing_client_secret(self):
        """Teste l'initialisation avec un fichier client_secret manquant."""
        # Configurer mock pour simuler fichier manquant
        self.mock_exists.return_value = False
        
        # Tester que l'exception est levée
        with self.assertRaises(ClientSecretError):
            GoogleFitAuth()
    
    def test_init_invalid_client_secret(self):
        """Teste l'initialisation avec un fichier client_secret invalide."""
        # Configurer mock pour simuler fichier existant mais invalide
        self.mock_exists.return_value = True
        self.mock_json_load.return_value = {"invalid": "format"}
        
        # Tester que l'exception est levée
        with self.assertRaises(ClientSecretError):
            GoogleFitAuth()
    
    @patch('google.oauth2.credentials.Credentials.from_authorized_user_info')
    @patch('pathlib.Path.read_text')
    def test_load_credentials_success(self, mock_read_text, mock_from_authorized_user_info):
        """Teste le chargement réussi des identifiants."""
        # Configurer les mocks
        self.mock_exists.return_value = True
        mock_read_text.return_value = json.dumps({
            "token": "mock_token",
            "refresh_token": "mock_refresh_token",
            "token_uri": "https://oauth2.googleapis.com/token",
            "client_id": "mock_client_id",
            "client_secret": "mock_client_secret",
            "scopes": ["https://www.googleapis.com/auth/fitness.activity.read"]
        })
        
        mock_credentials = MagicMock()
        mock_credentials.expired = False
        mock_from_authorized_user_info.return_value = mock_credentials
        
        # Initialiser l'auth
        auth = GoogleFitAuth()
        
        # Vérifier que les identifiants ont été chargés
        self.assertEqual(auth.credentials, mock_credentials)
    
    @patch('google.oauth2.credentials.Credentials.from_authorized_user_info')
    @patch('pathlib.Path.read_text')
    def test_load_credentials_expired_token(self, mock_read_text, mock_from_authorized_user_info):
        """Teste le rafraîchissement d'un token expiré."""
        # Configurer les mocks
        self.mock_exists.return_value = True
        mock_read_text.return_value = json.dumps({
            "token": "mock_token",
            "refresh_token": "mock_refresh_token",
            "token_uri": "https://oauth2.googleapis.com/token",
            "client_id": "mock_client_id",
            "client_secret": "mock_client_secret",
            "scopes": ["https://www.googleapis.com/auth/fitness.activity.read"]
        })
        
        # Créer un mock de credentials expiré
        mock_credentials = MagicMock()
        mock_credentials.expired = True
        mock_credentials.refresh_token = "mock_refresh_token"
        mock_from_authorized_user_info.return_value = mock_credentials
        
        # Patch Request pour le refresh
        with patch('google.auth.transport.requests.Request') as mock_request:
            # Initialiser l'auth
            auth = GoogleFitAuth()
            
            # Vérifier que refresh() a été appelé
            mock_credentials.refresh.assert_called_once()
    
    def test_token_not_found(self):
        """Teste la levée de l'exception TokenNotFoundError."""
        # Configurer le mock pour simuler un fichier client_secret existant
        self.mock_exists.side_effect = lambda path: str(path) == str(CLIENT_SECRET_PATH)
        
        # Tester que l'exception TokenNotFoundError est levée
        with self.assertRaises(TokenNotFoundError):
            GoogleFitAuth()
    
    @patch('builtins.open', new_callable=mock_open)
    @patch('json.dump')
    @patch('os.chmod')
    def test_save_credentials(self, mock_chmod, mock_json_dump, mock_open):
        """Teste la sauvegarde des identifiants."""
        # Configurer les mocks
        self.mock_exists.return_value = True
        
        # Créer un mock de credentials
        mock_credentials = MagicMock()
        mock_credentials.token = "mock_token"
        mock_credentials.refresh_token = "mock_refresh_token"
        mock_credentials.token_uri = "https://oauth2.googleapis.com/token"
        mock_credentials.client_id = "mock_client_id"
        mock_credentials.client_secret = "mock_client_secret"
        mock_credentials.scopes = ["https://www.googleapis.com/auth/fitness.activity.read"]
        mock_credentials.expiry = None
        
        # Créer une instance d'auth avec les mock credentials
        auth = GoogleFitAuth()
        auth.credentials = mock_credentials
        
        # Appeler la méthode _save_credentials
        auth._save_credentials()
        
        # Vérifier que les bons appels ont été effectués
        mock_open.assert_called_once()
        mock_json_dump.assert_called_once()
        mock_chmod.assert_called_once_with(auth.token_path, 0o600)
    
    @patch('google_auth_oauthlib.flow.Flow.from_client_secrets_file')
    def test_get_authorization_url(self, mock_flow_from_client_secrets):
        """Teste la génération d'URL d'authentification."""
        # Configurer les mocks
        self.mock_exists.return_value = True
        mock_flow = MagicMock()
        mock_flow.authorization_url.return_value = ("mock_auth_url", "mock_state")
        mock_flow_from_client_secrets.return_value = mock_flow
        
        # Initialiser l'auth
        auth = GoogleFitAuth()
        
        # Appeler la méthode get_authorization_url
        auth_url, state = auth.get_authorization_url()
        
        # Vérifier les résultats
        self.assertEqual(auth_url, "mock_auth_url")
        self.assertEqual(state, "mock_state")
        mock_flow.authorization_url.assert_called_once_with(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )
    
    def test_is_authenticated_true(self):
        """Teste la méthode is_authenticated quand authentifié."""
        # Configurer les mocks
        self.mock_exists.return_value = True
        
        # Créer un mock de credentials valide
        mock_credentials = MagicMock()
        mock_credentials.expired = False
        
        # Initialiser l'auth avec le mock
        auth = GoogleFitAuth()
        auth.credentials = mock_credentials
        
        # Vérifier le résultat
        self.assertTrue(auth.is_authenticated())
    
    def test_is_authenticated_false(self):
        """Teste la méthode is_authenticated quand non authentifié."""
        # Configurer les mocks
        self.mock_exists.return_value = True
        
        # Initialiser l'auth sans credentials
        auth = GoogleFitAuth()
        auth.credentials = None
        
        # Vérifier le résultat
        self.assertFalse(auth.is_authenticated())
    
    @patch('pathlib.Path.unlink')
    def test_revoke_token(self, mock_unlink):
        """Teste la révocation du token."""
        # Configurer les mocks
        self.mock_exists.return_value = True
        
        # Créer un mock de credentials
        mock_credentials = MagicMock()
        mock_credentials.token = "mock_token"
        
        # Initialiser l'auth avec le mock
        auth = GoogleFitAuth()
        auth.credentials = mock_credentials
        
        # Appeler la méthode
        auth.revoke_token()
        
        # Vérifier que le fichier token a été supprimé
        mock_unlink.assert_called_once()
        
        # Vérifier que les credentials ont été réinitialisés
        self.assertIsNone(auth.credentials)
    
    @patch('google_auth_oauthlib.flow.Flow.fetch_token')
    def test_exchange_code(self, mock_fetch_token):
        """Teste l'échange de code d'autorisation."""
        # Configurer les mocks
        self.mock_exists.return_value = True
        
        # Créer un mock pour le flow
        mock_flow = MagicMock()
        mock_flow.credentials = MagicMock()
        
        # Initialiser l'auth
        auth = GoogleFitAuth()
        auth._flow = mock_flow
        
        # Patch _save_credentials pour éviter les effets secondaires
        with patch.object(auth, '_save_credentials') as mock_save:
            # Appeler la méthode
            auth.exchange_code("mock_auth_code")
            
            # Vérifier que fetch_token a été appelé avec le bon code
            mock_flow.fetch_token.assert_called_once_with(code="mock_auth_code")
            
            # Vérifier que les credentials ont été mis à jour
            self.assertEqual(auth.credentials, mock_flow.credentials)
            
            # Vérifier que les credentials ont été sauvegardés
            mock_save.assert_called_once()

class TestUtilityFunctions(unittest.TestCase):
    """Tests pour les fonctions utilitaires."""
    
    @patch('os.getenv')
    def test_load_client_secret_from_env(self, mock_getenv):
        """Teste le chargement des secrets depuis les variables d'environnement."""
        # Configurer les mocks
        mock_getenv.side_effect = lambda key, default: {
            "GOOGLE_CLIENT_ID": "mock_client_id",
            "GOOGLE_CLIENT_SECRET": "mock_client_secret"
        }.get(key, default)
        
        # Appeler la fonction
        result = load_client_secret_from_env()
        
        # Vérifier le résultat
        self.assertEqual(result["web"]["client_id"], "mock_client_id")
        self.assertEqual(result["web"]["client_secret"], "mock_client_secret")
    
    @patch('os.getenv')
    def test_load_client_secret_from_env_missing(self, mock_getenv):
        """Teste la levée d'une exception quand les variables d'environnement sont manquantes."""
        # Configurer les mocks pour renvoyer des valeurs vides
        mock_getenv.return_value = ""
        
        # Vérifier que l'exception est levée
        with self.assertRaises(ClientSecretError):
            load_client_secret_from_env()
    
    @patch('builtins.open', new_callable=mock_open)
    @patch('json.dump')
    @patch('os.chmod')
    @patch('os.getenv')
    def test_create_client_secret_file(self, mock_getenv, mock_chmod, mock_json_dump, mock_open):
        """Teste la création du fichier client_secret.json."""
        # Configurer les mocks
        mock_getenv.side_effect = lambda key, default: {
            "GOOGLE_CLIENT_ID": "mock_client_id",
            "GOOGLE_CLIENT_SECRET": "mock_client_secret"
        }.get(key, default)
        
        # Appeler la fonction
        result = create_client_secret_file()
        
        # Vérifier les résultats
        mock_open.assert_called_once()
        mock_json_dump.assert_called_once()
        mock_chmod.assert_called_once_with(CLIENT_SECRET_PATH, 0o600)
        self.assertEqual(result, CLIENT_SECRET_PATH)

if __name__ == "__main__":
    unittest.main()

#!/usr/bin/env python3
"""
Tests pour le module d'authentification Google Fit.
"""

import os
import json
import unittest
from unittest.mock import patch, MagicMock, mock_open
from pathlib import Path

import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from auth import (
    GoogleFitAuth, 
    GoogleFitAuthError, 
    ClientSecretError, 
    TokenRefreshError, 
    TokenNotFoundError,
    load_client_secret_from_env,
    create_client_secret_file
)
from config import CLIENT_SECRET_PATH, TOKEN_PATH

class TestGoogleFitAuth(unittest.TestCase):
    """Tests pour la classe GoogleFitAuth."""
    
    def setUp(self):
        """Configuration initiale pour chaque test."""
        # Créer un patch pour Path.exists
        self.exists_patch = patch('pathlib.Path.exists')
        self.mock_exists = self.exists_patch.start()
        
        # Par défaut, aucun fichier n'existe
        self.mock_exists.return_value = False
        
        # Créer un patch pour open
        self.open_patch = patch('builtins.open', new_callable=mock_open)
        self.mock_open = self.open_patch.start()
        
        # Créer un patch pour json.load
        self.json_load_patch = patch('json.load')
        self.mock_json_load = self.json_load_patch.start()
        
        # Configurer le mock de json.load pour renvoyer un objet client_secret valide
        self.mock_json_load.return_value = {
            "web": {
                "client_id": "mock_client_id",
                "client_secret": "mock_client_secret",
                "redirect_uris": ["http://localhost:3000/oauth2callback"],
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token"
            }
        }
        
    def tearDown(self):
        """Nettoyage après chaque test."""
        # Arrêter tous les patches
        self.exists_patch.stop()
        self.open_patch.stop()
        self.json_load_patch.stop()
    
    def test_init_missing_client_secret(self):
        """Teste l'initialisation avec un fichier client_secret manquant."""
        # Configurer mock pour simuler fichier manquant
        self.mock_exists.return_value = False
        
        # Tester que l'exception est levée
        with self.assertRaises(ClientSecretError):
            GoogleFitAuth()
    
    def test_init_invalid_client_secret(self):
        """Teste l'initialisation avec un fichier client_secret invalide."""
        # Configurer mock pour simuler fichier existant mais invalide
        self.mock_exists.return_value = True
        self.mock_json_load.return_value = {"invalid": "format"}
        
        # Tester que l'exception est levée
        with self.assertRaises(ClientSecretError):
            GoogleFitAuth()
    
    @patch('google.oauth2.credentials.Credentials.from_authorized_user_info')
    @patch('pathlib.Path.read_text')
    def test_load_credentials_success(self, mock_read_text, mock_from_authorized_user_info):
        """Teste le chargement réussi des identifiants."""
        # Configurer les mocks
        self.mock_exists.return_value = True
        mock_read_text.return_value = json.dumps({
            "token": "mock_token",
            "refresh_token": "mock_refresh_token",
            "token_uri": "https://oauth2.googleapis.com/token",
            "client_id": "mock_client_id",
            "client_secret": "mock_client_secret",
            "scopes": ["https://www.googleapis.com/auth/fitness.activity.read"]
        })
        
        mock_credentials = MagicMock()
        mock_credentials.expired = False
        mock_from_authorized_user_info.return_value = mock_credentials
        
        # Initialiser l'auth
        auth = GoogleFitAuth()
        
        # Vérifier que les identifiants ont été chargés
        self.assertEqual(auth.credentials, mock_credentials)
    
    @patch('google.oauth2.credentials.Credentials.from_authorized_user_info')
    @patch('pathlib.Path.read_text')
    def test_load_credentials_expired_token(self, mock_read_text, mock_from_authorized_user_info):
        """Teste le rafraîchissement d'un token expiré."""
        # Configurer les mocks
        self.mock_exists.return_value = True
        mock_read_text.return_value = json.dumps({
            "token": "mock_token",
            "refresh_token": "mock_refresh_token",
            "token_uri": "https://oauth2.googleapis.com/token",
            "client_id": "mock_client_id",
            "client_secret": "mock_client_secret",
            "scopes": ["https://www.googleapis.com/auth/fitness.activity.read"]
        })
        
        # Créer un mock de credentials expiré
        mock_credentials = MagicMock()
        mock_credentials.expired = True
        mock_credentials.refresh_token = "mock_refresh_token"
        mock_from_authorized_user_info.return_value = mock_credentials
        
        # Patch Request pour le refresh
        with patch('google.auth.transport.requests.Request') as mock_request:
            # Initialiser l'auth
            auth = GoogleFitAuth()
            
            # Vérifier que refresh() a été appelé
            mock_credentials.refresh.assert_called_once()
    
    def test_token_not_found(self):
        """Teste la levée de l'exception TokenNotFoundError."""
        # Configurer le mock pour simuler un fichier client_secret existant
        self.mock_exists.side_effect = lambda path: str(path) == str(CLIENT_SECRET_PATH)
        
        # Tester que l'exception TokenNotFoundError est levée
        with self.assertRaises(TokenNotFoundError):
            GoogleFitAuth()
    
    @patch('builtins.open', new_callable=mock_open)
    @patch('json.dump')
    @patch('os.chmod')
    def test_save_credentials(self, mock_chmod, mock_json_dump, mock_open):
        """Teste la sauvegarde des identifiants."""
        # Configurer les mocks
        self.mock_exists.return_value = True
        
        # Créer un mock de credentials
        mock_credentials = MagicMock()
        mock_credentials.token = "mock_token"
        mock_credentials.refresh_token = "mock_refresh_token"
        mock_credentials.token_uri = "https://oauth2.googleapis.com/token"
        mock_credentials.client_id = "mock_client_id"
        mock_credentials.client_secret = "mock_client_secret"
        mock_credentials.scopes = ["https://www.googleapis.com/auth/fitness.activity.read"]
        mock_credentials.expiry = None
        
        # Créer une instance d'auth avec les mock credentials
        auth = GoogleFitAuth()
        auth.credentials = mock_credentials
        
        # Appeler la méthode _save_credentials
        auth._save_credentials()
        
        # Vérifier que les bons appels ont été effectués
        mock_open.assert_called_once()
        mock_json_dump.assert_called_once()
        mock_chmod.assert_called_once_with(auth.token_path, 0o600)
    
    @patch('google_auth_oauthlib.flow.Flow.from_client_secrets_file')
    def test_get_authorization_url(self, mock_flow_from_client_secrets):
        """Teste la génération d'URL d'authentification."""
        # Configurer les mocks
        self.mock_exists.return_value = True
        mock_flow = MagicMock()
        mock_flow.authorization_url.return_value = ("mock_auth_url", "mock_state")
        mock_flow_from_client_secrets.return_value = mock_flow
        
        # Initialiser l'auth
        auth = GoogleFitAuth()
        
        # Appeler la méthode get_authorization_url
        auth_url, state = auth.get_authorization_url()
        
        # Vérifier les résultats
        self.assertEqual(auth_url, "mock_auth_url")
        self.assertEqual(state, "mock_state")
        mock_flow.authorization_url.assert_called_once_with(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )
    
    def test_is_authenticated_true(self):
        """Teste la méthode is_authenticated quand authentifié."""
        # Configurer les mocks
        self.mock_exists.return_value = True
        
        # Créer un mock de credentials valide
        mock_credentials = MagicMock()
        mock_credentials.expired = False
        
        # Initialiser l'auth avec le mock
        auth = GoogleFitAuth()
        auth.credentials = mock_credentials
        
        # Vérifier le résultat
        self.assertTrue(auth.is_authenticated())
    
    def test_is_authenticated_false(self):
        """Teste la méthode is_authenticated quand non authentifié."""
        # Configurer les mocks
        self.mock_exists.return_value = True
        
        # Initialiser l'auth sans credentials
        auth = GoogleFitAuth()
        auth.credentials = None
        
        # Vérifier le résultat
        self.assertFalse(auth.is_authenticated())

class TestUtilityFunctions(unittest.TestCase):
    """Tests pour les fonctions utilitaires."""
    
    @patch('os.getenv')
    def test_load_client_secret_from_env(self, mock_getenv):
        """Teste le chargement des secrets depuis les variables d'environnement."""
        # Configurer les mocks
        mock_getenv.side_effect = lambda key, default: {
            "GOOGLE_CLIENT_ID": "mock_client_id",
            "GOOGLE_CLIENT_SECRET": "mock_client_secret"
        }.get(key, default)
        
        # Appeler la fonction
        result = load_client_secret_from_env()
        
        # Vérifier le résultat
        self.assertEqual(result["web"]["client_id"], "mock_client_id")
        self.assertEqual(result["web"]["client_secret"], "mock_client_secret")
    
    @patch('os.getenv')
    def test_load_client_secret_from_env_missing(self, mock_getenv):
        """Teste la levée d'une exception quand les variables d'environnement sont manquantes."""
        # Configurer les mocks pour renvoyer des valeurs vides
        mock_getenv.return_value = ""
        
        # Vérifier que l'exception est levée
        with self.assertRaises(ClientSecretError):
            load_client_secret_from_env()
    
    @patch('builtins.open', new_callable=mock_open)
    @patch('json.dump')
    @patch('os.chmod')
    @patch('os.getenv')
    def test_create_client_secret_file(self, mock_getenv, mock_chmod, mock_json_dump, mock_open):
        """Teste la création du fichier client_secret.json."""
        # Configurer les mocks
        mock_getenv.side_effect = lambda key, default: {
            "GOOGLE_CLIENT_ID": "mock_client_id",
            "GOOGLE_CLIENT_SECRET": "mock_client_secret"
        }.get(key, default)
        
        # Appeler la fonction
        result = create_client_secret_file()
        
        # Vérifier les résultats
        mock_open.assert_called_once()
        mock_json_dump.assert_called_once()
        mock_chmod.assert_called_once_with(CLIENT_SECRET_PATH, 0o600)
        self.assertEqual(result, CLIENT_SECRET_PATH)

if __name__ == "__main__":
    unittest.main()

