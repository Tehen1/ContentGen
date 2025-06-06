#!/bin/bash

# Script de déploiement sécurisé pour la base de données Fixie.Run
# Usage: ./deploy-database.sh [development|staging|production]

set -euo pipefail

# Configuration
ENVIRONMENT=${1:-development}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MIGRATIONS_DIR="$PROJECT_ROOT/database/migrations"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction de log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Vérifier l'environnement
case $ENVIRONMENT in
    development|staging|production)
        log "Déploiement pour l'environnement: $ENVIRONMENT"
        ;;
    *)
        error "Environnement invalide: $ENVIRONMENT. Utilisez: development, staging ou production"
        ;;
esac

# Charger les variables d'environnement
ENV_FILE="$PROJECT_ROOT/.env.$ENVIRONMENT"
if [ ! -f "$ENV_FILE" ]; then
    error "Fichier d'environnement non trouvé: $ENV_FILE"
fi

# Exporter les variables d'environnement
export $(cat "$ENV_FILE" | grep -v '^#' | xargs)

# Vérifier la connexion à la base de données
log "Vérification de la connexion à la base de données..."
psql "$DATABASE_URL" -c "SELECT version();" > /dev/null || error "Impossible de se connecter à la base de données"

# Créer une sauvegarde avant le déploiement
if [ "$ENVIRONMENT" = "production" ]; then
    log "Création d'une sauvegarde de la base de données..."
    BACKUP_FILE="backup_$(date +'%Y%m%d_%H%M%S').sql"
    pg_dump "$DATABASE_URL" > "$PROJECT_ROOT/backups/$BACKUP_FILE"
    log "Sauvegarde créée: $BACKUP_FILE"
fi

# Fonction pour exécuter une migration
run_migration() {
    local migration_file=$1
    local migration_name=$(basename "$migration_file")
    
    log "Exécution de la migration: $migration_name"
    
    # Vérifier si la migration a déjà été exécutée
    MIGRATION_EXISTS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM migrations WHERE name = '$migration_name';" 2>/dev/null || echo "0")
    
    if [ "$MIGRATION_EXISTS" -gt 0 ]; then
        warning "Migration déjà exécutée: $migration_name"
        return
    fi
    
    # Exécuter la migration dans une transaction
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 --single-transaction -f "$migration_file" || error "Échec de la migration: $migration_name"
    
    # Enregistrer la migration
    psql "$DATABASE_URL" -c "INSERT INTO migrations (name, executed_at) VALUES ('$migration_name', CURRENT_TIMESTAMP);"
    
    log "Migration réussie: $migration_name"
}

# Créer la table des migrations si elle n'existe pas
log "Création de la table des migrations..."
psql "$DATABASE_URL" <<EOF
CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
EOF

# Exécuter les migrations
log "Exécution des migrations..."
for migration in "$MIGRATIONS_DIR"/*.sql; do
    if [ -f "$migration" ]; then
        run_migration "$migration"
    fi
done

# Configurer les paramètres de sécurité pour la production
if [ "$ENVIRONMENT" = "production" ]; then
    log "Configuration des paramètres de sécurité..."
    psql "$DATABASE_URL" <<EOF
-- Configurer les timeouts
ALTER DATABASE ${PGDATABASE} SET statement_timeout = '30s';
ALTER DATABASE ${PGDATABASE} SET idle_in_transaction_session_timeout = '5min';

-- Configurer les connexions
ALTER DATABASE ${PGDATABASE} SET max_connections = 100;

-- Activer les logs pour la sécurité
ALTER DATABASE ${PGDATABASE} SET log_statement = 'mod';
ALTER DATABASE ${PGDATABASE} SET log_connections = on;
ALTER DATABASE ${PGDATABASE} SET log_disconnections = on;

-- Optimisations de performance
ALTER DATABASE ${PGDATABASE} SET random_page_cost = 1.1;
ALTER DATABASE ${PGDATABASE} SET effective_cache_size = '3GB';
ALTER DATABASE ${PGDATABASE} SET shared_buffers = '1GB';
EOF
fi

# Rafraîchir les vues matérialisées
log "Rafraîchissement des vues matérialisées..."
psql "$DATABASE_URL" <<EOF
REFRESH MATERIALIZED VIEW CONCURRENTLY user_leaderboard;
REFRESH MATERIALIZED VIEW CONCURRENTLY challenge_stats;
EOF

# Analyser les tables pour optimiser les performances
log "Analyse des tables..."
psql "$DATABASE_URL" -c "ANALYZE;"

# Vérifier l'intégrité des données
log "Vérification de l'intégrité des données..."
INTEGRITY_CHECK=$(psql "$DATABASE_URL" -t -c "
    SELECT COUNT(*) FROM (
        -- Vérifier les activités orphelines
        SELECT 1 FROM cycling_activities ca
        LEFT JOIN users u ON ca.user_id = u.id
        WHERE u.id IS NULL
        
        UNION ALL
        
        -- Vérifier les récompenses orphelines
        SELECT 1 FROM rewards r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE u.id IS NULL
    ) AS integrity_issues;
")

if [ "$INTEGRITY_CHECK" -gt 0 ]; then
    warning "Problèmes d'intégrité détectés: $INTEGRITY_CHECK"
fi

# Créer un rapport de déploiement
REPORT_FILE="$PROJECT_ROOT/deployment_reports/deploy_${ENVIRONMENT}_$(date +'%Y%m%d_%H%M%S').txt"
mkdir -p "$PROJECT_ROOT/deployment_reports"

cat > "$REPORT_FILE" <<EOF
Rapport de Déploiement - Fixie.Run Database
==========================================
Environnement: $ENVIRONMENT
Date: $(date)
Version de PostgreSQL: $(psql "$DATABASE_URL" -t -c "SELECT version();")

Statistiques:
- Nombre d'utilisateurs: $(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM users;")
- Nombre d'activités: $(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM cycling_activities;")
- Nombre de vélos NFT: $(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM nft_bikes;")
- Nombre de défis actifs: $(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM challenges WHERE is_active = TRUE;")

Migrations exécutées:
$(psql "$DATABASE_URL" -t -c "SELECT name, executed_at FROM migrations ORDER BY executed_at;")

Problèmes d'intégrité: $INTEGRITY_CHECK
EOF

log "Rapport de déploiement créé: $REPORT_FILE"

# Notification de succès
if [ "$ENVIRONMENT" = "production" ]; then
    # Envoyer une notification (webhook, email, etc.)
    log "Envoi de la notification de déploiement..."
    # curl -X POST $WEBHOOK_URL -d "Déploiement réussi sur $ENVIRONMENT"
fi

log "✅ Déploiement terminé avec succès!"
