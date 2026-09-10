import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { SidebarComponent } from './sidebar/sidebar';
import { TopbarComponent } from './topbar/topbar';
import { UserFooterComponent } from './user-footer/user-footer';
import { PlayerBarComponent } from '../pages/page-user/player-bar/player-bar';
import { PlayerBarDetailComponent } from '../pages/page-user/player-bar/player-bar-detail/player-bar-detail';
import { PlayerService } from '../core/services/player.service';
import { URL_END } from '../core/constants/url-end.constants';
import { ENVI } from '../../environment/environment';

@Component({
  selector: 'app-layout-user',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, UserFooterComponent, PlayerBarComponent, PlayerBarDetailComponent],
  templateUrl: './layout-user.html',
  styleUrl: './layout-user.css'
})
export class LayoutUserComponent {
  public player = inject(PlayerService)

  private readonly router = inject(Router);
  private readonly homePath = `/${URL_END.USER.BASE}/${URL_END.USER.HOME}`;

  showFooter = signal(this.isHomeUrl(this.router.url));

  readonly androidApkUrl = ENVI.appInfo.androidApkUrl;

  private readonly browserWarningStorageKey = 'browserWarningDismissed';

  /**
   * sessionStorage, not localStorage - dismissing should only last for the
   * current tab/session (closing the browser or opening a new tab shows it
   * again), not hide it forever on that device.
   */
  showBrowserWarning = signal(
    typeof sessionStorage === 'undefined' || sessionStorage.getItem(this.browserWarningStorageKey) !== '1'
  );

  dismissBrowserWarning() {
    this.showBrowserWarning.set(false);

    try {
      sessionStorage.setItem(this.browserWarningStorageKey, '1');
    } catch {
      // sessionStorage unavailable (e.g. private mode) - dismissal just won't persist across reloads.
    }
  }

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        this.showFooter.set(this.isHomeUrl((event as NavigationEnd).urlAfterRedirects));
      });
  }

  private isHomeUrl(url: string): boolean {
    return url.split('?')[0].split('#')[0] === this.homePath;
  }
}