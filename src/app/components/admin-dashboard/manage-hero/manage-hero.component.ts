import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FirestoreService } from '../../../services/firestore.service';
import { SupabaseService } from '../../../services/supabase.service';
import { HeroSlide } from '../../../models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-manage-hero',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manage-hero.component.html',
  styleUrls: ['./manage-hero.component.scss']
})
export class ManageHeroComponent {
  private firestoreService = inject(FirestoreService);
  private supabaseService = inject(SupabaseService);
  private fb = inject(FormBuilder);

  slides$: Observable<HeroSlide[]> = this.firestoreService.getHeroSlides();
  
  slideForm: FormGroup;
  previewUrl: string | null = null;
  uploadedFileUrl: string | null = null;
  
  isUploading = false;
  isSubmitting = false;
  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';

  constructor() {
    this.slideForm = this.fb.group({
      title: ['', Validators.required],
      subtitle: ['', Validators.required]
    });
  }

  async handleFileUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isUploading = true;
    
    // Preview immédiate
    const reader = new FileReader();
    reader.onload = (e: any) => this.previewUrl = e.target.result;
    reader.readAsDataURL(file);

    try {
      const result = await this.supabaseService.uploadImage(file, 'hero');
      this.uploadedFileUrl = result.url;
      this.showToast('Image uploadée !', 'success');
    } catch (error) {
      console.error(error);
      this.showToast('Erreur upload', 'error');
      this.previewUrl = null;
    } finally {
      this.isUploading = false;
    }
  }

  async addSlide() {
    if (this.slideForm.invalid || !this.uploadedFileUrl) return;

    this.isSubmitting = true;
    const { title, subtitle } = this.slideForm.value;

    const newSlide: HeroSlide = {
      imageUrl: this.uploadedFileUrl,
      title,
      subtitle,
      createdAt: new Date()
    };

    try {
      await this.firestoreService.addHeroSlide(newSlide);
      this.showToast('Slide ajoutée !', 'success');
      this.resetForm();
    } catch (error) {
      this.showToast('Erreur sauvegarde', 'error');
    } finally {
      this.isSubmitting = false;
    }
  }

  async deleteSlide(slide: HeroSlide) {
    if(!slide.id || !confirm('Supprimer cette slide ?')) return;

    try {
      // Suppression de l'image sur Supabase (clean up)
      if (slide.imageUrl) {
        await this.supabaseService.deleteFileByUrl(slide.imageUrl).catch(e => console.log('Supabase file not found or error', e));
      }
      
      // Suppression Firestore
      await this.firestoreService.deleteHeroSlide(slide.id);
      this.showToast('Slide supprimée', 'success');
    } catch (error) {
      this.showToast('Erreur suppression', 'error');
    }
  }

  resetForm() {
    this.slideForm.reset();
    this.previewUrl = null;
    this.uploadedFileUrl = null;
  }

  showToast(msg: string, type: 'success' | 'error') {
    this.toastMessage = msg;
    this.toastType = type;
    setTimeout(() => this.toastMessage = null, 3000);
  }
}
