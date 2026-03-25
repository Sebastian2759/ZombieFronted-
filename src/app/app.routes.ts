import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Redirect root
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // Auth (public)
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(m => m.LoginComponent),
      },
    ],
  },

  // Protected — shell layout
  {
    path: '',
    loadComponent: () =>
      import('./layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./features/home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'zombies',
        loadComponent: () =>
          import('./features/zombies/zombie-list/zombie-list.component').then(m => m.ZombieListComponent),
      },
      {
        path: 'defense',
        children: [
          {
            path: 'strategy',
            loadComponent: () =>
              import('./features/defense/optimal-strategy/optimal-strategy.component').then(m => m.OptimalStrategyComponent),
          },
          {
            path: 'record',
            loadComponent: () =>
              import('./features/defense/record-defense/record-defense.component').then(m => m.RecordDefenseComponent),
          },
        ],
      },
      {
        path: 'ranking',
        loadComponent: () =>
          import('./features/ranking/ranking.component').then(m => m.RankingComponent),
      },
    ],
  },

  // Wildcard
  { path: '**', redirectTo: '/home' },
];
