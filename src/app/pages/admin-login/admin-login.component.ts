import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

import { FooterComponent } from '../../components/footer/footer.component';
@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FooterComponent],
  templateUrl: './admin-login.component.html'
})
export class AdminLoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    try {
      // 1. Tentative de connexion
      await this.authService.login(email, password);
      
      // 2. Vérification si c'est bien l'admin (Double sécurité)
      if (email === 'admin@gmail.com') {
        this.router.navigate(['/admin']);
      } else {
        this.errorMessage = "Accès refusé. Vous n'êtes pas administrateur.";
        await this.authService.logout();
      }
    } catch (error: any) {
      console.error('Login error', error);
      // Gestion basique des erreurs Firebase
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        this.errorMessage = "Email ou mot de passe incorrect.";
      } else if (error.code === 'auth/too-many-requests') {
        this.errorMessage = "Trop de tentatives. Veuillez réessayer plus tard.";
      } else {
        this.errorMessage = "Une erreur est survenue lors de la connexion.";
      }
    } finally {
      this.isLoading = false;
    }
  }
}
