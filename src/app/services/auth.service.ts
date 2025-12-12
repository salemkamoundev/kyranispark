import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, authState, User, UserCredential } from '@angular/fire/auth';
import { Observable, from, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);

  // Flux de l'utilisateur courant (null si déconnecté)
  user$: Observable<User | null> = authState(this.auth);

  constructor() {}

  /**
   * Connexion via Email/Password
   */
  login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  /**
   * Déconnexion
   */
  logout(): Promise<void> {
    return signOut(this.auth);
  }

  /**
   * Récupère l'utilisateur courant
   */
  getCurrentUser(): Observable<User | null> {
    return this.user$;
  }

  /**
   * Vérifie si l'utilisateur courant est l'admin défini
   */
  isAdmin(): Observable<boolean> {
    return this.user$.pipe(
      map(user => {
        if (!user) return false;
        // Vérification stricte de l'email
        return user.email === 'admin@gmail.com';
      })
    );
  }
}
