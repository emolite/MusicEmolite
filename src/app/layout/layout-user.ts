import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar';
import { TopbarComponent } from './topbar/topbar';
import { PlayerBarComponent } from '../pages/page-user/player-bar/player-bar';
import { PlayerBarDetailComponent } from '../pages/page-user/player-bar/player-bar-detail/player-bar-detail';
import { PlayerService } from '../core/services/player.service';

@Component({
  selector: 'app-layout-user',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, PlayerBarComponent, PlayerBarDetailComponent],
  templateUrl: './layout-user.html',
  styleUrl: './layout-user.css'
})
export class LayoutUserComponent {
  public player = inject(PlayerService)

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
}