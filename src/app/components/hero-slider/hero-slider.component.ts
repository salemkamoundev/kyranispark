import { Component, OnInit, OnDestroy, HostListener, Inject, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { trigger, transition, style, animate, query, group } from '@angular/animations';
import { FirestoreService } from '../../services/firestore.service';
import { HeroSlide } from '../../models';

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-slider.component.html',
  styleUrls: ['./hero-slider.component.scss'],
  animations: [
    trigger('slideAnimation', [
      transition(':increment', [
        group([
          query(':enter', [
            style({ opacity: 0, transform: 'scale(1.1)' }),
            animate('1000ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
          ]),
          query(':leave', [
            animate('1000ms ease-out', style({ opacity: 0 }))
          ])
        ])
      ]),
      transition(':decrement', [
        group([
          query(':enter', [
            style({ opacity: 0, transform: 'scale(1.1)' }),
            animate('1000ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
          ]),
          query(':leave', [
            animate('1000ms ease-out', style({ opacity: 0 }))
          ])
        ])
      ])
    ])
  ]
})
export class HeroSliderComponent implements OnInit, OnDestroy {
  private firestoreService = inject(FirestoreService);

  // Images statiques de secours (Fallback)
  defaultSlides: HeroSlide[] = [
    {
      imageUrl: 'https://pplx-res.cloudinary.com/image/upload/v1765513253/search_images/1ae70ea58b03bdb7ef99b684e9f870dd1c50316a.jpg',
      title: 'Bienvenue à Kyranis Park',
      subtitle: 'L\'évasion au cœur des îles Kerkennah',
      createdAt: new Date()
    },
    {
      imageUrl: 'https://pplx-res.cloudinary.com/image/upload/v1765513254/search_images/767fece22dcfe0ef399c8e99d9ed66a010bd6e11.jpg',
      title: 'Des Moments Inoubliables',
      subtitle: 'Célébrez vos événements dans un cadre unique',
      createdAt: new Date()
    },
    {
      imageUrl: 'https://pplx-res.cloudinary.com/image/upload/v1763880066/search_images/f9a3f2ffd5ad5d033ed42d88e8eb078c1dc7cd6b.jpg',
      title: 'Excursions en Bateau',
      subtitle: 'Découvrez la beauté maritime de l\'archipel',
      createdAt: new Date()
    }
  ];

  // IMPORTANT: On initialise avec les défauts pour éviter l'écran vide au chargement
  slides: HeroSlide[] = [...this.defaultSlides];
  
  currentIndex = 0;
  intervalId: any;
  scrollY = 0;
  isBrowser = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    // On écoute Firestore
    this.firestoreService.getHeroSlides().subscribe({
      next: (data) => {
        // Si on reçoit des données valides, on remplace les défauts
        if (data && data.length > 0) {
          this.slides = data;
          // Réinitialiser l'index si on dépasse la nouvelle longueur
          if (this.currentIndex >= this.slides.length) {
            this.currentIndex = 0;
          }
        }
        // Sinon, on garde this.defaultSlides (déjà set)
        this.resetTimer();
      },
      error: (err) => {
        console.error('Erreur chargement slider:', err);
        // En cas d'erreur, on garde les défauts
      }
    });

    this.startAutoPlay();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.isBrowser) {
      this.scrollY = window.scrollY;
    }
  }

  startAutoPlay() {
    if (this.isBrowser) {
      this.intervalId = setInterval(() => {
        this.nextSlide();
      }, 5000);
    }
  }

  stopAutoPlay() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  resetTimer() {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  nextSlide() {
    if (!this.slides || this.slides.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    this.resetTimer();
  }

  prevSlide() {
    if (!this.slides || this.slides.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.resetTimer();
  }

  goToSlide(index: number) {
    this.currentIndex = index;
    this.resetTimer();
  }
}
