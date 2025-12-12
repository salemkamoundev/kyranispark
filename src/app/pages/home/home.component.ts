import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Services & Models
import { FirestoreService } from '../../services/firestore.service';
import { AppSettings, Gallery } from '../../models';

// Components
import { HeroSliderComponent } from '../../components/hero-slider/hero-slider.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HeroSliderComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private firestoreService = inject(FirestoreService);

  // Streams de données
  settings$: Observable<AppSettings> = this.firestoreService.getSettings();
  
  // On récupère les galeries 'park' et on extrait une liste plate d'images (max 8)
  parkImages$: Observable<string[]> = this.firestoreService.getGalleries('park').pipe(
    map((galleries: Gallery[]) => {
      // Aplatir les tableaux d'images de toutes les galeries trouvées
      const allImages = galleries.flatMap(g => g.images);
      // Retourner les 8 premières pour la grille
      return allImages.slice(0, 8);
    })
  );

  // Mock Témoignages
  testimonials = [
    {
      name: 'Sarah M.',
      role: 'Visiteuse',
      text: 'Une journée inoubliable ! Le coucher de soleil sur le bateau était magique. L\'équipe est aux petits soins.',
      rating: 5
    },
    {
      name: 'Ahmed K.',
      role: 'Organisateur Événement',
      text: 'Nous avons organisé notre séminaire d\'entreprise ici. Le cadre est inspirant et les services parfaits.',
      rating: 5
    },
    {
      name: 'Famille Tounsi',
      role: 'Vacances',
      text: 'Les enfants ont adoré le parc et nous la tranquillité. La cuisine locale est délicieuse.',
      rating: 4
    }
  ];

  // Gestion Lightbox
  lightboxOpen = false;
  currentImage: string | null = null;

  constructor() {}

  ngOnInit(): void {}

  openLightbox(imageUrl: string) {
    this.currentImage = imageUrl;
    this.lightboxOpen = true;
    document.body.style.overflow = 'hidden'; // Empêche le scroll arrière-plan
  }

  closeLightbox() {
    this.lightboxOpen = false;
    this.currentImage = null;
    document.body.style.overflow = 'auto';
  }
}
