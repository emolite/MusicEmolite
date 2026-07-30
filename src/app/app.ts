import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router'
import { AuthService } from './core/services/auth.service';
import { ToastComponent } from './shared/components/toast/toast';
import { UserService } from './core/services/user.service';
import { ChatHubService } from './core/services/chat-hub.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private chatHubService = inject(ChatHubService);
  private router = inject(Router);
  protected readonly title = signal('MusicEmolite');

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (!token) return;
    this.authService.getCurrentUser().subscribe({
      next: (res: any) => {
        this.authService.user.set(res.data);
        this.chatHubService.start();
      },
      error: () => {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
      }
    });
    this.userService.getUserProfile().subscribe();
  }
}
