import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router'
import { AuthService } from './core/services/auth.service';
import { ToastComponent } from './shared/components/toast/toast';
import { UserService } from './core/services/user.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private authService = inject(AuthService);
  private userService = inject(UserService)
  protected readonly title = signal('MusicEmolite');

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) return;
    this.authService.getCurrentUser().subscribe({
      next: (res: any) => {
        this.authService.user.set(res.data);
      },
      error: () => {
        localStorage.removeItem('token');
        this.authService.user.set(null);
      }
    });
    this.userService.getUserProfile().subscribe();
  }
}
