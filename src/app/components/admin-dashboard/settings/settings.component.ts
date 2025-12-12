import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FirestoreService } from '../../../services/firestore.service';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  private firestoreService = inject(FirestoreService);
  private supabaseService = inject(SupabaseService);
  private fb = inject(FormBuilder);

  settingsForm: FormGroup;
  isLoading = true;
  isSaving = false;
  isUploadingLogo = false; // État upload
  
  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';

  constructor() {
    this.settingsForm = this.fb.group({
      businessName: ['Kyranis Park'],
      address: [''],
      phone: ['+216 28 417 822'],
      email: [''],
      facebookUrl: [''],
      homePageDescription: [''],
      parkDescription: [''],
      googleMapsEmbed: [''],
      openingHours: ['Du Lundi au Dimanche, 09h - 22h'],
      
      header: this.fb.group({
        logoText: ['KYRANIS PARK'],
        logoUrl: [''], // Champ caché pour l'URL de l'image
        menuHome: ['Accueil'],
        menuEvents: ['Événements'],
        menuReservations: ['Réservations'],
        menuContact: ['Contact']
      }),

      boatPrices: this.fb.group({
        flouka: [150],
        speed_boat: [400],
        catamaran: [800],
        yacht: [2500]
      }),
      eventPrices: this.fb.group({
        birthday: [500],
        marriage: [2000],
        conference: [1000],
        other: [500]
      })
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings() {
    this.isLoading = true;
    this.firestoreService.getSettings().subscribe({
      next: (data: any) => {
        if (data) {
          this.settingsForm.patchValue(data);
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.showToast('Erreur chargement paramètres', 'error');
        this.isLoading = false;
      }
    });
  }

  // --- LOGO UPLOAD ---
  async handleLogoUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isUploadingLogo = true;
    try {
      // Upload vers un dossier 'settings'
      const result = await this.supabaseService.uploadImage(file, 'settings');
      
      // Mise à jour du formulaire avec l'URL
      this.settingsForm.get('header')?.patchValue({
        logoUrl: result.url
      });
      
      this.showToast('Logo téléchargé avec succès', 'success');
    } catch (error) {
      console.error(error);
      this.showToast('Erreur upload logo', 'error');
    } finally {
      this.isUploadingLogo = false;
    }
  }

  removeLogo() {
    if(confirm('Supprimer le logo et revenir au texte seul ?')) {
      this.settingsForm.get('header')?.patchValue({
        logoUrl: ''
      });
    }
  }

  // --- SAVE ---
  async onSubmit() {
    this.isSaving = true;
    const formData = this.settingsForm.value;

    try {
      await this.firestoreService.updateSettings(formData);
      this.showToast('Paramètres enregistrés avec succès', 'success');
    } catch (error) {
      console.error(error);
      this.showToast('Erreur lors de la sauvegarde', 'error');
    } finally {
      this.isSaving = false;
    }
  }

  resetForm() {
    if (confirm('Voulez-vous annuler les modifications non sauvegardées ?')) {
      this.loadSettings();
    }
  }

  showToast(msg: string, type: 'success' | 'error') {
    this.toastMessage = msg;
    this.toastType = type;
    setTimeout(() => this.toastMessage = null, 3000);
  }
}
