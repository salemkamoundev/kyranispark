import { Component, Input, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnChanges {
  @Input() images: string[] = [];
  @Input() videos: string[] = [];

  // Liste combinée pour la navigation
  items: MediaItem[] = [];
  
  // État de la lightbox
  isOpen = false;
  currentIndex = 0;

  ngOnChanges(changes: SimpleChanges): void {
    // Reconstruire la liste si les inputs changent
    if (changes['images'] || changes['videos']) {
      this.items = [
        ...(this.images || []).map(url => ({ type: 'image' as const, url })),
        ...(this.videos || []).map(url => ({ type: 'video' as const, url }))
      ];
    }
  }

  openLightbox(index: number): void {
    this.currentIndex = index;
    this.isOpen = true;
    document.body.style.overflow = 'hidden'; // Bloque le scroll du site
  }

  closeLightbox(): void {
    this.isOpen = false;
    document.body.style.overflow = 'auto'; // Réactive le scroll
  }

  next(): void {
    if (this.items.length === 0) return;
    if (this.currentIndex < this.items.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0; // Boucle au début
    }
  }

  prev(): void {
    if (this.items.length === 0) return;
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.items.length - 1; // Boucle à la fin
    }
  }

  // --- GESTION CLAVIER ---
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (!this.isOpen) return;

    if (event.key === 'Escape') {
      this.closeLightbox();
    } else if (event.key === 'ArrowRight') {
      this.next();
    } else if (event.key === 'ArrowLeft') {
      this.prev();
    }
  }
}
