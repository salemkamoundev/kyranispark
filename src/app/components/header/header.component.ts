import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { Observable } from 'rxjs';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  private firebaseService = inject(FirebaseService);
  private router = inject(Router);

  // État de l'utilisateur (null si pas connecté)
  user$: Observable<User | null> = this.firebaseService.user$;
  
  // État du menu mobile
  isMenuOpen = false;

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
