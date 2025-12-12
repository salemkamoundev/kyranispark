import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
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
    
    // Router : Retrait de withViewTransitions() qui cause l'erreur InvalidStateError
    provideRouter(
      routes, 
      withComponentInputBinding()
    ),
    
    // Animations
    provideAnimations(),

    // HTTP Client
    provideHttpClient(),

    // --- FIREBASE INITIALIZATION ---
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    
    // Services Firebase
    provideAuth(() => getAuth()),           
    provideFirestore(() => getFirestore()), 
    provideStorage(() => getStorage()), 
    
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};
