import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  signOut, 
  user, 
  User, 
  UserCredential 
} from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { FirebaseApp } from '@angular/fire/app';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  // Injection des dépendances (Angular 18 style)
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private firebaseApp: FirebaseApp = inject(FirebaseApp);

  user$: Observable<User | null> = user(this.auth);

  constructor() {}

  /**
   * Retourne l'instance de l'application Firebase initialisée.
   * Note: L'initialisation réelle se fait généralement dans app.config.ts
   */
  initializeApp(): FirebaseApp {
    return this.firebaseApp;
  }

  /**
   * Connexion utilisateur
   */
  login(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  /**
   * Déconnexion
   */
  logout(): Observable<void> {
    return from(signOut(this.auth));
  }

  /**
   * Récupère l'utilisateur courant sous forme d'Observable
   */
  getCurrentUser(): Observable<User | null> {
    return this.user$;
  }

  /**
   * Vérifie si l'utilisateur a un rôle admin.
   * Cette implémentation vérifie une collection 'users' dans Firestore
   * pour un champ 'role' === 'admin'.
   */
  checkAdminAccess(): Observable<boolean> {
    return this.user$.pipe(
      switchMap((u: User | null) => {
        if (!u) return of(false);
        
        const userDocRef = doc(this.firestore, `users/${u.uid}`);
        return from(getDoc(userDocRef)).pipe(
          map(snapshot => {
            const data = snapshot.data();
            return data ? data['role'] === 'admin' : false;
          }),
          catchError(() => of(false))
        );
      })
    );
  }
}
