import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/auth/req-register.model';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.html'
})
export class RegisterComponent {

  private authService = inject(AuthService);
  private router = inject(Router);

  showPassword = signal(false);

  form: RegisterRequest = {
    fullName: '',
    userName: '',
    email: '',
    password: ''
  };

  confirmPassword = '';

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  register() {
    if (this.form.password !== this.confirmPassword) {
      alert('Password không khớp');
      return;
    }

    this.authService.register(this.form).subscribe(() => {
      this.router.navigate(['/auth/login']);
    });
  }

  goLogin() {
    this.router.navigate(['/auth/login']);
  }
}