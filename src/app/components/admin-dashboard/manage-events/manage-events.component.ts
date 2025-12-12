import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FirestoreService } from '../../../services/firestore.service';
import { SupabaseService } from '../../../services/supabase.service';
import { Event } from '../../../models';

@Component({
  selector: 'app-manage-events',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manage-events.component.html',
  styleUrls: ['./manage-events.component.scss']
})
export class ManageEventsComponent implements OnInit {
  private firestoreService = inject(FirestoreService);
  private supabaseService = inject(SupabaseService);
  private fb = inject(FormBuilder);

  events: Event[] = [];
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  // Modal State
  isModalOpen = false;
  isDeleteModalOpen = false;
  isSubmitting = false;
  isUploading = false;
  
  currentEventId: string | null = null;
  eventToDeleteId: string | null = null;

  eventForm: FormGroup;
  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';

  constructor() {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      date: ['', Validators.required],
      location: ['', Validators.required],
      galleryImages: [[]],
      galleryVideos: [[]]
    });
  }

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents() {
    this.firestoreService.getEvents().subscribe({
      next: (data: Event[]) => {
        this.events = data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.updatePagination();
      },
      error: (err: any) => this.showToast('Erreur lors du chargement des événements', 'error')
    });
  }

  get paginatedEvents(): Event[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.events.slice(startIndex, startIndex + this.itemsPerPage);
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.events.length / this.itemsPerPage) || 1;
    if (this.currentPage > this.totalPages) this.currentPage = 1;
  }

  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }

  openCreateModal() {
    this.currentEventId = null;
    this.eventForm.reset({ galleryImages: [], galleryVideos: [] });
    this.isModalOpen = true;
  }

  openEditModal(event: Event) {
    this.currentEventId = event.eventId || null;
    const dateObj = new Date(event.date);
    const dateStr = dateObj.toISOString().split('T')[0];

    this.eventForm.patchValue({
      title: event.title,
      description: event.description,
      location: event.location,
      date: dateStr,
      galleryImages: event.galleryImages || [],
      galleryVideos: event.galleryVideos || []
    });
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.eventForm.reset();
  }

  async handleFileUpload(event: any, type: 'image' | 'video') {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    this.isUploading = true;
    const currentUrls = type === 'image' 
      ? this.eventForm.get('galleryImages')?.value || []
      : this.eventForm.get('galleryVideos')?.value || [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let result;
        
        if (type === 'image') {
          result = await this.supabaseService.uploadImage(file, 'events/images');
        } else {
          result = await this.supabaseService.uploadVideo(file, 'events/videos');
        }
        currentUrls.push(result.url);
      }
      
      if (type === 'image') this.eventForm.patchValue({ galleryImages: currentUrls });
      else this.eventForm.patchValue({ galleryVideos: currentUrls });

      this.showToast('Fichiers téléchargés avec succès !', 'success');
    } catch (error) {
      console.error(error);
      this.showToast('Erreur lors du téléchargement', 'error');
    } finally {
      this.isUploading = false;
      event.target.value = ''; 
    }
  }

  async removeMedia(url: string, type: 'image' | 'video') {
    if (!confirm('Voulez-vous supprimer ce média ?')) return;
    const field = type === 'image' ? 'galleryImages' : 'galleryVideos';
    const currentUrls = this.eventForm.get(field)?.value || [];
    const newUrls = currentUrls.filter((u: string) => u !== url);
    this.eventForm.patchValue({ [field]: newUrls });
  }

  async saveEvent() {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formVal = this.eventForm.value;

    const eventData: any = {
      title: formVal.title,
      description: formVal.description,
      location: formVal.location,
      date: new Date(formVal.date),
      galleryImages: formVal.galleryImages,
      galleryVideos: formVal.galleryVideos
    };

    try {
      if (this.currentEventId) {
        await this.firestoreService.updateEvent(this.currentEventId, eventData);
        this.showToast('Événement mis à jour', 'success');
      } else {
        await this.firestoreService.addEvent(eventData);
        this.showToast('Événement créé', 'success');
      }
      this.closeModal();
      this.loadEvents();
    } catch (error) {
      console.error(error);
      this.showToast('Erreur lors de la sauvegarde', 'error');
    } finally {
      this.isSubmitting = false;
    }
  }

  confirmDelete(eventId: string) {
    this.eventToDeleteId = eventId;
    this.isDeleteModalOpen = true;
  }

  async deleteEvent() {
    if (!this.eventToDeleteId) return;

    try {
      await this.firestoreService.deleteEvent(this.eventToDeleteId);
      this.showToast('Événement supprimé', 'success');
      this.loadEvents();
    } catch (error) {
      this.showToast('Erreur suppression', 'error');
    } finally {
      this.isDeleteModalOpen = false;
      this.eventToDeleteId = null;
    }
  }

  showToast(msg: string, type: 'success' | 'error') {
    this.toastMessage = msg;
    this.toastType = type;
    setTimeout(() => this.toastMessage = null, 3000);
  }

  getStatus(date: Date): string {
    return new Date(date) < new Date() ? 'Passé' : 'À Venir';
  }
}
