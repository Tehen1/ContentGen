#!/bin/bash

# Script de Backup Complet des Projets FixieRun/FitApp
# Date: $(date '+%Y-%m-%d %H:%M:%S')

set -e  # Exit on error

# Configuration
BACKUP_DIR="../Fitapp-BACKUPS-$(date '+%Y%m%d-%H%M%S')"
SOURCE_DIR="."
LOG_FILE="backup.log"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Début du backup complet des projets FixieRun/FitApp${NC}"
echo "Backup directory: $BACKUP_DIR"
echo "==========================================="

# Créer le répertoire de backup
mkdir -p "$BACKUP_DIR"
echo "$(date): Démarrage du backup" > "$BACKUP_DIR/$LOG_FILE"

# Fonction de logging
log() {
    echo "$(date): $1" >> "$BACKUP_DIR/$LOG_FILE"
    echo -e "$1"
}

# Projets principaux à sauvegarder (selon l'analyse)
PRINCIPAL_PROJECTS=(
    "FitApp-Consolidated"
    "FitApp-zkEVM-Dashboard"
    "fixie-run"
    "fitapppppp"
    "FixieRunMobile"
    "fixierun-dash"
    "fitness-dashboard"
)

# Projets à archiver
ARCHIVE_PROJECTS=(
    "fixierun (3)"
    "fixierun 2"
    "fixierun-integration"
    "fitness-app"
    "fitness-nft-tracker-mvp"
    "v0-fixierun-clone"
    "v0-fixierun-clone-b"
    "fittrack-zkevm"
    "fixie-run-rewards-mobile"
    "myturbofitapp"
    "fitnesstrackingapp "
    "fixierun"
    "Fixie.RUN.last"
    "fitapp_dashtest"
    "fitappblockchain"
    "fixie_run"
    "fixie_run___move_to_earn_fixed_gear_platform_by_devTehen (1)"
    "fixierun-deploy-tool"
    "fixierun-deploy-tool 2"
    "fixedrun"
    "fixie-run-demo"
    "fitapp-project"
    "fixieruntest"
)

# Backup des projets principaux
log "${GREEN}📦 Backup des projets principaux...${NC}"
mkdir -p "$BACKUP_DIR/PRINCIPAL_PROJECTS"

for project in "${PRINCIPAL_PROJECTS[@]}"; do
    if [ -d "$project" ]; then
        log "${BLUE}  → Backup de $project${NC}"
        cp -R "$project" "$BACKUP_DIR/PRINCIPAL_PROJECTS/"
        
        # Créer un résumé du projet
        {
            echo "# Résumé du projet: $project"
            echo "Date backup: $(date)"
            echo "Taille: $(du -sh "$project" | cut -f1)"
            echo ""
            
            # Compter les fichiers par type
            echo "## Statistiques des fichiers:"
            find "$project" -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | wc -l | xargs echo "TypeScript/JavaScript:"
            find "$project" -type f -name "*.py" | wc -l | xargs echo "Python:"
            find "$project" -type f -name "*.sol" | wc -l | xargs echo "Solidity:"
            find "$project" -type f -name "*.md" | wc -l | xargs echo "Documentation:"
            find "$project" -type f -name "package.json" -o -name "requirements.txt" -o -name "pubspec.yaml" | wc -l | xargs echo "Config files:"
            
            echo ""
            echo "## Technologies détectées:"
            [ -f "$project/package.json" ] && echo "- Node.js/npm project"
            [ -f "$project/requirements.txt" ] && echo "- Python project"
            [ -f "$project/pubspec.yaml" ] && echo "- Flutter/Dart project"
            [ -f "$project/hardhat.config.ts" ] || [ -f "$project/hardhat.config.js" ] && echo "- Hardhat (Blockchain)"
            [ -f "$project/next.config.js" ] || [ -f "$project/next.config.mjs" ] && echo "- Next.js"
            [ -f "$project/tsconfig.json" ] && echo "- TypeScript"
            [ -d "$project/contracts" ] && echo "- Smart Contracts"
            
        } > "$BACKUP_DIR/PRINCIPAL_PROJECTS/${project}_SUMMARY.md"
        
        log "    ✅ $project sauvegardé"
    else
        log "    ⚠️  $project non trouvé"
    fi
done

# Backup des projets à archiver
log "${YELLOW}📚 Backup des projets à archiver...${NC}"
mkdir -p "$BACKUP_DIR/ARCHIVE_PROJECTS"

for project in "${ARCHIVE_PROJECTS[@]}"; do
    if [ -d "$project" ]; then
        log "${YELLOW}  → Archive de $project${NC}"
        cp -R "$project" "$BACKUP_DIR/ARCHIVE_PROJECTS/"
        log "    ✅ $project archivé"
    else
        log "    ⚠️  $project non trouvé"
    fi
done

# Backup des fichiers de configuration racine
log "${GREEN}⚙️ Backup des fichiers de configuration...${NC}"
mkdir -p "$BACKUP_DIR/CONFIG"

# Copier les fichiers importants
[ -f "package.json" ] && cp "package.json" "$BACKUP_DIR/CONFIG/"
[ -f "turbo.json" ] && cp "turbo.json" "$BACKUP_DIR/CONFIG/"
[ -f "PLAN_UNIFICATION.md" ] && cp "PLAN_UNIFICATION.md" "$BACKUP_DIR/CONFIG/"
[ -f "ANALYSE_COMPLETE_PROJETS.md" ] && cp "ANALYSE_COMPLETE_PROJETS.md" "$BACKUP_DIR/CONFIG/"
[ -f ".DS_Store" ] && cp ".DS_Store" "$BACKUP_DIR/CONFIG/" 2>/dev/null || true

# Créer un rapport de backup
log "${GREEN}📊 Génération du rapport de backup...${NC}"
{
    echo "# Rapport de Backup FixieRun/FitApp"
    echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "Répertoire source: $(pwd)"
    echo "Répertoire backup: $BACKUP_DIR"
    echo ""
    
    echo "## Projets Principaux Sauvegardés ($(echo "${PRINCIPAL_PROJECTS[@]}" | wc -w | tr -d ' '))"
    for project in "${PRINCIPAL_PROJECTS[@]}"; do
        if [ -d "$project" ]; then
            echo "- ✅ $project ($(du -sh "$project" | cut -f1))"
        else
            echo "- ❌ $project (non trouvé)"
        fi
    done
    
    echo ""
    echo "## Projets Archivés ($(echo "${ARCHIVE_PROJECTS[@]}" | wc -w | tr -d ' '))"
    for project in "${ARCHIVE_PROJECTS[@]}"; do
        if [ -d "$project" ]; then
            echo "- ✅ $project ($(du -sh "$project" | cut -f1))"
        else
            echo "- ❌ $project (non trouvé)"
        fi
    done
    
    echo ""
    echo "## Statistiques Globales"
    echo "- Taille totale du backup: $(du -sh "$BACKUP_DIR" | cut -f1)"
    echo "- Nombre total de fichiers: $(find "$BACKUP_DIR" -type f | wc -l | tr -d ' ')"
    echo "- Nombre total de répertoires: $(find "$BACKUP_DIR" -type d | wc -l | tr -d ' ')"
    
    echo ""
    echo "## Prochaines Étapes Recommandées"
    echo "1. Vérifier l'intégrité du backup"
    echo "2. Créer le monorepo unifié"
    echo "3. Migrer les projets principaux"
    echo "4. Tester la consolidation"
    echo "5. Archiver les projets redondants"
    
} > "$BACKUP_DIR/BACKUP_REPORT.md"

# Créer un fichier de vérification d'intégrité
log "${GREEN}🔒 Génération des checksums...${NC}"
find "$BACKUP_DIR" -type f -exec md5 {} \; > "$BACKUP_DIR/checksums.md5" 2>/dev/null || \
find "$BACKUP_DIR" -type f -exec md5sum {} \; > "$BACKUP_DIR/checksums.md5" 2>/dev/null || \
echo "Checksums non disponibles sur ce système" > "$BACKUP_DIR/checksums.md5"

# Créer un script de restauration
cat > "$BACKUP_DIR/restore.sh" << 'EOF'
#!/bin/bash
# Script de restauration automatique

echo "🔄 Restauration des projets FixieRun/FitApp"
echo "⚠️  Cette opération va écraser les projets existants!"
read -p "Continuer? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Restauration en cours..."
    
    # Restaurer les projets principaux
    if [ -d "PRINCIPAL_PROJECTS" ]; then
        cp -R PRINCIPAL_PROJECTS/* ../
        echo "✅ Projets principaux restaurés"
    fi
    
    # Restaurer la configuration
    if [ -d "CONFIG" ]; then
        cp CONFIG/* ../
        echo "✅ Configuration restaurée"
    fi
    
    echo "✅ Restauration terminée"
else
    echo "❌ Restauration annulée"
fi
EOF

chmod +x "$BACKUP_DIR/restore.sh"

# Résumé final
log "${GREEN}✅ Backup terminé avec succès!${NC}"
log "${BLUE}📍 Emplacement: $BACKUP_DIR${NC}"
log "${BLUE}📊 Taille totale: $(du -sh "$BACKUP_DIR" | cut -f1)${NC}"
log "${BLUE}📋 Rapport: $BACKUP_DIR/BACKUP_REPORT.md${NC}"

echo ""
echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}🎉 BACKUP TERMINÉ AVEC SUCCÈS${NC}"
echo -e "${GREEN}===========================================${NC}"
echo -e "Rapport détaillé disponible dans: ${BLUE}$BACKUP_DIR/BACKUP_REPORT.md${NC}"
echo -e "Pour restaurer: ${YELLOW}cd $BACKUP_DIR && ./restore.sh${NC}"
echo ""

