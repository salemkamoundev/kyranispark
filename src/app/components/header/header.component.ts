import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { FirestoreService } from '../../services/firestore.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '@angular/fire/auth';
import { AppSettings } from '../../models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  private firebaseService = inject(FirebaseService);
  private firestoreService = inject(FirestoreService);
  private router = inject(Router);

  user$: Observable<User | null> = this.firebaseService.user$;
  isMenuOpen = false;

  // Récupération des settings avec des valeurs par défaut pour éviter l'écran blanc
  settings$: Observable<AppSettings> = this.firestoreService.getSettings().pipe(
    map(s => s || {
      businessName: 'Kyranis Park',
      header: {
        logoText: 'KYRANIS PARK',
        menuHome: 'Accueil',
        menuEvents: 'Événements',
        menuReservations: 'Réservations',
        menuContact: 'Contact'
      }
    } as AppSettings)
  );

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  logout() {
    this.firebaseService.logout().subscribe(() => {
      this.closeMenu();
      this.router.navigate(['/']);
    });
  }
}
