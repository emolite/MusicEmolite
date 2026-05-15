import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import {
  LucideAngularModule,
  User,
  LogOut,
  ChevronDown,
  Settings
} from 'lucide-angular';
import { PlayerService } from '../../core/services/player.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  templateUrl: './topbar.html',
  imports: [RouterLink, LucideAngularModule]
})
export class TopbarComponent {

  private router = inject(Router);
  public authService = inject(AuthService);
  private player = inject(PlayerService)

  readonly UserIcon = User;
  readonly LogoutIcon = LogOut;
  readonly ChevronDownIcon = ChevronDown;
  readonly SettingsIcon = Settings;

  openMenu = signal(false);

  get displayName(): string {
    const user = this.authService.user();
    return user?.profile?.fullName || user?.username || '';
  }

  get profileUri(): string | null {
    return this.authService.user()?.profile?.uri ?? null;
  }
  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    if (!this.authService.user()) return;

    this.authService.getCurrentUser()
      .subscribe(res => {
        const uri = res.data?.profile?.uri ?? null;
        const current = this.authService.user();
        if (!current?.profile) return;
        this.authService.user.set({
          ...current,
          profile: {
            ...current?.profile,
            uri
          }
        });
      });
  }
  toggleMenu() {
    this.openMenu.update(v => !v);
  }

  @HostListener('document:click')
  closeMenu() {
    this.openMenu.set(false);
  }

  goRegister() {
    this.router.navigate(['/auth/register']);
  }

  goCreate() {
    this.router.navigate(['/setting/add-music']);
  }

  goProfile() {
    this.router.navigate(['/setting/profile']);
    this.openMenu.set(false);
  }

  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('currentUser');
    this.player.stop();
    this.authService.user.set(null);
    this.router.navigate(['/auth/login']);
  }
}