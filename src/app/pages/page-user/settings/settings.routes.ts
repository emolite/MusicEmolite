import { Routes } from '@angular/router';
import { SettingsComponent } from './settings';
import { Profile } from './profile/profile';
import { SettingsArtists } from './artists/artists';
import { AccountSecurity } from './account-security/account-security';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    component: SettingsComponent,
    children: [
      {
        path: 'profile',
        component: Profile
      },
      {
        path: 'artists',
        component: SettingsArtists
      },
      {
        path: 'account',
        component: AccountSecurity
      }
    ]
  }
];