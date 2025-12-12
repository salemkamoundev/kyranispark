import { Component, OnInit, OnDestroy, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { trigger, transition, style, animate, query, group } from '@angular/animations';

interface Slide {
  image: string;
  title: string;
  subtitle: string;
}

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
  slides: Slide[] = [
    {
      image: 'https://pplx-res.cloudinary.com/image/upload/v1765513253/search_images/1ae70ea58b03bdb7ef99b684e9f870dd1c50316a.jpg',
      title: 'Bienvenue à Kyranis Park',
      subtitle: 'L\'évasion au cœur des îles Kerkennah'
    },
    {
      image: 'https://pplx-res.cloudinary.com/image/upload/v1765513254/search_images/767fece22dcfe0ef399c8e99d9ed66a010bd6e11.jpg',
      title: 'Des Moments Inoubliables',
      subtitle: 'Célébrez vos événements dans un cadre unique'
    },
    {
      image: 'https://pplx-res.cloudinary.com/image/upload/v1763880066/search_images/f9a3f2ffd5ad5d033ed42d88e8eb078c1dc7cd6b.jpg',
      title: 'Excursions en Bateau',
      subtitle: 'Découvrez la beauté maritime de l\'archipel'
    },
    {
      image: 'https://pplx-res.cloudinary.com/image/upload/v1765513253/search_images/1e914eb0d27d61e234de07e9b6554c6b5420ea47.jpg',
      title: 'Gastronomie & Détente',
      subtitle: 'Savourez la vie au bord de l\'eau'
    }
  ];

  currentIndex = 0;
  intervalId: any;
  scrollY = 0;
  isBrowser = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
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
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    this.resetTimer();
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.resetTimer();
  }

  goToSlide(index: number) {
    this.currentIndex = index;
    this.resetTimer();
  }
}
