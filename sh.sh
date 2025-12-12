#!/bin/bash

# Configuration des couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m'

echo -e "${BLUE}=== Optimisation des Performances & PWA ===${NC}"

# 1. Installation de la PWA (Service Worker + Manifest)
echo -e "${GREEN}[1/4] Installation de @angular/pwa...${NC}"
# Cette commande génère ngsw-config.json, manifest.webmanifest et les icônes
# --skip-confirmation évite de bloquer le script
if [ ! -f "ngsw-config.json" ]; then
    ng add @angular/pwa --project kyranispark --skip-confirmation
else
    echo -e "${YELLOW}PWA déjà configurée (ngsw-config.json détecté).${NC}"
fi

# 2. Code Splitting (Lazy Loading des Routes)
echo -e "${GREEN}[2/4] Activation du Lazy Loading des Routes (app.routes.ts)...${NC}"

# On réécrit le fichier de routes pour utiliser loadComponent()
# Cela crée un fichier JS séparé (chunk) pour chaque page, chargé uniquement quand nécessaire.

cat <<'EOF' > src/app/app.routes.ts
import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';

export const routes: Routes = [
  // --- ROUTES PUBLIQUES (Lazy Loaded) ---
  { 
    path: '', 
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) 
  },
  { 
    path: 'evenements', 
    loadComponent: () => import('./pages/evenements/evenements.component').then(m => m.EvenementsComponent) 
  },
  { 
    path: 'reservations', 
    loadComponent: () => import('./pages/reservations/reservations.component').then(m => m.ReservationsComponent) 
  },
  { 
    path: 'contact', 
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent) 
  },
  { 
    path: 'admin-login', 
    loadComponent: () => import('./pages/admin-login/admin-login.component').then(m => m.AdminLoginComponent) 
  },

  // --- ADMIN ROUTES (Lazy Loaded Children) ---
  { 
    path: 'admin', 
    loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'stats', pathMatch: 'full' },
      { 
        path: 'stats', 
        loadComponent: () => import('./components/admin-dashboard/dashboard-stats/dashboard-stats.component').then(m => m.DashboardStatsComponent) 
      },
      { 
        path: 'events', 
        loadComponent: () => import('./components/admin-dashboard/manage-events/manage-events.component').then(m => m.ManageEventsComponent) 
      },
      { 
        path: 'reservations', 
        loadComponent: () => import('./components/admin-dashboard/manage-reservations/manage-reservations.component').then(m => m.ManageReservationsComponent) 
      },
      { 
        path: 'settings', 
        loadComponent: () => import('./components/admin-dashboard/settings/settings.component').then(m => m.SettingsComponent) 
      }
    ]
  },

  // --- 404 ---
  { path: '**', component: PageNotFoundComponent }
];
EOF

# 3. Image Lazy Loading (Native)
echo -e "${GREEN}[3/4] Ajout de loading='lazy' aux images non critiques...${NC}"

# Fonction pour ajouter loading="lazy" aux balises img qui ne l'ont pas
# Note: On évite le HeroSlider car il doit charger immédiatement (LCP)

# Gallery Component
if [ -f src/app/components/gallery/gallery.component.html ]; then
    sed -i 's/<img /<img loading="lazy" /g' src/app/components/gallery/gallery.component.html
    echo -e "✓ Galerie optimisée."
fi

# Events Component (Grille)
if [ -f src/app/pages/evenements/evenements.component.html ]; then
    # On remplace img [src] par img loading="lazy" [src]
    sed -i 's/<img \[src\]/<img loading="lazy" [src]/g' src/app/pages/evenements/evenements.component.html
    echo -e "✓ Page Événements optimisée."
fi

# 4. Configuration Firebase Hosting (Compression & Caching)
echo -e "${GREEN}[4/4] Configuration Headers Firebase (Cache & Compression)...${NC}"

# Firebase compresse automatiquement en Gzip/Brotli.
# On ajoute ici les règles de cache agressif pour les assets statiques (JS, CSS, Images).

cat <<EOF > firebase.json
{
  "hosting": {
    "public": "dist/kyranispark/browser",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|webp|svg|css|js|woff|woff2)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "sw.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache"
          }
        ]
      }
    ]
  }
}
EOF

echo -e "${BLUE}=== Optimisations terminées ! ===${NC}"
echo -e "${GREEN}1. PWA installée (sw.js généré au build).${NC}"
echo -e "${GREEN}2. Routes lazy-loadées (fichiers JS plus petits au démarrage).${NC}"
echo -e "${GREEN}3. Images secondaires en lazy-load.${NC}"
echo -e "${GREEN}4. Cache Headers configurés pour Firebase.${NC}"
echo -e "${YELLOW}Note : Pour tester la PWA, il faut faire un build de prod et servir le dossier dist (ng serve ne supporte pas bien les Service Workers).${NC}"