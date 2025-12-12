import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';
import { Event } from '../../models';

type FilterType = 'all' | 'upcoming' | 'past';

interface LightboxItem {
  type: 'image' | 'video';
  url: string;
}

@Component({
  selector: 'app-evenements',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule],
  templateUrl: './evenements.component.html',
  styleUrls: ['./evenements.component.scss']
})
export class EvenementsComponent implements OnInit {
  private firestoreService = inject(FirestoreService);

  // Données
  allEvents: Event[] = [];
  filteredEvents: Event[] = [];
  currentFilter: FilterType = 'all';
  
  isLoading = true;
  selectedEvent: Event | null = null;
  isModalOpen = false;

  // --- LOGIQUE LIGHTBOX AVANCÉE ---
  isLightboxOpen = false;
  lightboxItems: LightboxItem[] = [];
  lightboxIndex = 0;

  constructor() {}

  ngOnInit(): void {
    this.firestoreService.getEvents().subscribe({
      next: (events) => {
        this.allEvents = events;
        this.applyFilter('all'); 
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement événements', err);
        this.isLoading = false;
      }
    });
  }

  applyFilter(filter: FilterType): void {
    this.currentFilter = filter;
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (filter === 'all') {
      this.filteredEvents = [...this.allEvents];
    } else if (filter === 'upcoming') {
      this.filteredEvents = this.allEvents.filter(e => {
        const d = e.date instanceof Date ? e.date : new Date(e.date);
        return d >= now;
      });
      this.filteredEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (filter === 'past') {
      this.filteredEvents = this.allEvents.filter(e => {
        const d = e.date instanceof Date ? e.date : new Date(e.date);
        return d < now;
      });
      this.filteredEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  }

  // --- GESTION MODALE DÉTAILS ---
  openModal(event: Event): void {
    this.selectedEvent = event;
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedEvent = null;
    document.body.style.overflow = 'auto';
  }

  // --- GESTION LIGHTBOX (GALERIE) ---
  
  openGalleryLightbox(index: number, images: string[] = [], videos: string[] = []) {
    this.lightboxItems = [
      ...images.map(url => ({ type: 'image' as const, url })),
      ...videos.map(url => ({ type: 'video' as const, url }))
    ];
    
    this.lightboxIndex = index;
    this.isLightboxOpen = true;
  }

  closeLightbox() {
    this.isLightboxOpen = false;
    this.lightboxItems = [];
  }

  // CORRECTION ICI : Utilisation de 'any' pour éviter le conflit de type avec le modèle 'Event'
  nextMedia(e?: any) {
    if (e) e.stopPropagation();
    if (this.lightboxIndex < this.lightboxItems.length - 1) {
      this.lightboxIndex++;
    } else {
      this.lightboxIndex = 0; // Boucle
    }
  }

  // CORRECTION ICI : Utilisation de 'any'
  prevMedia(e?: any) {
    if (e) e.stopPropagation();
    if (this.lightboxIndex > 0) {
      this.lightboxIndex--;
    } else {
      this.lightboxIndex = this.lightboxItems.length - 1; // Boucle
    }
  }

  // --- HELPERS ---
  getCoverImage(event: Event): string {
    if (event.galleryImages && event.galleryImages.length > 0) {
      return event.galleryImages[0];
    }
    return 'https://via.placeholder.com/800x600?text=Kyranis+Park';
  }

  isEventPast(event: Event): boolean {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const d = event.date instanceof Date ? event.date : new Date(event.date);
    return d < now;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.isLightboxOpen) {
      if (event.key === 'Escape') this.closeLightbox();
      if (event.key === 'ArrowRight') this.nextMedia();
      if (event.key === 'ArrowLeft') this.prevMedia();
      return; 
    }

    if (this.isModalOpen && event.key === 'Escape') {
      this.closeModal();
    }
  }
}
