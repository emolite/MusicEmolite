import { Routes } from '@angular/router';
import { AdminLayoutComponent } from '../../layout/layout-admin/layout-admin';
import { AdminProfileComponent } from './admin-profile/admin-profile';
import { AdminAddMusicComponent } from './add-music/add-music';
import { Songs } from './songs/song';
import { PublishLyricsComponent } from './publish-lyrics/publish-lyrics';
import { UsersComponent } from './users/users';
import { AlbumsComponent } from './albums/albums';
import { DashboardComponent } from './dashboard/dashboard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Tổng quan'}
      },
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
        path: 'users',
        component: UsersComponent,
        data: { title: 'Người dùng' }
      },
      {
        path: 'albums',
        component: AlbumsComponent,
        data: { title: 'Albums' }
      },
      {
        path: 'add-music',
        component: AdminAddMusicComponent,
        data: { title: 'Sáng tác' }
      },
      {
        path: 'publish-lyrics',
        component: PublishLyricsComponent,
        data: { title: 'Publish Lyrics'}
      },
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full'
      }
    ]
  }
];