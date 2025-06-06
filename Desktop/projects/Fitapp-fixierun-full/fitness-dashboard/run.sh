#!/bin/bash

# Assurer que le script échoue si une commande échoue
set -e

# Créer le dossier de configuration s'il n'existe pas
mkdir -p .streamlit

# Créer le fichier de configuration Streamlit s'il n'existe pas
if [ ! -f .streamlit/config.toml ]; then
cat > .streamlit/config.toml << EOL
[server]
# Si derrière un proxy comme Nginx ou Traefik
headless = true
port = 8501

[browser]
# Ne pas ouvrir automatiquement le navigateur
serverAddress = "0.0.0.0"

[theme]
primaryColor = "#5B9BD5"
backgroundColor = "#FFFFFF"
secondaryBackgroundColor = "#F5F5F5"
textColor = "#262730"
EOL
fi

# Vérifier que le fichier principal existe
if [ ! -f streamlit_app.py ]; then
echo "Erreur: Le fichier streamlit_app.py n'existe pas"
exit 1
fi

# Vérifier si l'environnement virtuel existe, sinon le créer
if [ ! -d "venv" ]; then
  echo "Création de l'environnement virtuel..."
  python3 -m venv venv
  
  echo "Installation des dépendances..."
  source venv/bin/activate
  pip install -r requirements.txt
else
  echo "Environnement virtuel trouvé."
fi

# Activer l'environnement virtuel
echo "Activation de l'environnement virtuel..."
source venv/bin/activate

# Lancer l'application
echo "Démarrage de l'application Streamlit..."

# Fonction pour capturer les signaux et assurer un arrêt propre
handle_signal() {
  echo "Signal reçu. Arrêt gracieux en cours..."
  kill -TERM $STREAMLIT_PID 2>/dev/null
  exit 0
}

# Configuration du piège à signaux
trap handle_signal SIGINT SIGTERM

# Fonction pour démarrer l'application avec gestion d'erreurs
start_streamlit() {
  echo "Lancement de Streamlit $(date '+%Y-%m-%d %H:%M:%S')"
  streamlit run streamlit_app.py --server.address 0.0.0.0 --server.port 8501 &
  STREAMLIT_PID=$!
  wait $STREAMLIT_PID
  local exit_status=$?
  
  if [ $exit_status -ne 0 ]; then
    echo "⚠️ L'application s'est arrêtée avec le code d'erreur $exit_status à $(date '+%Y-%m-%d %H:%M:%S')"
    if [ $exit_status -eq 143 ]; then
      echo "Arrêt normal détecté (SIGTERM)"
      return 0
    fi
    return 1
  fi
  
  return 0
}

# Nombre maximal de redémarrages
MAX_RESTARTS=10
restart_count=0

# Boucle de redémarrage automatique
while [ $restart_count -lt $MAX_RESTARTS ]; do
  if start_streamlit; then
    echo "Application arrêtée normalement."
    break
  else
    restart_count=$((restart_count + 1))
    echo "Tentative de redémarrage $restart_count sur $MAX_RESTARTS..."
    
    # Pause avant redémarrage (augmente progressivement)
    sleep_time=$((5 + restart_count))
    echo "Redémarrage dans $sleep_time secondes..."
    sleep $sleep_time
  fi
done

if [ $restart_count -eq $MAX_RESTARTS ]; then
  echo "⚠️ Nombre maximal de redémarrages atteint ($MAX_RESTARTS). Arrêt du script."
  exit 1
fi
