import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FirestoreService } from '../../services/firestore.service';
import { Event } from '../../models';
import { Observable, map, tap } from 'rxjs';

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

  // Données brutes
  allEvents: Event[] = [];
  
  // Données filtrées pour l'affichage
  filteredEvents: Event[] = [];
  
  // État du filtre
  currentFilter: FilterType = 'all';
  
  // État du chargement
  isLoading = true;

  // État de la Modal Détail
  selectedEvent: Event | null = null;
  isModalOpen = false;

  // État de la Lightbox (Zoom image dans le modal)
  lightboxImage: string | null = null;

  constructor() {}

  ngOnInit(): void {
    // On charge tous les événements une seule fois et on filtre côté client
    // car le volume n'est pas énorme
    this.firestoreService.getEvents().subscribe({
      next: (events) => {
        this.allEvents = events;
        this.applyFilter('all'); // Défaut: tous
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement événements', err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Applique le filtre (Tout, À venir, Passés)
   */
  applyFilter(filter: FilterType): void {
    this.currentFilter = filter;
    const now = new Date();

    if (filter === 'all') {
      this.filteredEvents = [...this.allEvents];
    } else if (filter === 'upcoming') {
      // Événements futurs (date >= maintenant)
      this.filteredEvents = this.allEvents.filter(e => e.date >= now);
      // Tri: du plus proche au plus lointain
      this.filteredEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
    } else if (filter === 'past') {
      // Événements passés
      this.filteredEvents = this.allEvents.filter(e => e.date < now);
      // Tri: du plus récent au plus vieux
      this.filteredEvents.sort((a, b) => b.date.getTime() - a.date.getTime());
    }
  }

  /**
   * Gestion de la Modal Détails
   */
  openModal(event: Event): void {
    this.selectedEvent = event;
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden'; // Bloque le scroll body
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedEvent = null;
    document.body.style.overflow = 'auto';
  }

  /**
   * Helpers d'affichage
   */
  getCoverImage(event: Event): string {
    if (event.galleryImages && event.galleryImages.length > 0) {
      return event.galleryImages[0];
    }
    // Placeholder si pas d'image
    return 'https://via.placeholder.com/800x600?text=Kyranis+Park';
  }

  isEventPast(event: Event): boolean {
    return event.date < new Date();
  }

  /**
   * Lightbox Interne au Modal
   */
  openLightbox(imgUrl: string): void {
    this.lightboxImage = imgUrl;
  }

  closeLightbox(): void {
    this.lightboxImage = null;
  }
}
