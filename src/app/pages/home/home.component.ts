import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { FirestoreService } from '../../services/firestore.service';
import { AppSettings, Gallery, Event, Feedback } from '../../models';
import { HeroSliderComponent } from '../../components/hero-slider/hero-slider.component';

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

  // LOGIQUE FEEDBACK & CAPTCHA
  isFeedbackModalOpen = false;
  feedbackForm: FormGroup;
  isSubmittingFeedback = false;
  captchaA = 0;
  captchaB = 0;
  captchaAnswer = 0;
  
  stars: number[] = [1, 2, 3, 4, 5];

  // LOGIQUE LIGHTBOX
  lightboxOpen = false;
  selectedGallery: Gallery | null = null;
  currentImageIndex = 0;

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

  // --- FEEDBACK & CAPTCHA ---

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
    // MODIFICATION ICI: Si invalide, on affiche les erreurs (rouge) au lieu de bloquer silencieusement
    if (this.feedbackForm.invalid) {
      this.feedbackForm.markAllAsTouched();
      return;
    }

    const userAnswer = parseInt(this.feedbackForm.get('captcha')?.value, 10);
    if (userAnswer !== this.captchaAnswer) {
      alert(`Calcul incorrect (${this.captchaA} + ${this.captchaB}). Veuillez réessayer.`);
      // On ne régénère pas forcément tout de suite pour laisser l'utilisateur corriger
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

  // Helper pour le HTML
  isFieldInvalid(field: string) {
    const control = this.feedbackForm.get(field);
    return control?.invalid && (control?.dirty || control?.touched);
  }

  // --- LIGHTBOX ---
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

  nextImage(e?: any) {
    e?.stopPropagation();
    if (!this.selectedGallery || !this.selectedGallery.images) return;
    this.currentImageIndex = (this.currentImageIndex < this.selectedGallery.images.length - 1) ? this.currentImageIndex + 1 : 0;
  }

  prevImage(e?: any) {
    e?.stopPropagation();
    if (!this.selectedGallery || !this.selectedGallery.images) return;
    this.currentImageIndex = (this.currentImageIndex > 0) ? this.currentImageIndex - 1 : this.selectedGallery.images.length - 1;
  }

  getCoverImage(event: Event): string {
    if (event.galleryImages && event.galleryImages.length > 0) return event.galleryImages[0];
    return 'https://via.placeholder.com/800x600?text=Kyranis+Park';
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.lightboxOpen) {
      if (event.key === 'Escape') this.closeLightbox();
      else if (event.key === 'ArrowRight') this.nextImage();
      else if (event.key === 'ArrowLeft') this.prevImage();
    }
  }
}
