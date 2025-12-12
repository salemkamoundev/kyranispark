import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Reservation } from '../models';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.api.baseUrl}${environment.api.endpoints.sendEmail}`;

  constructor() {}

  /**
   * Envoi générique vers le serveur Node.js
   */
  private async sendEmail(payload: any): Promise<void> {
    try {
      // On convertit l'Observable en Promise pour faciliter l'async/await
      await firstValueFrom(this.http.post(this.apiUrl, payload));
      console.log('Email envoyé avec succès via Node.js');
    } catch (error) {
      console.error('Erreur envoi email:', error);
      throw error;
    }
  }

  /**
   * 1. Confirmation Client
   */
  async sendReservationConfirmation(reservation: Reservation): Promise<void> {
    await this.sendEmail({
      type: 'confirmation',
      to: reservation.email,
      data: {
        name: reservation.fullName,
        date: new Date(reservation.date).toLocaleDateString('fr-FR'),
        time: reservation.time,
        type: reservation.type === 'boat' ? 'Sortie Bateau' : 'Espace Privé',
        price: reservation.totalPrice
      }
    });
  }

  /**
   * 2. Notification Admin
   */
  async sendAdminNotification(reservation: Reservation): Promise<void> {
    await this.sendEmail({
      type: 'admin_notification',
      // L'email admin est géré côté serveur ou via env, ou passé ici
      data: {
        clientName: reservation.fullName,
        phone: reservation.phone,
        date: new Date(reservation.date).toLocaleDateString('fr-FR'),
        status: reservation.status
      }
    });
  }

  /**
   * 3. Réponse Contact
   */
  async sendContactReply(email: string, name: string, message: string): Promise<void> {
    await this.sendEmail({
      type: 'contact_reply',
      to: email,
      data: {
        name: name,
        originalMessage: message
      }
    });
  }
}
