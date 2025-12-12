import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <h1 class="text-9xl font-extrabold text-gray-800">404</h1>
      <p class="text-2xl font-semibold text-gray-600 mt-4">Oups ! Page introuvable.</p>
      <p class="text-gray-500 mt-2 mb-8 text-center">La page que vous recherchez semble avoir pris le large vers Kerkennah sans nous.</p>
      <a routerLink="/" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg font-medium">
        Retour à l'accueil
      </a>
    </div>
  `
})
export class PageNotFoundComponent {}
