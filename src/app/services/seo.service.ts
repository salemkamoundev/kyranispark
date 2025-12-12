import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private router = inject(Router);

  constructor() {
    // Suivre la navigation pour mettre à jour les métadonnées si nécessaire
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Logique par défaut ou réinitialisation ici si besoin
    });
  }

  /**
   * Met à jour les balises SEO pour une page donnée
   */
  updateMetaTags(config: { title: string, description: string, image?: string }) {
    // Titre
    const finalTitle = `${config.title} | Kyranis Park`;
    this.titleService.setTitle(finalTitle);

    // Description
    this.metaService.updateTag({ name: 'description', content: config.description });

    // Open Graph (Facebook, LinkedIn)
    this.metaService.updateTag({ property: 'og:title', content: finalTitle });
    this.metaService.updateTag({ property: 'og:description', content: config.description });
    
    if (config.image) {
      this.metaService.updateTag({ property: 'og:image', content: config.image });
    }

    // Twitter Card
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: finalTitle });
    this.metaService.updateTag({ name: 'twitter:description', content: config.description });
    
    if (config.image) {
      this.metaService.updateTag({ name: 'twitter:image', content: config.image });
    }
  }
}
