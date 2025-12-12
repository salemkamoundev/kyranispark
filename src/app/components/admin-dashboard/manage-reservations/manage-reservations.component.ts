import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../../services/firestore.service';
import { Reservation, ReservationStatus } from '../../../models';

@Component({
  selector: 'app-manage-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './manage-reservations.component.html',
  styleUrls: ['./manage-reservations.component.scss']
})
export class ManageReservationsComponent implements OnInit {
  private firestoreService = inject(FirestoreService);

  allReservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];

  searchTerm: string = '';
  filterType: string = 'all';
  filterStatus: string = 'all';

  sortColumn: string = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  isDetailModalOpen = false;
  isDeleteModalOpen = false;
  
  selectedReservation: Reservation | null = null;
  reservationToDeleteId: string | null = null;
  
  tempStatus: ReservationStatus = 'pending';
  isUpdating = false;

  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations() {
    this.firestoreService.getReservations().subscribe({
      next: (data: Reservation[]) => {
        this.allReservations = data;
        this.applyFilters();
      },
      error: (err: any) => this.showToast('Erreur chargement réservations', 'error')
    });
  }

  applyFilters() {
    let res = [...this.allReservations];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      res = res.filter(r => 
        r.fullName.toLowerCase().includes(term) || 
        r.email.toLowerCase().includes(term)
      );
    }

    if (this.filterType !== 'all') {
      res = res.filter(r => r.type === this.filterType);
    }

    if (this.filterStatus !== 'all') {
      res = res.filter(r => r.status === this.filterStatus);
    }

    res.sort((a: any, b: any) => {
      let valA = a[this.sortColumn];
      let valB = b[this.sortColumn];

      if (valA instanceof Date) valA = valA.getTime();
      if (valB instanceof Date) valB = valB.getTime();
      
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredReservations = res;
    this.updatePagination();
  }

  setSort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  get paginatedItems(): Reservation[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredReservations.slice(start, start + this.itemsPerPage);
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredReservations.length / this.itemsPerPage) || 1;
    if (this.currentPage > this.totalPages) this.currentPage = 1;
  }

  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }

  openDetailModal(res: Reservation) {
    this.selectedReservation = { ...res };
    this.tempStatus = res.status;
    this.isDetailModalOpen = true;
  }

  closeDetailModal() {
    this.isDetailModalOpen = false;
    this.selectedReservation = null;
  }

  async saveStatus() {
    if (!this.selectedReservation?.reservationId) return;
    
    this.isUpdating = true;
    try {
      await this.firestoreService.updateReservation(
        this.selectedReservation.reservationId, 
        this.tempStatus
      );
      this.showToast('Statut mis à jour avec succès', 'success');
      this.closeDetailModal();
    } catch (error) {
      this.showToast('Erreur mise à jour statut', 'error');
    } finally {
      this.isUpdating = false;
    }
  }

  async quickUpdateStatus(res: Reservation, status: ReservationStatus) {
    if (!res.reservationId) return;
    if (!confirm(`Voulez-vous changer le statut en "${status}" ?`)) return;

    try {
      await this.firestoreService.updateReservation(res.reservationId, status);
      this.showToast(`Réservation ${status}`, 'success');
    } catch (e) {
      this.showToast('Erreur', 'error');
    }
  }

  confirmDelete(id: string) {
    this.reservationToDeleteId = id;
    this.isDeleteModalOpen = true;
  }

  async deleteReservation() {
    if (!this.reservationToDeleteId) return;
    try {
      await this.firestoreService.deleteReservation(this.reservationToDeleteId);
      this.showToast('Réservation supprimée', 'success');
      this.isDeleteModalOpen = false;
    } catch (e) {
      this.showToast('Erreur suppression', 'error');
    }
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  }

  getTypeLabel(type: string): string {
    return type === 'boat' ? 'Bateau' : 'Parc';
  }

  showToast(msg: string, type: 'success' | 'error') {
    this.toastMessage = msg;
    this.toastType = type;
    setTimeout(() => this.toastMessage = null, 3000);
  }

  sendEmailMock() {
    alert("Fonctionnalité d'envoi d'email à implémenter.");
  }
}
