#!/bin/bash

echo "=================================================="
echo "  CORRECTION FINALE : FORCE AFFICHAGE BLOC FOOTER"
echo "=================================================="

# 1. FORCE LE STYLE DU COMPOSANT (SCSS)
# C'est souvent l'étape manquante : dire au composant d'être un "bloc"
cat << 'EOF' > ./src/app/components/footer/footer.component.scss
:host {
  display: block;        /* OBLIGATOIRE pour que le footer ait une hauteur */
  width: 100%;           /* Prend toute la largeur */
  position: relative;    /* Permet le z-index */
  z-index: 50;           /* Au-dessus du reste */
  background-color: #111827; /* Gris très foncé (Tailwind gray-900) pour éviter le blanc */
}
EOF

# 2. NETTOYAGE DU HTML
# On simplifie pour être sûr que rien n'empêche le rendu
cat << 'EOF' > ./src/app/components/footer/footer.component.html
<div class="bg-gray-900 text-white w-full border-t border-gray-800">
  
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
      
      <div class="space-y-4">
        <div class="flex items-center space-x-2">
           <span class="text-2xl font-bold tracking-wider text-blue-500">
             {{ (settings?.businessName || 'KYRANIS PARK') | uppercase }}
           </span>
        </div>
        <p class="text-gray-400 text-sm leading-relaxed">
          {{ settings?.homePageDescription || 'Votre évasion au cœur des îles.' }}
        </p>
      </div>

      <div>
        <h3 class="text-lg font-semibold mb-4 text-white uppercase tracking-wider border-b border-gray-700 pb-2 inline-block">Menu</h3>
        <ul class="space-y-3 text-sm">
          <li><a routerLink="/" class="text-gray-400 hover:text-blue-400 no-underline">Accueil</a></li>
          <li><a routerLink="/evenements" class="text-gray-400 hover:text-blue-400 no-underline">Agenda</a></li>
          <li><a routerLink="/reservations" class="text-gray-400 hover:text-blue-400 no-underline">Réserver</a></li>
          <li><a routerLink="/contact" class="text-gray-400 hover:text-blue-400 no-underline">Contact</a></li>
        </ul>
      </div>

      <div>
        <h3 class="text-lg font-semibold mb-4 text-white uppercase tracking-wider border-b border-gray-700 pb-2 inline-block">Infos</h3>
        <ul class="space-y-4 text-sm">
          <li class="flex items-start">
            <span class="text-blue-500 mr-3">📍</span>
            <span class="text-gray-300">{{ settings?.address || 'Zone Touristique' }}</span>
          </li>
          <li class="flex items-center">
            <span class="text-blue-500 mr-3">📞</span>
            <a href="tel:{{ settings?.phone }}" class="text-white font-medium hover:text-blue-400 no-underline">{{ settings?.phone || '--' }}</a>
          </li>
          <li class="flex items-center">
            <span class="text-blue-500 mr-3">✉️</span>
            <a href="mailto:{{ settings?.email }}" class="text-gray-300 hover:text-white no-underline">{{ settings?.email || '--' }}</a>
          </li>
        </ul>
      </div>
    </div>
    
    <div class="mt-12 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
      <p>© {{ currentYear }} {{ settings?.businessName }}. Tous droits réservés.</p>
      <a routerLink="/admin-login" class="mt-2 inline-block hover:text-white">Admin</a>
    </div>
  </div>
</div>
EOF

echo "Terminé. Le style ':host { display: block; }' a été appliqué pour forcer la visibilité."