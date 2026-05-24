import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PlayerService } from '../../../core/services/player.service';

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
  user = this.authService.user;

  get displayName(): string {
    const user = this.authService.user();
    return user?.profile?.fullName || user?.username || '';
  }

  get profileUri(): string | null {
    return this.authService.user()?.profile?.uri ?? null;
  }
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.player.stop();
    this.authService.user.set(null);
    this.router.navigate(['/auth/login']);
  }
}