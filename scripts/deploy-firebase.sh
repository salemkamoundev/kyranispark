#!/bin/bash

# Arrêt en cas d'erreur
set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}   DÉPLOIEMENT FIREBASE HOSTING          ${NC}"
echo -e "${BLUE}=========================================${NC}"

# 1. Vérification / Installation de Firebase Tools
echo -e "${BLUE}[1/4] Vérification de Firebase CLI...${NC}"
if ! command -v firebase &> /dev/null; then
    echo -e "${YELLOW}Firebase CLI non trouvé. Installation globale...${NC}"
    npm install -g firebase-tools
else
    echo -e "${GREEN}✓ Firebase CLI est installé.${NC}"
fi

# 2. Vérification de l'authentification
# On essaie de lister les projets pour voir si on est connecté
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}Vous n'êtes pas connecté à Firebase.${NC}"
    echo -e "Veuillez vous connecter :"
    firebase login
fi

# 3. Build du projet (Appel du script de build précédent)
echo -e "${BLUE}[2/4] Construction de l'application (Build)...${NC}"
if [ -f "./scripts/build.sh" ]; then
    ./scripts/build.sh
else
    echo -e "${YELLOW}Script de build custom non trouvé, utilisation de ng build standard...${NC}"
    ng build --configuration production
fi

# 4. Déploiement
echo -e "${BLUE}[3/4] Envoi vers Firebase Hosting...${NC}"

# Déploiement uniquement du hosting pour ne pas toucher aux Functions/Firestore si non configurés
firebase deploy --only hosting

echo -e "${BLUE}[4/4] Finalisation...${NC}"
echo -e "${GREEN}=== DÉPLOIEMENT TERMINÉ AVEC SUCCÈS ===${NC}"
echo -e "${BLUE}Votre application devrait être accessible sur l'URL affichée ci-dessus.${NC}"
