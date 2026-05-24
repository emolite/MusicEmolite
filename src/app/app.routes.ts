import { Routes } from '@angular/router';
import { URL_END } from './core/constants/url-end.constants';
import { HomeComponent } from './pages/page-user/home/home';
import { PlayerComponent } from './pages/page-user/players/player';
import { DiscoverComponent } from './pages/page-user/discover/discover';
import { LayoutUserComponent } from './layout/layout-user';
import { LayoutAdminComponent } from './layout/layout-login/layout-login';
import { LoginComponent } from './pages/page-login/login/login';
import { RegisterComponent } from './pages/page-login/register/register';
import { AlbumComponent } from './pages/page-user/album/album';
import { PlayerBarDetailComponent } from './pages/page-user/player-bar/player-bar-detail/player-bar-detail';
import { PlaylistComponent } from './pages/page-user/playlist/playlist';
import { AlbumDetailComponent } from './pages/page-user/album/album-detail/album-detail';

export const routes: Routes = [
    {
        path: '',
        redirectTo: `${URL_END.USER.BASE}/${URL_END.USER.HOME}`,
        pathMatch: 'full'
    },
    {
        path: URL_END.AUTH.BASE,
        component: LayoutAdminComponent,
        children: [
            {
                path: URL_END.AUTH.LOGIN,
                component: LoginComponent
            },
            {
                path: URL_END.AUTH.REGISTER,
                component: RegisterComponent
            }
        ]
    },
    {
        path: URL_END.USER.BASE,
        component: LayoutUserComponent,
        children: [
            {
                path: URL_END.USER.HOME,
                component: HomeComponent
            },
            {
                path: URL_END.USER.PLAYLIST,
                component: PlaylistComponent
            },
            {
                path: URL_END.USER.ALBUM,
                component: AlbumComponent
            },
            {
                path: URL_END.USER.ALBUM_DETAIL,
                component: AlbumDetailComponent
            },
            {
                path: URL_END.USER.DISCOVER,
                component: DiscoverComponent
            }
        ]
    },
    {
        path: URL_END.USER.SETTING,
        loadChildren: () => import('./pages/page-user/settings/settings.routes').then(m => m.SETTINGS_ROUTES)
    },
    {
        path: URL_END.ADMIN.BASE,
        loadChildren: () => import('./pages/page-admin/admin.routes').then(m => m.ADMIN_ROUTES)
    }

];
