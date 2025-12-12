import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FirestoreService } from '../../services/firestore.service';
import { AppSettings, Gallery, Event, Feedback } from '../../models';
import { HeroSliderComponent } from '../../components/hero-slider/hero-slider.component';

// Interface locale pour la navigation unifiée
interface LightboxItem {
  type: 'image' | 'video';
  url: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HeroSliderComponent, DatePipe, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private firestoreService = inject(FirestoreService);
  private fb = inject(FormBuilder);

  // Données principales
  settings$: Observable<AppSettings> = this.firestoreService.getSettings();
  parkGalleries$: Observable<Gallery[]> = this.firestoreService.getGalleries('park');
  upcomingEvents$: Observable<Event[]> = this.firestoreService.getEvents().pipe(
    map(events => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return events
        .filter(e => {
          const d = e.date instanceof Date ? e.date : new Date(e.date);
          return d >= now;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);
    })
  );

  // AVIS CLIENTS
  approvedFeedbacks$: Observable<Feedback[]> = this.firestoreService.getApprovedFeedbacks(3);

  // FORMULAIRE AVIS
  isFeedbackModalOpen = false;
  feedbackForm: FormGroup;
  isSubmittingFeedback = false;
  captchaA = 0;
  captchaB = 0;
  captchaAnswer = 0;
  
  stars: number[] = [1, 2, 3, 4, 5];

  // --- LOGIQUE LIGHTBOX PRO (Unifiée) ---
  isLightboxOpen = false;       // État ouverture
  lightboxItems: LightboxItem[] = []; // Liste de lecture
  lightboxIndex = 0;            // Position actuelle

  constructor() {
    this.feedbackForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
      rating: [5, Validators.required],
      captcha: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.generateCaptcha();
  }

  // --- FEEDBACK ---
  generateCaptcha() {
    this.captchaA = Math.floor(Math.random() * 10) + 1;
    this.captchaB = Math.floor(Math.random() * 10) + 1;
    this.captchaAnswer = this.captchaA + this.captchaB;
    this.feedbackForm.get('captcha')?.setValue('');
  }

  openFeedbackModal() {
    this.isFeedbackModalOpen = true;
    this.generateCaptcha();
  }

  closeFeedbackModal() {
    this.isFeedbackModalOpen = false;
    this.feedbackForm.reset({ rating: 5 });
  }

  setRating(rating: number) {
    this.feedbackForm.patchValue({ rating: rating });
  }

  async submitFeedback() {
    if (this.feedbackForm.invalid) {
      this.feedbackForm.markAllAsTouched();
      return;
    }
    const userAnswer = parseInt(this.feedbackForm.get('captcha')?.value, 10);
    if (userAnswer !== this.captchaAnswer) {
      alert(`Calcul incorrect.`);
      return;
    }
    this.isSubmittingFeedback = true;
    const { name, message, rating } = this.feedbackForm.value;
    try {
      await this.firestoreService.addFeedback({
        name,
        message,
        rating: parseInt(rating, 10),
      });
      alert('Merci ! Votre avis a été envoyé et sera publié après validation.');
      this.closeFeedbackModal();
    } catch (e) {
      console.error(e);
      alert('Une erreur est survenue.');
    } finally {
      this.isSubmittingFeedback = false;
    }
  }

  isFieldInvalid(field: string) {
    const control = this.feedbackForm.get(field);
    return control?.invalid && (control?.dirty || control?.touched);
  }

  // --- GALERIE LIGHTBOX (LOGIQUE CORRIGÉE) ---

  openGallery(gallery: Gallery) {
    // 1. On transforme TOUT (images + vidéos) en une liste 'lightboxItems'
    this.lightboxItems = [
      ...(gallery.images || []).map(url => ({ type: 'image' as const, url })),
      ...(gallery.videos || []).map(url => ({ type: 'video' as const, url }))
    ];

    if (this.lightboxItems.length === 0) return;

    // 2. On ouvre au début
    this.lightboxIndex = 0;
    this.isLightboxOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    this.isLightboxOpen = false;
    this.lightboxItems = [];
    document.body.style.overflow = 'auto';
  }

  nextMedia(e?: any) {
    if(e) e.stopPropagation();
    if (this.lightboxIndex < this.lightboxItems.length - 1) {
      this.lightboxIndex++;
    } else {
      this.lightboxIndex = 0; // Boucle
    }
  }

  prevMedia(e?: any) {
    if(e) e.stopPropagation();
    if (this.lightboxIndex > 0) {
      this.lightboxIndex--;
    } else {
      this.lightboxIndex = this.lightboxItems.length - 1; // Boucle
    }
  }

  // --- HELPERS ---
  getCoverImage(event: Event): string {
    if (event.galleryImages && event.galleryImages.length > 0) return event.galleryImages[0];
    return 'https://via.placeholder.com/800x600?text=Kyranis+Park';
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.isLightboxOpen) {
      if (event.key === 'Escape') this.closeLightbox();
      else if (event.key === 'ArrowRight') this.nextMedia();
      else if (event.key === 'ArrowLeft') this.prevMedia();
    }
  }
}
