# Module d'intégration Google Fit

Ce module permet de récupérer et d'exporter les données d'activité depuis l'API Google Fit.

## Fonctionnalités

- Authentification OAuth 2.0 avec rafraîchissement automatique des tokens
- Récupération flexible des données avec filtrage par date et type d'activité
- Interface en ligne de commande complète
- Traitement des erreurs avec mécanisme de retry et backoff exponentiel
- Export au format JSON structuré

## Installation

```bash
# Installer les dépendances
pip install -r requirements.txt

# S'assurer que les droits d'exécution sont accordés
chmod +x google_fit_data.py
```

## Configuration

Avant de pouvoir utiliser ce module, vous devez configurer l'authentification OAuth 2.0 avec Google. Consultez le fichier [SETUP_FR.md](SETUP_FR.md) pour des instructions détaillées.

En résumé:
1. Créer un projet Google Cloud
2. Activer l'API Google Fit
3. Configurer l'écran de consentement OAuth
4. Créer des identifiants OAuth 2.0
5. Télécharger le fichier `client_secret.json` dans le répertoire `credentials`

## Utilisation

### En ligne de commande

```bash
# Version simple pour récupérer les 30 derniers jours (par défaut)
python -m google_fit_data

# Récupérer les 60 derniers jours
python -m google_fit_data --days 60

# Filtrer par types d'activités spécifiques
python -m google_fit_data --activity running,walking

# Spécifier un répertoire de sortie
python -m google_fit_data --output-dir /chemin/vers/dossier

# Afficher l'aide
python -m google_fit_data --help
```

### En tant que bibliothèque

```python
from google_fit.auth import GoogleFitAuth
from google_fit.data_fetcher import DataFetcher

# Authentification
auth = GoogleFitAuth()

# Récupération des données
data_fetcher = DataFetcher(auth)
data = data_fetcher.get_activity_summary(days=30, activity_types=["running", "walking"])

# Utilisation des données
print(f"Total des pas: {data['totals']['steps']}")
print(f"Total des calories: {data['totals']['calories']}")
```

## Structure du module

- `config.py` : Configuration centralisée (API keys, endpoints, types de données)
- `auth.py` : Gestion de l'authentification OAuth 2.0
- `data_fetcher.py` : Récupération et traitement des données
- `google_fit_data.py` : Script principal avec interface CLI

## Licence

Ce code est fourni dans le cadre du projet FitApp-Consolidated.

