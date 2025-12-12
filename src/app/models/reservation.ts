export type ReservationType = 'boat' | 'park';
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

/**
 * Interface représentant une réservation dans la collection 'reservations'.
 * Gère les cas spécifiques pour les bateaux ou le parc.
 */
export interface Reservation {
  /** ID unique */
  reservationId?: string;
  
  type: ReservationType;
  
  // Informations client
  fullName: string;
  email: string;
  phone: string;
  
  // Détails temporels
  date: Date;
  time: string; // Format 'HH:mm'
  
  numberOfPeople: number;
  
  // Champs conditionnels selon le type
  /** Requis si type === 'boat' */
  boatType?: string;
  
  /** Requis si type === 'park' (ex: Mariage, Conférence) */
  eventType?: string;
  
  specialRequests?: string;
  
  status: ReservationStatus;
  
  /** Prix calculé total */
  totalPrice: number;
  
  createdAt: Date;
}
