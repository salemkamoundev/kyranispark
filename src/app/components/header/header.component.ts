import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router'; // Import NavigationEnd
import { FirebaseService } from '../../services/firebase.service';
import { FirestoreService } from '../../services/firestore.service';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators'; // Import filter
import { User } from '@angular/fire/auth';
import { AppSettings } from '../../models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  private firebaseService = inject(FirebaseService);
  private firestoreService = inject(FirestoreService);
  private router = inject(Router);

  user$: Observable<User | null> = this.firebaseService.user$;
  isMenuOpen = false;

  settings: AppSettings = {
    businessName: 'Kyranis Park',
    address: '',
    phone: '',
    email: '',
    facebookUrl: '',
    homePageDescription: '',
    parkDescription: '',
    googleMapsEmbed: '',
    header: {
      logoText: 'KYRANIS PARK',
      menuHome: 'Accueil',
      menuEvents: 'Événements',
      menuReservations: 'Réservations',
      menuContact: 'Contact'
    }
  };

  ngOnInit() {
    // 1. Chargement des paramètres
    this.firestoreService.getSettings().subscribe({
      next: (data) => {
        if (data) {
          this.settings = { ...this.settings, ...data };
        }
      },
      error: (err) => console.error('Erreur chargement header', err)
    });

    // 2. FERMETURE AUTOMATIQUE (Sécurité)
    // Écoute chaque changement de page pour fermer le menu
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isMenuOpen = false;
    });
  }

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
