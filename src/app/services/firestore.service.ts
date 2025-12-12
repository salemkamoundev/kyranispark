import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  docData, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query, 
  where, 
  orderBy, 
  Timestamp 
} from '@angular/fire/firestore';
import { Observable, map, from } from 'rxjs';
import { 
  Event, 
  Reservation, 
  AppSettings, 
  Gallery, 
  ReservationStatus 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore: Firestore = inject(Firestore);

  // ==========================================
  // EVENTS
  // ==========================================

  getEvents(): Observable<Event[]> {
    const eventsRef = collection(this.firestore, 'events');
    const q = query(eventsRef, orderBy('date', 'desc'));
    
    return collectionData(q, { idField: 'eventId' }).pipe(
      map((documents: any[]) => documents.map(doc => this.mapDateFields(doc)))
    ) as Observable<Event[]>;
  }

  getEventById(eventId: string): Observable<Event> {
    const docRef = doc(this.firestore, `events/${eventId}`);
    return docData(docRef, { idField: 'eventId' }).pipe(
      map((doc: any) => this.mapDateFields(doc))
    ) as Observable<Event>;
  }

  addEvent(event: Event): Promise<void> {
    const eventsRef = collection(this.firestore, 'events');
    // On laisse Firestore gérer l'ID
    return addDoc(eventsRef, {
      ...event,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }).then(() => undefined);
  }

  updateEvent(eventId: string, data: Partial<Event>): Promise<void> {
    const docRef = doc(this.firestore, `events/${eventId}`);
    return updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  }

  deleteEvent(eventId: string): Promise<void> {
    const docRef = doc(this.firestore, `events/${eventId}`);
    return deleteDoc(docRef);
  }

  // ==========================================
  // RESERVATIONS
  // ==========================================

  /**
   * Récupère les réservations, optionnellement filtrées par type ('boat' | 'park')
   */
  getReservations(type?: 'boat' | 'park'): Observable<Reservation[]> {
    const ref = collection(this.firestore, 'reservations');
    let q = query(ref, orderBy('createdAt', 'desc'));

    if (type) {
      q = query(ref, where('type', '==', type), orderBy('createdAt', 'desc'));
    }

    return collectionData(q, { idField: 'reservationId' }).pipe(
      map((documents: any[]) => documents.map(doc => this.mapDateFields(doc)))
    ) as Observable<Reservation[]>;
  }

  getReservationsByStatus(status: ReservationStatus): Observable<Reservation[]> {
    const ref = collection(this.firestore, 'reservations');
    const q = query(ref, where('status', '==', status), orderBy('createdAt', 'desc'));

    return collectionData(q, { idField: 'reservationId' }).pipe(
      map((documents: any[]) => documents.map(doc => this.mapDateFields(doc)))
    ) as Observable<Reservation[]>;
  }

  addReservation(reservation: Reservation): Promise<void> {
    const ref = collection(this.firestore, 'reservations');
    return addDoc(ref, {
      ...reservation,
      createdAt: Timestamp.now(),
      status: 'pending' // Default status
    }).then(() => undefined);
  }

  updateReservation(reservationId: string, status: ReservationStatus): Promise<void> {
    const docRef = doc(this.firestore, `reservations/${reservationId}`);
    return updateDoc(docRef, { status });
  }

  deleteReservation(reservationId: string): Promise<void> {
    const docRef = doc(this.firestore, `reservations/${reservationId}`);
    return deleteDoc(docRef);
  }

  // ==========================================
  // SETTINGS
  // ==========================================

  /**
   * Nous utilisons un ID unique 'main' pour les settings
   */
  getSettings(): Observable<AppSettings> {
    const docRef = doc(this.firestore, 'settings/main');
    return docData(docRef) as Observable<AppSettings>;
  }

  updateSettings(data: Partial<AppSettings>): Promise<void> {
    const docRef = doc(this.firestore, 'settings/main');
    // setDoc avec { merge: true } crée le document s'il n'existe pas encore
    return setDoc(docRef, data, { merge: true });
  }

  // ==========================================
  // GALLERIES
  // ==========================================

  getGalleries(category?: 'park' | 'events' | 'boats'): Observable<Gallery[]> {
    const ref = collection(this.firestore, 'galleries');
    let q = query(ref, orderBy('createdAt', 'desc'));

    if (category) {
      q = query(ref, where('category', '==', category), orderBy('createdAt', 'desc'));
    }

    return collectionData(q, { idField: 'galleryId' }).pipe(
      map((documents: any[]) => documents.map(doc => this.mapDateFields(doc)))
    ) as Observable<Gallery[]>;
  }

  addGallery(gallery: Gallery): Promise<void> {
    const ref = collection(this.firestore, 'galleries');
    return addDoc(ref, {
      ...gallery,
      createdAt: Timestamp.now()
    }).then(() => undefined);
  }

  updateGallery(galleryId: string, data: Partial<Gallery>): Promise<void> {
    const docRef = doc(this.firestore, `galleries/${galleryId}`);
    return updateDoc(docRef, data);
  }

  deleteGallery(galleryId: string): Promise<void> {
    const docRef = doc(this.firestore, `galleries/${galleryId}`);
    return deleteDoc(docRef);
  }

  // ==========================================
  // HELPERS (Date Conversion)
  // ==========================================

  /**
   * Helper pour convertir les Timestamps Firestore en Date JavaScript.
   * Firestore retourne des objets Timestamp { seconds, nanoseconds } qui ne sont pas
   * directement lisibles par les Pipes Date d'Angular sans conversion.
   */
  private mapDateFields(data: any): any {
    const converted = { ...data };
    
    // Liste des champs susceptibles d'être des dates
    const dateFields = ['date', 'createdAt', 'updatedAt'];

    dateFields.forEach(field => {
      if (converted[field] && typeof converted[field].toDate === 'function') {
        converted[field] = converted[field].toDate();
      }
    });

    return converted;
  }
}
