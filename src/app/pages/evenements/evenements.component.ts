import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FirestoreService } from '../../services/firestore.service';
import { Event } from '../../models';

type FilterType = 'all' | 'upcoming' | 'past';

@Component({
  selector: 'app-evenements',
  standalone: true,
  imports: [CommonModule, DatePipe],
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
  lightboxImage: string | null = null;

  constructor() {}

  ngOnInit(): void {
    this.firestoreService.getEvents().subscribe({
      next: (events) => {
        this.allEvents = events;
        // On applique le filtre par défaut
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
    
    // FIX: On prend la date actuelle à Minuit (00:00:00)
    // pour que les événements d'AUJOURD'HUI soient considérés comme "À venir"
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

  openLightbox(imgUrl: string): void {
    this.lightboxImage = imgUrl;
  }

  closeLightbox(): void {
    this.lightboxImage = null;
  }
}
