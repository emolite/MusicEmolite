import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PlayerService } from '../../../core/services/player.service';
import { ChatHubService } from '../../../core/services/chat-hub.service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.html'
})
export class AdminSidebarComponent {
  private router = inject(Router);
  public authService = inject(AuthService)
  private player = inject(PlayerService);
  private chatHubService = inject(ChatHubService);
  user = this.authService.user;

  get displayName(): string {
    const user = this.authService.user();
    return user?.profile?.fullName || user?.username || '';
  }

  get profileUri(): string | null {
    return this.authService.user()?.profile?.uri ?? null;
  }
  logout() {
    localStorage.removeItem('currentUser');

    this.authService.logout();
    this.chatHubService.stop();
    this.player.stop();
    this.router.navigate(['/auth/login']);
  }
}