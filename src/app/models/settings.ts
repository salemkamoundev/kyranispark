/**
 * Interface pour la collection 'settings' (document unique généralement).
 * Contient les informations globales du site.
 */
export interface AppSettings {
  businessName: string;
  address: string;
  phone: string;
  email: string;
  facebookUrl: string;
  
  /** Code HTML de l'iframe Google Maps ou URL */
  googleMapsEmbed: string;
  
  homePageDescription: string;
  parkDescription: string;
}
