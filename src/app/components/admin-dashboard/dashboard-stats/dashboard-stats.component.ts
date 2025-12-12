import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../../services/firestore.service';
import { forkJoin } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Event, Reservation, Gallery } from '../../../models';

@Component({
  selector: 'app-dashboard-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-stats.component.html',
  styleUrls: ['./dashboard-stats.component.scss']
})
export class DashboardStatsComponent implements OnInit {
  private firestoreService = inject(FirestoreService);

  isLoading = true;

  stats = {
    revenue: {
      total: 0,
      monthly: [] as { month: string, amount: number, height: number }[]
    },
    reservations: {
      total: 0,
      pending: 0,
      confirmed: 0,
      cancelled: 0
    },
    events: {
      total: 0,
      upcoming: 0,
      past: 0
    },
    media: {
      totalImages: 0,
      totalVideos: 0
    }
  };

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    forkJoin({
      reservations: this.firestoreService.getReservations().pipe(take(1)),
      events: this.firestoreService.getEvents().pipe(take(1)),
      galleries: this.firestoreService.getGalleries().pipe(take(1))
    }).subscribe({
      next: (data) => {
        this.processReservations(data.reservations as Reservation[]);
        this.processEvents(data.events as Event[]);
        this.processMedia(data.events as Event[], data.galleries as Gallery[]);
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement stats', err);
        this.isLoading = false;
      }
    });
  }

  processReservations(reservations: Reservation[]) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const monthlyData = new Array(12).fill(0);

    let totalRev = 0;
    let pending = 0;
    let confirmed = 0;
    let cancelled = 0;

    reservations.forEach(res => {
      if (res.status === 'pending') pending++;
      if (res.status === 'confirmed') confirmed++;
      if (res.status === 'cancelled') cancelled++;

      if (res.status === 'confirmed') {
        totalRev += (res.totalPrice || 0);
        const d = res.date instanceof Date ? res.date : new Date(res.date);
        if (d.getFullYear() === currentYear) {
          monthlyData[d.getMonth()] += (res.totalPrice || 0);
        }
      }
    });

    this.stats.reservations = {
      total: reservations.length,
      pending,
      confirmed,
      cancelled
    };
    
    const maxRev = Math.max(...monthlyData, 1);
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    this.stats.revenue = {
      total: totalRev,
      monthly: monthlyData.map((amount, index) => ({
        month: months[index],
        amount: amount,
        height: Math.round((amount / maxRev) * 100)
      }))
    };
  }

  processEvents(events: Event[]) {
    const now = new Date();
    let upcoming = 0;
    let past = 0;

    events.forEach(e => {
      const d = e.date instanceof Date ? e.date : new Date(e.date);
      if (d >= now) upcoming++;
      else past++;
    });

    this.stats.events = {
      total: events.length,
      upcoming,
      past
    };
  }

  processMedia(events: Event[], galleries: Gallery[]) {
    let imgCount = 0;
    let vidCount = 0;

    events.forEach(e => {
      if (e.galleryImages) imgCount += e.galleryImages.length;
      if (e.galleryVideos) vidCount += e.galleryVideos.length;
    });

    galleries.forEach(g => {
      if (g.images) imgCount += g.images.length;
      if (g.videos) vidCount += g.videos.length;
    });

    this.stats.media = {
      totalImages: imgCount,
      totalVideos: vidCount
    };
  }
}
