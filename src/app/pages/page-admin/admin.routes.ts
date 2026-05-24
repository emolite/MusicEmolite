import { Routes } from '@angular/router';
import { AdminLayoutComponent } from '../../layout/layout-admin/layout-admin';
import { AdminProfileComponent } from './admin-profile/admin-profile';
import { AdminAddMusicComponent } from './add-music/add-music';
import { Songs } from './songs/song';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'songs',
        component: Songs,
        data: { title: 'Bài hát'}
      },
      {
        path: 'profile',
        component: AdminProfileComponent,
        data: { title: 'Thông tin' }
      },
      {
        path: 'add-music',
        component: AdminAddMusicComponent,
        data: { title: 'Sáng tác' }
      },
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full'
      }
    ]
  }
];