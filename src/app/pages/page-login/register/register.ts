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
  emailError = signal('');
  checkingEmail = signal(false);
  usernameError = signal('');
  passwordError = signal('');
  form: RegisterRequest = {
    fullName: '',
    userName: '',
    email: '',
    password: ''
  };

  confirmPassword = '';

  validateUsername(event?: Event) {

    const input = event?.target as HTMLInputElement;

    if (input) {

      input.value = input.value
        .replace(/[^a-zA-Z0-9_]/g, '');

      this.form.userName = input.value;
    }

    this.usernameError.set('');
  }

  validatePassword() {
    const password = this.form.password;
    if (!password) {
      this.passwordError.set('');
      return;
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial =
      /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasMinLength =
      password.length >= 8;

    if (
      !hasUppercase ||
      !hasLowercase ||
      !hasNumber ||
      !hasSpecial ||
      !hasMinLength
    ) {

      this.passwordError.set(
        'Mật khẩu phải có chữ hoa, chữ thường, số, ký tự đặc biệt và tối thiểu 8 ký tự'
      );

      return;
    }

    this.passwordError.set('');
  }

  checkEmail() {
    if (!this.form.email?.trim()) {
      this.emailError.set('');
      return;
    }

    this.checkingEmail.set(true);

    this.authService
      .checkEmail(this.form.email)
      .subscribe({
        next: (res) => {
          if (res.data) {
            this.emailError.set('Email đã tồn tại');
          }
          else {
            this.emailError.set('');
          }
          this.checkingEmail.set(false);
        },
        error: () => {
          this.emailError.set('');
          this.checkingEmail.set(false);
        }
      });
  }
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