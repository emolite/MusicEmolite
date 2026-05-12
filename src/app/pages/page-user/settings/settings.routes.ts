import { Routes } from '@angular/router';
import { SettingsComponent } from './settings';
import { Profile } from './profile/profile';
import { AddMusicComponent } from './add-music/add-music';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    component: SettingsComponent,
    children: [
      {
        path: 'profile',
        component: Profile
      },
      { path: 'add-music', component: AddMusicComponent },
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full'
      }
    ]
  }
];