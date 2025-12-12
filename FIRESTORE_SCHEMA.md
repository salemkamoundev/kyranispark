# Documentation du Schéma Firestore - KyranisPark

## 1. Collection `events`
Stocke les événements publics.
| Champ | Type | Description |
|-------|------|-------------|
| `eventId` | string | Auto-ID Firestore |
| `title` | string | Titre de l'événement |
| `description` | string | Description complète |
| `date` | timestamp | Date de l'événement |
| `location` | string | Lieu (ex: "Salle Principale") |
| `galleryImages` | string[] | Liste d'URLs (Supabase) |
| `galleryVideos` | string[] | Liste d'URLs (Supabase) |
| `createdAt` | timestamp | Date de création |
| `updatedAt` | timestamp | Dernière modification |

## 2. Collection `reservations`
Gestion des réservations Bateaux et Parc.
| Champ | Type | Description |
|-------|------|-------------|
| `reservationId` | string | Auto-ID Firestore |
| `type` | string | 'boat' ou 'park' |
| `fullName` | string | Nom complet du client |
| `email` | string | Email de contact |
| `phone` | string | Téléphone |
| `date` | timestamp | Date de réservation |
| `time` | string | Heure (ex: "14:00") |
| `numberOfPeople` | number | Nombre de pax |
| `boatType` | string | (Optionnel) Type de bateau |
| `eventType` | string | (Optionnel) Type d'événement Parc |
| `status` | string | 'pending', 'confirmed', 'cancelled' |
| `totalPrice` | number | Prix total |

## 3. Collection `settings`
Document unique (ex: ID `main_settings`) pour la configuration globale.
| Champ | Type | Description |
|-------|------|-------------|
| `businessName` | string | Nom de l'entreprise |
| `address` | string | Adresse physique |
| `googleMapsEmbed` | string | Iframe ou URL Maps |
| `homePageDescription` | string | Texte introductif Accueil |

## 4. Collection `galleries`
Albums photos/vidéos organisés.
| Champ | Type | Description |
|-------|------|-------------|
| `galleryId` | string | Auto-ID |
| `category` | string | 'park', 'events', 'boats' |
| `images` | string[] | URLs Supabase |
