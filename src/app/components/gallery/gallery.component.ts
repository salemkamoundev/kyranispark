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

  // Liste unifiée pour la navigation (prev/next entre images et vidéos)
  items: MediaItem[] = [];
  
  // État de la lightbox
  isOpen = false;
  currentIndex = 0;

  ngOnChanges(changes: SimpleChanges): void {
    // À chaque changement des inputs, on recrée la liste unifiée
    if (changes['images'] || changes['videos']) {
      this.buildMediaList();
    }
  }

  private buildMediaList() {
    this.items = [
      ...(this.images || []).map(url => ({ type: 'image' as const, url })),
      ...(this.videos || []).map(url => ({ type: 'video' as const, url }))
    ];
  }

  openLightbox(index: number): void {
    this.currentIndex = index;
    this.isOpen = true;
    document.body.style.overflow = 'hidden'; // Bloque le scroll arrière-plan
  }

  closeLightbox(): void {
    this.isOpen = false;
    document.body.style.overflow = 'auto'; // Réactive le scroll
  }

  next(): void {
    if (this.currentIndex < this.items.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0; // Boucle au début
    }
  }

  prev(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.items.length - 1; // Boucle à la fin
    }
  }

  // Fermeture avec la touche ESC
  @HostListener('window:keydown.escape', [])
  onKeydownHandler() {
    if (this.isOpen) {
      this.closeLightbox();
    }
  }

  // Navigation clavier flèches
  @HostListener('window:keydown.arrowright', [])
  onArrowRight() {
    if (this.isOpen) this.next();
  }

  @HostListener('window:keydown.arrowleft', [])
  onArrowLeft() {
    if (this.isOpen) this.prev();
  }
}
