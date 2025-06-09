#!/bin/bash
# Script d'installation pour Domain Hunter Pro

echo "========================================"
echo "📦 Installation de Domain Hunter Pro"
echo "========================================"

# Vérification de Python
echo "🔍 Vérification de Python..."
if command -v python3 &>/dev/null; then
    echo "✅ Python trouvé!"
    python3 --version
else
    echo "❌ Python 3 non trouvé. Veuillez l'installer."
    exit 1
fi

# Vérification et installation de pip si nécessaire
echo "🔍 Vérification de pip..."
if ! command -v pip3 &>/dev/null; then
    echo "📥 Installation de pip..."
    curl https://bootstrap.pypa.io/get-pip.py | python3
fi

# Création d'un environnement virtuel
echo "🔧 Création d'un environnement virtuel..."
python3 -m venv venv
source venv/bin/activate

# Installation des dépendances
echo "📚 Installation des dépendances..."
pip install requests schedule

# Configuration des scripts
echo "⚙️ Configuration des scripts..."
chmod +x quickstart.py
chmod +x domain_hunter.py

# Création des dossiers nécessaires
echo "📁 Création des dossiers de travail..."
mkdir -p rapports
mkdir -p analyses
mkdir -p logs

# Test de connexion API
echo "🧪 Test de connexion API..."
python3 -c "
import requests
try:
    response = requests.get('https://api.perplexity.ai', timeout=5)
    print('✅ Connexion API réussie')
except:
    print('⚠️  Vérifiez votre connexion internet')
"

echo "🚀 Installation terminée!"
echo "========================================"
echo "Pour commencer :"
echo "1. Activez l'environnement: source venv/bin/activate"
echo "2. Démarrage rapide: python3 quickstart.py"
echo "3. Version complète: python3 domain_hunter.py --once"
echo "4. Mode automatique: python3 domain_hunter.py --scheduler"
echo "5. Interface web: ouvrez index.html dans votre navigateur"
echo "========================================"
echo "📖 Pour plus d'aide, consultez la documentation intégrée"
echo "🔧 Configuration API dans quickstart.py si nécessaire"

