import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FirestoreService } from '../../../services/firestore.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  private firestoreService = inject(FirestoreService);
  private fb = inject(FormBuilder);

  settingsForm: FormGroup;
  isLoading = true;
  isSaving = false;
  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';

  constructor() {
    // MODIFICATION: Suppression des Validators.required pour rendre les champs optionnels
    this.settingsForm = this.fb.group({
      businessName: ['Kyranis Park'],
      address: [''],
      phone: ['+216 28 417 822'],
      email: [''], // Plus de validation email stricte bloquante
      facebookUrl: [''],
      homePageDescription: [''],
      parkDescription: [''],
      googleMapsEmbed: [''],
      openingHours: ['Du Lundi au Dimanche, 09h - 22h'],
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
          // patchValue permet de ne mettre à jour que les champs présents
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

  async onSubmit() {
    // MODIFICATION: Suppression du bloc de vérification (if invalid return)
    // Le formulaire est sauvegardé même s'il manque des infos.

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
