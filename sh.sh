#!/bin/bash

echo "=================================================="
echo "  ACTIVATION UPLOAD LOGO HEADER"
echo "=================================================="

# 1. MISE A JOUR DU MODELE (Ajout logoUrl)
echo "1. Mise à jour de models/settings.ts..."

cat << 'EOF' > ./src/app/models/settings.ts
/**
 * Interface pour la collection 'settings'.
 */
export interface AppSettings {
  businessName: string;
  address: string;
  phone: string;
  email: string;
  facebookUrl: string;
  
  googleMapsEmbed: string;
  homePageDescription: string;
  parkDescription: string;

  // Config Header
  header?: {
    logoText: string;
    logoUrl?: string; // NOUVEAU: URL de l'image
    menuHome: string;
    menuEvents: string;
    menuReservations: string;
    menuContact: string;
  };
}
EOF

# 2. MISE A JOUR ADMIN SETTINGS (TS)
# Ajout de SupabaseService et de la méthode d'upload
echo "2. Mise à jour de settings.component.ts..."

cat << 'EOF' > ./src/app/components/admin-dashboard/settings/settings.component.ts
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
EOF

# 3. MISE A JOUR ADMIN SETTINGS (HTML)
# Ajout de l'input file et preview
echo "3. Mise à jour de settings.component.html..."

cat << 'EOF' > ./src/app/components/admin-dashboard/settings/settings.component.html
<div class="p-6 max-w-5xl mx-auto">

  <div class="flex justify-between items-center mb-6">
    <h2 class="text-2xl font-bold text-gray-800">Paramètres Généraux</h2>
    <div *ngIf="isSaving" class="flex items-center text-blue-600 text-sm">
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      Sauvegarde...
    </div>
  </div>

  <div *ngIf="toastMessage" 
       [class.bg-green-500]="toastType === 'success'"
       [class.bg-red-500]="toastType === 'error'"
       class="fixed top-4 right-4 text-white px-6 py-3 rounded shadow-lg z-50 animate-bounce">
    {{ toastMessage }}
  </div>

  <form [formGroup]="settingsForm" (ngSubmit)="onSubmit()" class="space-y-6">
    
    <div class="bg-white shadow rounded-lg p-6" formGroupName="header">
      <h3 class="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Configuration du Header (Menu)</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div class="md:col-span-2 border p-4 rounded bg-gray-50">
          <label class="block text-sm font-bold text-gray-700 mb-2">Logo du Site</label>
          
          <div class="flex items-center gap-6">
            <div class="h-16 w-auto min-w-[100px] border bg-white flex items-center justify-center rounded overflow-hidden">
               <img *ngIf="settingsForm.get('header.logoUrl')?.value" 
                    [src]="settingsForm.get('header.logoUrl')?.value" 
                    class="h-full object-contain">
               <span *ngIf="!settingsForm.get('header.logoUrl')?.value" class="text-xs text-gray-400">Aucun logo</span>
            </div>

            <div class="flex flex-col gap-2">
              <label class="cursor-pointer bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition text-center">
                <span *ngIf="!isUploadingLogo">Télécharger une image</span>
                <span *ngIf="isUploadingLogo">Upload en cours...</span>
                <input type="file" class="hidden" accept="image/*" (change)="handleLogoUpload($event)" [disabled]="isUploadingLogo">
              </label>
              
              <button *ngIf="settingsForm.get('header.logoUrl')?.value" 
                      type="button" 
                      (click)="removeLogo()" 
                      class="text-red-600 text-xs hover:underline text-center">
                Supprimer le logo
              </button>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-2">Si aucun logo n'est défini, le texte ci-dessous sera affiché.</p>
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700">Texte du Logo (Fallback)</label>
          <input type="text" formControlName="logoText" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 font-bold">
        </div>

        <div><label class="block text-sm font-medium text-gray-700">Label "Accueil"</label><input type="text" formControlName="menuHome" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"></div>
        <div><label class="block text-sm font-medium text-gray-700">Label "Événements"</label><input type="text" formControlName="menuEvents" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"></div>
        <div><label class="block text-sm font-medium text-gray-700">Label "Réservations"</label><input type="text" formControlName="menuReservations" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"></div>
        <div><label class="block text-sm font-medium text-gray-700">Label "Contact"</label><input type="text" formControlName="menuContact" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"></div>
      </div>
    </div>

    <div class="bg-white shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Informations Entreprise</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><label class="block text-sm font-medium text-gray-700">Nom du Business</label><input type="text" formControlName="businessName" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"></div>
        <div><label class="block text-sm font-medium text-gray-700">Horaires</label><input type="text" formControlName="openingHours" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"></div>
        <div><label class="block text-sm font-medium text-gray-700">Téléphone</label><input type="text" formControlName="phone" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"></div>
        <div><label class="block text-sm font-medium text-gray-700">Email</label><input type="email" formControlName="email" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"></div>
        <div class="md:col-span-2"><label class="block text-sm font-medium text-gray-700">Adresse</label><input type="text" formControlName="address" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"></div>
        <div class="md:col-span-2"><label class="block text-sm font-medium text-gray-700">Facebook URL</label><input type="text" formControlName="facebookUrl" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"></div>
      </div>
    </div>

    <div class="bg-white shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Contenu & Localisation</h3>
      <div class="space-y-4">
        <div><label class="block text-sm font-medium text-gray-700">Intro Accueil</label><textarea formControlName="homePageDescription" rows="3" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"></textarea></div>
        <div><label class="block text-sm font-medium text-gray-700">Description Parc</label><textarea formControlName="parkDescription" rows="2" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"></textarea></div>
        <div><label class="block text-sm font-medium text-gray-700">Google Maps Embed</label><textarea formControlName="googleMapsEmbed" rows="3" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 font-mono text-xs"></textarea></div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white shadow rounded-lg p-6" formGroupName="boatPrices">
        <h3 class="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Tarifs Bateaux</h3>
        <div class="space-y-4">
          <div class="flex justify-between"><label>Flouka</label><input type="number" formControlName="flouka" class="w-24 border rounded px-2"></div>
          <div class="flex justify-between"><label>Speed Boat</label><input type="number" formControlName="speed_boat" class="w-24 border rounded px-2"></div>
          <div class="flex justify-between"><label>Catamaran</label><input type="number" formControlName="catamaran" class="w-24 border rounded px-2"></div>
          <div class="flex justify-between"><label>Yacht</label><input type="number" formControlName="yacht" class="w-24 border rounded px-2"></div>
        </div>
      </div>
      <div class="bg-white shadow rounded-lg p-6" formGroupName="eventPrices">
        <h3 class="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Tarifs Espace Privé</h3>
        <div class="space-y-4">
          <div class="flex justify-between"><label>Anniversaire</label><input type="number" formControlName="birthday" class="w-24 border rounded px-2"></div>
          <div class="flex justify-between"><label>Mariage</label><input type="number" formControlName="marriage" class="w-24 border rounded px-2"></div>
          <div class="flex justify-between"><label>Conférence</label><input type="number" formControlName="conference" class="w-24 border rounded px-2"></div>
          <div class="flex justify-between"><label>Autre</label><input type="number" formControlName="other" class="w-24 border rounded px-2"></div>
        </div>
      </div>
    </div>

    <div class="flex justify-end space-x-4 pt-4">
      <button type="button" (click)="resetForm()" class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Réinitialiser</button>
      <button type="submit" [disabled]="isSaving" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
        {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
      </button>
    </div>

  </form>
</div>
EOF

# 4. MISE A JOUR HEADER PUBLIC (Vue)
# Affiche l'image si logoUrl existe, sinon le texte
echo "4. Mise à jour de header.component.html..."

cat << 'EOF' > ./src/app/components/header/header.component.html
<ng-container *ngIf="settings$ | async as settings">
  <header class="bg-white shadow-md fixed w-full z-50 top-0 left-0 transition-all duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-12">
        
        <div class="flex-shrink-0 flex items-center cursor-pointer" routerLink="/">
          
          <img *ngIf="settings.header?.logoUrl" 
               [src]="settings.header?.logoUrl" 
               alt="Logo" 
               class="h-10 w-auto object-contain">

          <span *ngIf="!settings.header?.logoUrl" class="text-xl font-bold text-blue-600 tracking-wider">
            {{ settings.header?.logoText || 'KYRANIS PARK' }}
          </span>

        </div>

        <nav class="hidden md:flex space-x-6 items-center">
          <a routerLink="/" routerLinkActive="text-blue-600 font-semibold border-b-2 border-blue-600" [routerLinkActiveOptions]="{exact: true}"
             class="text-gray-600 hover:text-blue-500 px-1 py-1 text-sm font-medium transition-colors">
             {{ settings.header?.menuHome || 'Accueil' }}
          </a>
          <a routerLink="/evenements" routerLinkActive="text-blue-600 font-semibold border-b-2 border-blue-600"
             class="text-gray-600 hover:text-blue-500 px-1 py-1 text-sm font-medium transition-colors">
             {{ settings.header?.menuEvents || 'Événements' }}
          </a>
          <a routerLink="/reservations" routerLinkActive="text-blue-600 font-semibold border-b-2 border-blue-600"
             class="text-gray-600 hover:text-blue-500 px-1 py-1 text-sm font-medium transition-colors">
             {{ settings.header?.menuReservations || 'Réservations' }}
          </a>
          <a routerLink="/contact" routerLinkActive="text-blue-600 font-semibold border-b-2 border-blue-600"
             class="text-gray-600 hover:text-blue-500 px-1 py-1 text-sm font-medium transition-colors">
              {{ settings.header?.menuContact || 'Contact' }}
          </a>

          <ng-container *ngIf="user$ | async as user; else loginBtn">
            <div class="flex items-center gap-3 border-l pl-4 ml-2 border-gray-200">
               <a routerLink="/admin" class="text-gray-500 hover:text-blue-600" title="Administration">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                 </svg>
               </a>
               <button (click)="logout()" class="text-red-500 hover:text-red-700" title="Déconnexion">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                 </svg>
               </button>
            </div>
          </ng-container>
          <ng-template #loginBtn></ng-template>
        </nav>

        <div class="flex items-center md:hidden">
          <button (click)="toggleMenu()" type="button" class="text-gray-600 hover:text-gray-900 focus:outline-none">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path *ngIf="!isMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path *ngIf="isMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full" *ngIf="isMenuOpen">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
        <a routerLink="/" (click)="closeMenu()" routerLinkActive="bg-blue-50 text-blue-600" [routerLinkActiveOptions]="{exact: true}" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">{{ settings.header?.menuHome || 'Accueil' }}</a>
        <a routerLink="/evenements" (click)="closeMenu()" routerLinkActive="bg-blue-50 text-blue-600" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">{{ settings.header?.menuEvents || 'Événements' }}</a>
        <a routerLink="/reservations" (click)="closeMenu()" routerLinkActive="bg-blue-50 text-blue-600" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">{{ settings.header?.menuReservations || 'Réservations' }}</a>
        <a routerLink="/contact" (click)="closeMenu()" routerLinkActive="bg-blue-50 text-blue-600" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">{{ settings.header?.menuContact || 'Contact' }}</a>
        
        <div class="border-t border-gray-200 mt-2 pt-2">
           <ng-container *ngIf="user$ | async as user; else mobileLogin">
              <a routerLink="/admin" (click)="closeMenu()" class="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50">Administration</a>
              <button (click)="logout()" class="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">Déconnexion</button>
           </ng-container>
           <ng-template #mobileLogin>
              <a routerLink="/admin-login" (click)="closeMenu()" class="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-gray-900 text-xs">Admin Access</a>
           </ng-template>
        </div>
      </div>
    </div>
  </header>
</ng-container>
<div class="h-12"></div>
EOF

echo "Terminé ! Upload de logo activé dans l'admin (Paramètres)."