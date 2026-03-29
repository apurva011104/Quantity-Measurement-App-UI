import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Profile } from './pages/profile/profile';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'dashboard', component: Dashboard },
  {
      path: 'profile',
      loadComponent: () => import('./pages/profile/profile').then(m => m.Profile),
      runGuardsAndResolvers: 'always'   // ⭐ IMPORTANT
    }
];