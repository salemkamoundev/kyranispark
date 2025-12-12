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
  limit,
  Timestamp 
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { 
  Event, 
  Reservation, 
  AppSettings, 
  Gallery, 
  ReservationStatus,
  HeroSlide,
  Feedback,
  FeedbackStatus
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore: Firestore = inject(Firestore);

  // --- FEEDBACKS (NOUVEAU) ---

  // Pour l'Admin : Voir tous les feedbacks
  getAllFeedbacks(): Observable<Feedback[]> {
    const ref = collection(this.firestore, 'feedbacks');
    const q = query(ref, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }).pipe(
      map((documents: any[]) => documents.map(doc => this.mapDateFields(doc)))
    ) as Observable<Feedback[]>;
  }

  // Pour le Site Public : Voir seulement les approuvés
  getApprovedFeedbacks(limitCount: number = 3): Observable<Feedback[]> {
    const ref = collection(this.firestore, 'feedbacks');
    const q = query(
      ref, 
      where('status', '==', 'approved'), 
      orderBy('createdAt', 'desc'), 
      limit(limitCount)
    );
    return collectionData(q, { idField: 'id' }).pipe(
      map((documents: any[]) => documents.map(doc => this.mapDateFields(doc)))
    ) as Observable<Feedback[]>;
  }

  // Ajouter un avis (Statut pending par défaut)
  addFeedback(feedback: Partial<Feedback>): Promise<void> {
    const ref = collection(this.firestore, 'feedbacks');
    return addDoc(ref, {
      ...feedback,
      status: 'pending',
      createdAt: Timestamp.now()
    }).then(() => undefined);
  }

  // Modération (Approuver/Rejeter)
  updateFeedbackStatus(id: string, status: FeedbackStatus): Promise<void> {
    const docRef = doc(this.firestore, `feedbacks/${id}`);
    return updateDoc(docRef, { status });
  }

  deleteFeedback(id: string): Promise<void> {
    const docRef = doc(this.firestore, `feedbacks/${id}`);
    return deleteDoc(docRef);
  }

  // --- HERO SLIDER ---
  getHeroSlides(): Observable<HeroSlide[]> {
    const ref = collection(this.firestore, 'hero_slides');
    const q = query(ref, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }).pipe(
      map((documents: any[]) => documents.map(doc => this.mapDateFields(doc)))
    ) as Observable<HeroSlide[]>;
  }

  addHeroSlide(slide: HeroSlide): Promise<void> {
    const ref = collection(this.firestore, 'hero_slides');
    return addDoc(ref, {
      ...slide,
      createdAt: Timestamp.now()
    }).then(() => undefined);
  }

  deleteHeroSlide(id: string): Promise<void> {
    const docRef = doc(this.firestore, `hero_slides/${id}`);
    return deleteDoc(docRef);
  }

  // --- EVENTS ---
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

  // --- RESERVATIONS ---
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

  addReservation(reservation: Reservation): Promise<void> {
    const ref = collection(this.firestore, 'reservations');
    return addDoc(ref, {
      ...reservation,
      createdAt: Timestamp.now(),
      status: 'pending'
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

  // --- SETTINGS ---
  getSettings(): Observable<AppSettings> {
    const docRef = doc(this.firestore, 'settings/main');
    return docData(docRef) as Observable<AppSettings>;
  }

  updateSettings(data: Partial<AppSettings>): Promise<void> {
    const docRef = doc(this.firestore, 'settings/main');
    return setDoc(docRef, data, { merge: true });
  }

  // --- GALLERIES ---
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

  // --- HELPERS ---
  private mapDateFields(data: any): any {
    const converted = { ...data };
    const dateFields = ['date', 'createdAt', 'updatedAt'];
    dateFields.forEach(field => {
      if (converted[field] && typeof converted[field].toDate === 'function') {
        converted[field] = converted[field].toDate();
      }
    });
    return converted;
  }
}
