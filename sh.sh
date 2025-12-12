#!/bin/bash

echo "=================================================="
echo "  CORRECTION SIDEBAR ADMIN (FERMETURE AUTO)"
echo "=================================================="

# On met à jour le composant TS pour fermer la sidebar à chaque navigation

cat << 'EOF' > ./src/app/components/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router'; // Import NavigationEnd
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators'; // Import filter
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private firestoreService = inject(FirestoreService);
  private router = inject(Router);

  currentUser$: Observable<User | null> = this.authService.getCurrentUser();
  
  // Compteurs pour les badges
  reservationCount$: Observable<number> = this.firestoreService.getReservations().pipe(
    map(reservations => reservations.filter(r => r.status === 'pending').length)
  );
  
  eventCount$: Observable<number> = this.firestoreService.getEvents().pipe(
    map(events => events.length)
  );

  isSidebarOpen = false;

  ngOnInit() {
    // FERMETURE AUTOMATIQUE EN RESPONSIVE
    // À chaque changement d'URL (fin de navigation), on ferme la sidebar
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isSidebarOpen = false;
    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  // Méthode explicite pour fermer (utilisable depuis le HTML si besoin)
  closeSidebar() {
    this.isSidebarOpen = false;
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/']);
  }
}
EOF

echo "Terminé. Le menu admin se fermera désormais automatiquement sur mobile après un clic."