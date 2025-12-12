/**
 * Interface pour la collection 'settings'.
 */
export interface AppSettings {
  businessName: string;
  address: string;
  phone: string;
  email: string;
  facebookUrl: string;
  
  googleMapsEmbed: string;
  homePageDescription: string;
  parkDescription: string;

  // Config Header
  header?: {
    logoText: string;
    logoUrl?: string; // NOUVEAU: URL de l'image
    menuHome: string;
    menuEvents: string;
    menuReservations: string;
    menuContact: string;
  };
}
