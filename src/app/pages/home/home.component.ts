import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Services & Models
import { FirestoreService } from '../../services/firestore.service';
import { AppSettings, Gallery, Event } from '../../models';

// Components
import { HeroSliderComponent } from '../../components/hero-slider/hero-slider.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HeroSliderComponent, DatePipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private firestoreService = inject(FirestoreService);

  // Streams de données
  settings$: Observable<AppSettings> = this.firestoreService.getSettings();
  
  // Galeries
  parkGalleries$: Observable<Gallery[]> = this.firestoreService.getGalleries('park');

  // Événements à venir (Max 3 pour l'accueil)
  upcomingEvents$: Observable<Event[]> = this.firestoreService.getEvents().pipe(
    map(events => {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Inclure aujourd'hui
      return events
        .filter(e => {
          const d = e.date instanceof Date ? e.date : new Date(e.date);
          return d >= now;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3); // Prendre les 3 prochains
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

  // --- GESTION LIGHTBOX ---
  lightboxOpen = false;
  selectedGallery: Gallery | null = null;
  currentImageIndex = 0;

  constructor() {}

  ngOnInit(): void {}

  openGallery(gallery: Gallery) {
    if (!gallery.images || gallery.images.length === 0) return;
    this.selectedGallery = gallery;
    this.currentImageIndex = 0;
    this.lightboxOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    this.lightboxOpen = false;
    this.selectedGallery = null;
    this.currentImageIndex = 0;
    document.body.style.overflow = 'auto';
  }

  // FIX: Utilisation de 'any' au lieu de 'Event' pour éviter le conflit avec le modèle Event
  nextImage(e?: any) {
    e?.stopPropagation();
    if (!this.selectedGallery || !this.selectedGallery.images) return;
    this.currentImageIndex = (this.currentImageIndex < this.selectedGallery.images.length - 1) 
      ? this.currentImageIndex + 1 
      : 0;
  }

  // FIX: Utilisation de 'any' au lieu de 'Event'
  prevImage(e?: any) {
    e?.stopPropagation();
    if (!this.selectedGallery || !this.selectedGallery.images) return;
    this.currentImageIndex = (this.currentImageIndex > 0) 
      ? this.currentImageIndex - 1 
      : this.selectedGallery.images.length - 1;
  }

  getCoverImage(event: Event): string {
    if (event.galleryImages && event.galleryImages.length > 0) return event.galleryImages[0];
    return 'https://via.placeholder.com/800x600?text=Kyranis+Park';
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (!this.lightboxOpen) return;
    if (event.key === 'Escape') this.closeLightbox();
    else if (event.key === 'ArrowRight') this.nextImage();
    else if (event.key === 'ArrowLeft') this.prevImage();
  }
}
