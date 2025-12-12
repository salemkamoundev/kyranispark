import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

// Import des routes
import { routes } from './app.routes';

// Import Environment
import { environment } from '../environments/environment';

// Imports Firebase
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    // Optimisation Angular 18
    provideZoneChangeDetection({ eventCoalescing: true }),
    
    // Router avec fonctionnalités modernes (Input Binding pour params, Transitions de vue)
    provideRouter(
      routes, 
      withComponentInputBinding(), 
      withViewTransitions()
    ),
    
    // Animations (Requis pour UI libraries)
    provideAnimations(),

    // HTTP Client (Pour Supabase interne ou API externes)
    provideHttpClient(),

    // --- FIREBASE INITIALIZATION ---
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    
    // Services Firebase
    provideAuth(() => getAuth()),           // Authentification
    provideFirestore(() => getFirestore()), // Base de données
    provideStorage(() => getStorage()), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          })      // Stockage (Optionnel si Supabase utilisé)
  ]
};
