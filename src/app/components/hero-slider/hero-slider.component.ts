import { Component, OnInit, OnDestroy, HostListener, Inject, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router'; // AJOUT IMPORTANT
import { trigger, transition, style, animate, query, group } from '@angular/animations';
import { FirestoreService } from '../../services/firestore.service';
import { HeroSlide } from '../../models';

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule, RouterModule], // AJOUT DANS LES IMPORTS
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

  defaultSlides: HeroSlide[] = [

  ];

  slides: HeroSlide[] = [...this.defaultSlides];
  currentIndex = 0;
  intervalId: any;
  scrollY = 0;
  isBrowser = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.firestoreService.getHeroSlides().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.slides = data;
          if (this.currentIndex >= this.slides.length) {
            this.currentIndex = 0;
          }
        }
        this.resetTimer();
      },
      error: (err) => console.error(err)
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
