#!/bin/bash

# Arrêter le script dès qu'une erreur survient
set -e

# Configuration
PROJECT_NAME="kyranispark"
DIST_DIR="dist/$PROJECT_NAME"
ENV_PROD="src/environments/environment.prod.ts"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}   DÉMARRAGE DU BUILD DE PRODUCTION      ${NC}"
echo -e "${BLUE}=========================================${NC}"

# 1. Vérification de l'environnement
echo -e "${BLUE}[1/7] Vérification de la configuration...${NC}"
if [ ! -f "$ENV_PROD" ]; then
    echo -e "${RED}ERREUR: Le fichier $ENV_PROD est manquant !${NC}"
    echo -e "${RED}Veuillez exécuter le script de configuration setup_final_config.sh avant de builder.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Environnement de production détecté.${NC}"

# 2. Nettoyage
echo -e "${BLUE}[2/7] Nettoyage du dossier dist...${NC}"
if [ -d "dist" ]; then
    rm -rf dist
    echo -e "${GREEN}✓ Dossier 'dist' supprimé.${NC}"
else
    echo -e "${GREEN}✓ Dossier 'dist' propre.${NC}"
fi

# 3. Installation des dépendances
echo -e "${BLUE}[3/7] Installation des dépendances (Clean Install)...${NC}"
# 'npm ci' est plus rapide et plus sûr pour les builds de prod que 'npm install'
if [ -f "package-lock.json" ]; then
    npm ci --silent
else
    npm install --silent
fi
echo -e "${GREEN}✓ Dépendances installées.${NC}"

# 4. Build Angular
echo -e "${BLUE}[4/7] Compilation Angular (Mode Production)...${NC}"
# La configuration 'production' active la minification et l'optimisation (Terser/Esbuild)
npm run build -- --configuration production

if [ -d "$DIST_DIR/browser" ]; then
    # Angular 17+ avec SSR ou Esbuild crée souvent un sous-dossier 'browser'
    OUTPUT_DIR="$DIST_DIR/browser"
else
    OUTPUT_DIR="$DIST_DIR"
fi

if [ ! -d "$OUTPUT_DIR" ]; then
    echo -e "${RED}ERREUR: Le build a échoué. Le dossier de sortie est introuvable.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Compilation réussie.${NC}"

# 5. Gestion des Assets Spécifiques (Post-Build)
echo -e "${BLUE}[5/7] Copie des fichiers additionnels...${NC}"
# Exemple: Copier un fichier _redirects pour Netlify ou un .htaccess pour Apache
# cp src/_redirects $OUTPUT_DIR/ 2>/dev/null || :
echo -e "${GREEN}✓ Assets traités.${NC}"

# 6. Vérification de la Minification (Sommaire)
echo -e "${BLUE}[6/7] Vérification de l'intégrité...${NC}"
if [ -f "$OUTPUT_DIR/index.html" ]; then
    echo -e "${GREEN}✓ index.html généré.${NC}"
else
    echo -e "${RED}ERREUR: index.html manquant !${NC}"
    exit 1
fi

# 7. Rapport de taille
echo -e "${BLUE}[7/7] Rapport de taille du Build...${NC}"
echo -e "-----------------------------------------"
if [[ "$OSTYPE" == "darwin"* ]]; then
    du -sh "$OUTPUT_DIR"
else
    du -sh "$OUTPUT_DIR"
fi
echo -e "-----------------------------------------"

echo -e "${GREEN}=== BUILD TERMINÉ AVEC SUCCÈS ===${NC}"
echo -e "${BLUE}Les fichiers sont prêts dans : $OUTPUT_DIR${NC}"
