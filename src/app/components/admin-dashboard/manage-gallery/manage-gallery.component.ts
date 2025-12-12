import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FirestoreService } from '../../../services/firestore.service';
import { SupabaseService } from '../../../services/supabase.service';
import { Gallery } from '../../../models';

@Component({
  selector: 'app-manage-gallery',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manage-gallery.component.html',
  styleUrls: ['./manage-gallery.component.scss']
})
export class ManageGalleryComponent implements OnInit {
  private firestoreService = inject(FirestoreService);
  private supabaseService = inject(SupabaseService);
  private fb = inject(FormBuilder);

  galleries: Gallery[] = [];
  
  isModalOpen = false;
  isSubmitting = false;
  isUploading = false;
  
  currentGalleryId: string | null = null;
  galleryForm: FormGroup;
  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';

  constructor() {
    this.galleryForm = this.fb.group({
      name: ['', Validators.required],
      category: ['park', Validators.required], // Défaut 'park' pour l'accueil
      images: [[]],
      videos: [[]] // Pour futur usage
    });
  }

  ngOnInit(): void {
    this.loadGalleries();
  }

  loadGalleries() {
    // On charge spécifiquement les galeries 'park' car c'est la demande principale (Notre Galerie)
    // Mais on peut enlever le filtre pour tout voir.
    this.firestoreService.getGalleries('park').subscribe({
      next: (data) => {
        this.galleries = data;
      },
      error: (e) => this.showToast('Erreur chargement galeries', 'error')
    });
  }

  openCreateModal() {
    this.currentGalleryId = null;
    this.galleryForm.reset({ 
      name: '', 
      category: 'park', 
      images: [], 
      videos: [] 
    });
    this.isModalOpen = true;
  }

  openEditModal(gallery: Gallery) {
    this.currentGalleryId = gallery.galleryId || null;
    this.galleryForm.patchValue({
      name: gallery.name,
      category: gallery.category,
      images: gallery.images || [],
      videos: gallery.videos || []
    });
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  // --- GESTION SUPABASE ---

  async handleFileUpload(event: any) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    this.isUploading = true;
    const currentUrls = this.galleryForm.get('images')?.value || [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Upload vers dossier 'gallery'
        const result = await this.supabaseService.uploadImage(file, 'gallery');
        currentUrls.push(result.url);
      }
      
      this.galleryForm.patchValue({ images: currentUrls });
      this.showToast('Images ajoutées avec succès', 'success');
    } catch (error) {
      console.error(error);
      this.showToast('Erreur upload Supabase', 'error');
    } finally {
      this.isUploading = false;
      event.target.value = '';
    }
  }

  async removeImage(url: string) {
    if (!confirm('Supprimer cette image définitivement (Supabase & Base de données) ?')) return;

    try {
      // 1. Suppression physique chez Supabase
      await this.supabaseService.deleteFileByUrl(url);

      // 2. Mise à jour du formulaire local
      const currentUrls = this.galleryForm.get('images')?.value || [];
      const newUrls = currentUrls.filter((u: string) => u !== url);
      this.galleryForm.patchValue({ images: newUrls });

      // 3. Si on est en mode édition, on sauvegarde tout de suite pour synchroniser Firestore
      if (this.currentGalleryId) {
        await this.saveGallery(true); // true = silent save (pas de fermeture modal)
      } else {
        this.showToast('Image supprimée (pensez à sauvegarder l\'album)', 'success');
      }

    } catch (error) {
      console.error(error);
      this.showToast('Erreur lors de la suppression', 'error');
    }
  }

  // --- CRUD FIRESTORE ---

  async saveGallery(silent = false) {
    if (this.galleryForm.invalid) return;

    this.isSubmitting = true;
    const formData = this.galleryForm.value;
    
    // Objet Gallery
    const galleryData: any = {
      name: formData.name,
      category: formData.category,
      images: formData.images,
      videos: formData.videos
    };

    try {
      if (this.currentGalleryId) {
        await this.firestoreService.updateGallery(this.currentGalleryId, galleryData);
        if(!silent) this.showToast('Album mis à jour', 'success');
      } else {
        await this.firestoreService.addGallery(galleryData);
        if(!silent) this.showToast('Album créé', 'success');
      }
      
      if (!silent) {
        this.closeModal();
        // Pas besoin de recharger loadGalleries() car c'est un Observable en temps réel via firestoreService
      }
    } catch (error) {
      this.showToast('Erreur sauvegarde', 'error');
    } finally {
      this.isSubmitting = false;
    }
  }

  async confirmDelete(galleryId: string) {
    if(!confirm('Voulez-vous supprimer cet album complet ? Les images ne seront pas supprimées de Supabase automatiquement ici (sauf implémentation avancée).')) return;
    
    try {
      await this.firestoreService.deleteGallery(galleryId);
      this.showToast('Album supprimé', 'success');
    } catch (e) {
      this.showToast('Erreur suppression', 'error');
    }
  }

  showToast(msg: string, type: 'success' | 'error') {
    this.toastMessage = msg;
    this.toastType = type;
    setTimeout(() => this.toastMessage = null, 3000);
  }
}
