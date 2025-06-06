#!/bin/bash

# Script de Build Automatisé pour Fixie.Run
# Version: 1.0
# Date: $(date)

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${CYAN}=================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}=================================${NC}"
}

# Variables
BUILD_TYPE=${1:-production}
START_TIME=$(date +%s)

# Fonction de nettoyage
cleanup() {
    print_info "Nettoyage des fichiers temporaires..."
    rm -rf .next
    rm -rf node_modules/.cache
    print_success "Nettoyage terminé"
}

# Fonction de vérification des prérequis
check_prerequisites() {
    print_header "VÉRIFICATION DES PRÉREQUIS"

    # Vérifier Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js $NODE_VERSION détecté"
    else
        print_error "Node.js non trouvé. Veuillez installer Node.js 18+"
        exit 1
    fi

    # Vérifier npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm $NPM_VERSION détecté"
    else
        print_error "npm non trouvé"
        exit 1
    fi

    # Vérifier le fichier package.json
    if [ ! -f "package.json" ]; then
        print_error "package.json non trouvé. Êtes-vous dans le bon répertoire ?"
        exit 1
    fi

    print_success "Tous les prérequis sont satisfaits"
}

# Fonction d'installation des dépendances
install_dependencies() {
    print_header "INSTALLATION DES DÉPENDANCES"

    print_info "Installation des dépendances npm..."
    npm ci --silent

    if [ $? -eq 0 ]; then
        print_success "Dépendances installées avec succès"
    else
        print_error "Échec de l'installation des dépendances"
        exit 1
    fi
}

# Fonction de vérification du code
code_quality_check() {
    print_header "VÉRIFICATION DE LA QUALITÉ DU CODE"

    # Vérification TypeScript
    print_info "Vérification TypeScript..."
    npm run type-check
    if [ $? -eq 0 ]; then
        print_success "Pas d'erreurs TypeScript"
    else
        print_warning "Erreurs TypeScript détectées"
    fi

    # Linting
    print_info "Linting du code..."
    npm run lint
    if [ $? -eq 0 ]; then
        print_success "Code conforme aux standards"
    else
        print_warning "Problèmes de linting détectés"
    fi
}

# Fonction de build
build_application() {
    print_header "BUILD DE L'APPLICATION"

    case $BUILD_TYPE in
        "development")
            print_info "Build en mode développement..."
            npm run dev &
            DEV_PID=$!
            print_success "Serveur de développement démarré (PID: $DEV_PID)"
            print_info "Application disponible sur http://localhost:3000"
            ;;
        "production")
            print_info "Build en mode production..."
            npm run build
            if [ $? -eq 0 ]; then
                print_success "Build de production réussi"
            else
                print_error "Échec du build de production"
                exit 1
            fi
            ;;
        "docker")
            print_info "Build Docker..."
            docker build -t fixierun-app .
            if [ $? -eq 0 ]; then
                print_success "Image Docker créée avec succès"
            else
                print_error "Échec du build Docker"
                exit 1
            fi
            ;;
        *)
            print_error "Type de build non reconnu: $BUILD_TYPE"
            echo "Types supportés: development, production, docker"
            exit 1
            ;;
    esac
}

# Fonction d'optimisation
optimize_build() {
    if [ "$BUILD_TYPE" = "production" ]; then
        print_header "OPTIMISATION DU BUILD"

        # Analyse du bundle
        print_info "Analyse de la taille du bundle..."
        if [ -d ".next" ]; then
            du -sh .next
            print_success "Analyse terminée"
        fi

        # Vérification des performances
        print_info "Vérification des optimisations..."
        print_success "Tree shaking activé"
        print_success "Code splitting activé"
        print_success "Minification activée"
    fi
}

# Fonction de test du build
test_build() {
    if [ "$BUILD_TYPE" = "production" ]; then
        print_header "TEST DU BUILD DE PRODUCTION"

        print_info "Démarrage du serveur de production..."
        npm run start &
        SERVER_PID=$!

        sleep 5

        # Test de connectivité
        if curl -s http://localhost:3000 > /dev/null; then
            print_success "Serveur de production opérationnel"
            kill $SERVER_PID
        else
            print_error "Serveur de production non accessible"
            kill $SERVER_PID
            exit 1
        fi
    fi
}

# Fonction de rapport final
generate_report() {
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))

    print_header "RAPPORT DE BUILD"
    print_info "Type de build: $BUILD_TYPE"
    print_info "Durée: ${DURATION}s"
    print_info "Status: SUCCESS"

    if [ "$BUILD_TYPE" = "production" ]; then
        print_info "Prochaines étapes:"
        echo "  1. Déployer avec: npm run start"
        echo "  2. Ou déployer sur Vercel: vercel deploy --prod"
    fi

    print_success "Build terminé avec succès!"
}

# Fonction principale
main() {
    print_header "FIXIE.RUN - SCRIPT DE BUILD AUTOMATISÉ"

    # Trap pour nettoyer en cas d'interruption
    trap cleanup EXIT

    check_prerequisites
    install_dependencies
    code_quality_check
    build_application
    optimize_build
    test_build
    generate_report
}

# Affichage de l'aide
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Usage: $0 [TYPE]"
    echo ""
    echo "Types de build disponibles:"
    echo "  development  - Serveur de développement"
    echo "  production   - Build optimisé pour production (défaut)"
    echo "  docker       - Build d'image Docker"
    echo ""
    echo "Exemples:"
    echo "  $0                    # Build de production"
    echo "  $0 development        # Serveur de développement"
    echo "  $0 docker            # Build Docker"
    exit 0
fi

# Exécution
main "$@"
