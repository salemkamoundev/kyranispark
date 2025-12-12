import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FirestoreService } from '../../../services/firestore.service';
import { Feedback, FeedbackStatus } from '../../../models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-manage-feedback',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './manage-feedback.component.html',
  styleUrls: ['./manage-feedback.component.scss']
})
export class ManageFeedbackComponent {
  private firestoreService = inject(FirestoreService);

  feedbacks$: Observable<Feedback[]> = this.firestoreService.getAllFeedbacks();
  
  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';

  getStatusClass(status: string): string {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  }

  getStatusLabel(status: string): string {
    switch(status) {
      case 'approved': return 'Publié';
      case 'rejected': return 'Refusé';
      default: return 'En attente';
    }
  }

  async updateStatus(id: string, status: FeedbackStatus) {
    try {
      await this.firestoreService.updateFeedbackStatus(id, status);
      this.showToast(`Avis ${status === 'approved' ? 'validé' : 'refusé'}`, 'success');
    } catch (e) {
      this.showToast('Erreur mise à jour', 'error');
    }
  }

  async deleteFeedback(id: string) {
    if(!confirm('Supprimer définitivement cet avis ?')) return;
    try {
      await this.firestoreService.deleteFeedback(id);
      this.showToast('Avis supprimé', 'success');
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
