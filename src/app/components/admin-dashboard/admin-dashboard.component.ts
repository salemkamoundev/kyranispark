import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent {
  private authService = inject(AuthService);
  private firestoreService = inject(FirestoreService);
  private router = inject(Router);

  currentUser$: Observable<User | null> = this.authService.getCurrentUser();
  
  // Compte uniquement les réservations 'pending' (En attente) pour la notification
  reservationCount$: Observable<number> = this.firestoreService.getReservations().pipe(
    map(reservations => reservations.filter(r => r.status === 'pending').length)
  );

  // Compte tous les événements
  eventCount$: Observable<number> = this.firestoreService.getEvents().pipe(
    map(events => events.length)
  );

  isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/']);
  }
}
