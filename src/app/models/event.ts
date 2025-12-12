/**
 * Interface représentant un événement dans la collection 'events'.
 * Les images et vidéos sont stockées sur Supabase Storage.
 */
export interface Event {
  /** ID unique auto-généré par Firestore */
  eventId?: string;
  
  title: string;
  description: string;
  
  /** Date et heure de l'événement (Firestore Timestamp converti en Date) */
  date: Date;
  
  location: string;
  
  /** Tableau d'URLs publiques venant de Supabase */
  galleryImages: string[];
  
  /** Tableau d'URLs publiques venant de Supabase */
  galleryVideos: string[];
  
  createdAt: Date;
  updatedAt: Date;
}
