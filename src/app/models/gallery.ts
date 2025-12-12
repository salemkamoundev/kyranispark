export type GalleryCategory = 'park' | 'events' | 'boats';

/**
 * Interface pour la collection 'galleries'.
 * Permet de grouper des médias par catégorie pour l'affichage.
 */
export interface Gallery {
  galleryId?: string;
  name: string;
  
  /** URLs Supabase */
  images: string[];
  
  /** URLs Supabase */
  videos: string[];
  
  category: GalleryCategory;
  
  createdAt: Date;
}
