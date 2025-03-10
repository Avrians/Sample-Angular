import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./user-table.component').then(m => m.UserTableComponent),
    data: {
      title: 'DataTable'
    }
  },
];
