import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';
import { AppSettings } from '../../models';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  private firestoreService = inject(FirestoreService);
  
  currentYear: number = new Date().getFullYear();

  // Variable publique utilisée directement dans le HTML
  settings: AppSettings = {
    businessName: 'Kyranis Park',
    address: 'Zone Touristique, Kerkennah',
    phone: '+216 28 417 822',
    email: 'contact@kyranispark.tn',
    facebookUrl: '',
    homePageDescription: 'Bienvenue',
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
    this.firestoreService.getSettings().subscribe({
      next: (data) => {
        if (data) {
          // Fusion pour garder les valeurs par défaut si certaines manquent
          this.settings = { ...this.settings, ...data };
        }
      },
      error: (err) => console.error('Erreur chargement footer', err)
    });
  }
}
