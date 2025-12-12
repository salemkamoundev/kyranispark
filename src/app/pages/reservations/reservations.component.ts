import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';
import { Reservation } from '../../models';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.scss']
})
export class ReservationsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private firestoreService = inject(FirestoreService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // État
  activeTab: 'boat' | 'park' = 'boat';
  isSubmitting = false;
  submitSuccess = false;
  estimatedPrice = 0;
  minDate: string = '';

  // Formulaires
  boatForm!: FormGroup;
  parkForm!: FormGroup;

  // Données de tarification (Mock)
  boatPrices: any = {
    'flouka': 150,    // Prix de base
    'speed_boat': 400,
    'catamaran': 800,
    'yacht': 2500
  };

  eventPrices: any = {
    'birthday': 500,
    'marriage': 2000,
    'conference': 1000,
    'other': 500
  };

  constructor() {
    // Calcul de la date minimum (Aujourd'hui)
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.initForms();
    // Vérifier les query params pour pré-sélectionner l'onglet
    this.route.queryParams.subscribe(params => {
      if (params['type'] === 'park') {
        this.activeTab = 'park';
      } else {
        this.activeTab = 'boat';
      }
      this.calculatePrice();
    });

    // Écouteurs pour le calcul dynamique du prix
    this.boatForm.valueChanges.subscribe(() => this.calculatePrice());
    this.parkForm.valueChanges.subscribe(() => this.calculatePrice());
  }

  initForms() {
    // --- FORMULAIRE BATEAU ---
    this.boatForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      // Regex pour +216 suivi de 8 chiffres
      phone: ['', [Validators.required, Validators.pattern(/^\+216[0-9]{8}$/)]], 
      date: ['', [Validators.required]],
      time: ['', [Validators.required]],
      numberOfPeople: [1, [Validators.required, Validators.min(1), Validators.max(50)]],
      boatType: ['flouka', Validators.required],
      specialRequests: [''],
      acceptTerms: [false, Validators.requiredTrue]
    });

    // --- FORMULAIRE ESPACE PRIVÉ ---
    this.parkForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+216[0-9]{8}$/)]],
      date: ['', [Validators.required]],
      eventType: ['birthday', Validators.required],
      duration: ['half_day', Validators.required], // half_day, full_day
      menuIncluded: [false],
      numberOfPeople: [20, [Validators.required, Validators.min(10), Validators.max(200)]],
      specialRequests: [''],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  switchTab(tab: 'boat' | 'park') {
    this.activeTab = tab;
    this.submitSuccess = false;
    this.calculatePrice();
  }

  calculatePrice() {
    if (this.activeTab === 'boat') {
      const type = this.boatForm.get('boatType')?.value;
      const basePrice = this.boatPrices[type] || 0;
      // Exemple simple: Prix fixe par bateau (pourrait être par personne)
      this.estimatedPrice = basePrice;
    } else {
      const type = this.parkForm.get('eventType')?.value;
      const duration = this.parkForm.get('duration')?.value;
      const menu = this.parkForm.get('menuIncluded')?.value;
      const pax = this.parkForm.get('numberOfPeople')?.value || 0;

      let price = this.eventPrices[type] || 0;
      
      // Facteur durée
      if (duration === 'full_day') price *= 1.5;
      
      // Facteur menu (ex: 50 TND par personne)
      if (menu) price += (pax * 50);

      this.estimatedPrice = price;
    }
  }

  async onSubmit() {
    this.isSubmitting = true;
    const currentForm = this.activeTab === 'boat' ? this.boatForm : this.parkForm;

    if (currentForm.invalid) {
      this.isSubmitting = false;
      currentForm.markAllAsTouched();
      // Affiche toutes les erreurs
      return;
    }

    const formValues = currentForm.value;

    // Construction de l'objet Reservation
    // FIX: Utilisation de null au lieu de undefined pour Firestore
    const reservationData: Reservation = {
      type: this.activeTab,
      fullName: formValues.fullName,
      email: formValues.email,
      phone: formValues.phone,
      date: new Date(formValues.date),
      time: this.activeTab === 'boat' ? formValues.time : '00:00',
      numberOfPeople: formValues.numberOfPeople,
      
      boatType: this.activeTab === 'boat' ? formValues.boatType : null,
      eventType: this.activeTab === 'park' ? formValues.eventType : null,
      
      specialRequests: formValues.specialRequests,
      status: 'pending',
      totalPrice: this.estimatedPrice,
      createdAt: new Date()
    };

    try {
      await this.firestoreService.addReservation(reservationData);
      
      this.isSubmitting = false;
      this.submitSuccess = true;
      currentForm.reset();
      
      // Scroll to top
      window.scrollTo(0, 0);

      // Redirection après 3 secondes (optionnel)
      setTimeout(() => {
        // this.router.navigate(['/']); 
      }, 3000);

    } catch (error) {
      console.error('Erreur réservation', error);
      this.isSubmitting = false;
      alert("Une erreur est survenue. Veuillez réessayer.");
    }
  }

  // Helper pour vérifier les champs dans le HTML
  isFieldInvalid(fieldName: string): boolean {
    const form = this.activeTab === 'boat' ? this.boatForm : this.parkForm;
    const field = form.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }
}
