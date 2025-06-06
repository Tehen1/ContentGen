#!/bin/bash

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Fonction pour afficher un titre
print_title() {
  echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${CYAN}$1${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Fonction pour afficher un succès
print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Fonction pour afficher une erreur
print_error() {
  echo -e "${RED}✗ $1${NC}"
}

# Fonction pour afficher un avertissement
print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

# Fonction pour afficher une étape
print_step() {
  echo -e "${YELLOW}➤ $1${NC}"
}

# Vérifier si Node.js est installé
check_node() {
  print_step "Vérification de Node.js..."
  if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js $NODE_VERSION est installé"
    return 0
  else
    print_error "Node.js n'est pas installé. Veuillez installer Node.js 18+ avant de continuer."
    return 1
  fi
}

# Vérifier si npm est installé
check_npm() {
  print_step "Vérification de npm..."
  if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm $NPM_VERSION est installé"
    return 0
  else
    print_error "npm n'est pas installé. Veuillez installer npm avant de continuer."
    return 1
  fi
}

# Installer les dépendances
install_dependencies() {
  print_step "Installation des dépendances..."
  npm install
  if [ $? -eq 0 ]; then
    print_success "Dépendances installées avec succès"
    return 0
  else
    print_error "Échec de l'installation des dépendances"
    return 1
  fi
}

# Créer les composants UI manquants
create_missing_components() {
  print_step "Création des composants UI manquants..."
  if [ -f "scripts/fix-missing-components.ts" ]; then
    npx tsx scripts/fix-missing-components.ts
    print_success "Composants UI manquants créés avec succès"
    return 0
  else
    print_warning "Le script de création des composants manquants n'existe pas"
    return 1
  fi
}

# Vérifier l'installation
verify_installation() {
  print_step "Vérification de l'installation..."
  if [ -f "scripts/verify-installation.js" ]; then
    node scripts/verify-installation.js
    return 0
  else
    print_warning "Le script de vérification n'existe pas"
    return 1
  fi
}

# Fonction principale
main() {
  print_title "INSTALLATION DE FIXIE.RUN"

  # Vérifier les prérequis
  check_node
  NODE_RESULT=$?
  check_npm
  NPM_RESULT=$?

  if [ $NODE_RESULT -ne 0 ] || [ $NPM_RESULT -ne 0 ]; then
    print_error "Veuillez installer les prérequis avant de continuer."
    exit 1
  fi

  # Installer les dépendances
  install_dependencies

  # Créer les composants UI manquants
  create_missing_components

  # Vérifier l'installation
  verify_installation

  print_title "INSTALLATION TERMINÉE"
  echo -e "${BLUE}Vous pouvez maintenant démarrer l'application avec la commande:${NC}"
  echo -e "${GREEN}  npm run dev${NC}"
  echo -e "${BLUE}Puis ouvrez http://localhost:3000 dans votre navigateur${NC}"
}

# Exécuter la fonction principale
# Script d'installation pour Fixie.Run
echo "🚀 Installation de Fixie.Run..."

# Installer les dépendances npm
echo "📦 Installation des dépendances npm..."
npm install

# Exécuter le script de vérification
echo "🔍 Vérification de l'installation..."
npx tsx scripts/verify-installation.ts

# Créer les composants manquants si nécessaire
echo "🔧 Création des composants manquants..."
npx tsx scripts/fix-missing-components.ts

echo "🎉 Installation terminée!"
echo "📝 Prochaines étapes:"
echo "1. Exécutez 'npm run dev' pour démarrer l'application"
echo "2. Exécutez 'npm run verify' pour vérifier l'installation"

#main
