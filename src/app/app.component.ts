import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

// Import des composants de structure
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, HeaderComponent, FooterComponent],
  template: `
    <div class="flex flex-col min-h-screen relative bg-gray-50 font-sans">
      
      <app-header class="z-50"></app-header>

      <main class="flex-grow w-full pt-12"> 
        <router-outlet></router-outlet>
      </main>

      <app-footer></app-footer>

      <a *ngIf="!isHomePage"
         routerLink="/" 
         class="fixed bottom-6 left-6 z-[100] p-3 bg-white text-blue-600 rounded-full shadow-2xl border-2 border-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-110 flex items-center justify-center group cursor-pointer print:hidden"
         title="Retour à l'accueil">
        
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        
        <span class="absolute left-full ml-2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Accueil
        </span>
      </a>

    </div>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private router = inject(Router);
  
  // Permet de cacher le bouton "Retour" si on est déjà sur l'accueil
  isHomePage = false;

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Détection si on est sur la racine
      this.isHomePage = event.url === '/' || event.url === '/#';
      
      // Remonter en haut de page lors de la navigation
      window.scrollTo(0, 0);
    });
  }
}
