import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';

export const routes: Routes = [
  // --- ROUTES PUBLIQUES (Lazy Loaded) ---
  { 
    path: '', 
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) 
  },
  { 
    path: 'evenements', 
    loadComponent: () => import('./pages/evenements/evenements.component').then(m => m.EvenementsComponent) 
  },
  { 
    path: 'reservations', 
    loadComponent: () => import('./pages/reservations/reservations.component').then(m => m.ReservationsComponent) 
  },
  { 
    path: 'contact', 
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent) 
  },
  { 
    path: 'admin-login', 
    loadComponent: () => import('./pages/admin-login/admin-login.component').then(m => m.AdminLoginComponent) 
  },

  // --- ADMIN ROUTES (Lazy Loaded Children) ---
  { 
    path: 'admin', 
    loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'stats', pathMatch: 'full' },
      { 
        path: 'stats', 
        loadComponent: () => import('./components/admin-dashboard/dashboard-stats/dashboard-stats.component').then(m => m.DashboardStatsComponent) 
      },
      { 
        path: 'events', 
        loadComponent: () => import('./components/admin-dashboard/manage-events/manage-events.component').then(m => m.ManageEventsComponent) 
      },
      { 
        path: 'reservations', 
        loadComponent: () => import('./components/admin-dashboard/manage-reservations/manage-reservations.component').then(m => m.ManageReservationsComponent) 
      },
      { 
        path: 'settings', 
        loadComponent: () => import('./components/admin-dashboard/settings/settings.component').then(m => m.SettingsComponent) 
      }
    ]
  },

  // --- 404 ---
  { path: '**', component: PageNotFoundComponent }
];
