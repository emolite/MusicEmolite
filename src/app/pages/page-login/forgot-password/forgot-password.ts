import { Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { OTP_PURPOSE } from '../../../core/constants/otp-purpose.constants';
import { OtpInputComponent } from '../../../shared/components/otp-input/otp-input';
import { AuthBackgroundComponent } from '../../../shared/components/auth-background/auth-background';

type Step = 'email' | 'reset' | 'done';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, FormsModule, OtpInputComponent, AuthBackgroundComponent],
  templateUrl: './forgot-password.html'
})
export class ForgotPasswordComponent implements OnDestroy {

  private authService = inject(AuthService);
  private router = inject(Router);

  step = signal<Step>('email');
  loading = signal(false);
  error = signal('');
  resendCountdown = signal(0);
  showPassword = signal(false);
  passwordError = signal('');

  email = '';
  code = '';
  newPassword = '';
  confirmPassword = '';

  stepIndex = computed(() => {
    switch (this.step()) {
      case 'email': return 0;
      case 'reset': return 1;
      case 'done': return 2;
    }
  });

  private countdownTimer: ReturnType<typeof setInterval> | null = null;

  validatePassword() {
    const password = this.newPassword;
    if (!password) {
      this.passwordError.set('');
      return;
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasMinLength = password.length >= 8;

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial || !hasMinLength) {
      this.passwordError.set(
        'Mật khẩu phải có chữ hoa, chữ thường, số, ký tự đặc biệt và tối thiểu 8 ký tự'
      );
      return;
    }

    this.passwordError.set('');
  }

  sendOtp() {
    const email = this.email.trim();

    if (!email) {
      this.error.set('Vui lòng nhập email');
      return;
    }

    this.error.set('');
    this.loading.set(true);

    this.authService.sendOtp(email, OTP_PURPOSE.RESET_PASSWORD).subscribe({
      next: (res) => {
        this.loading.set(false);

        if (res?.code !== '200') {
          this.error.set(res?.message || 'Không gửi được mã OTP');
          return;
        }

        this.step.set('reset');
        this.startCountdown();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Không gửi được mã OTP');
      }
    });
  }

  resendOtp() {
    if (this.resendCountdown() > 0 || this.loading()) {
      return;
    }

    this.sendOtp();
  }

  private startCountdown() {
    this.resendCountdown.set(60);

    this.countdownTimer = setInterval(() => {
      const next = this.resendCountdown() - 1;

      if (next <= 0) {
        this.resendCountdown.set(0);

        if (this.countdownTimer) {
          clearInterval(this.countdownTimer);
          this.countdownTimer = null;
        }

        return;
      }

      this.resendCountdown.set(next);
    }, 1000);
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  resetPassword() {
    if (!this.code.trim()) {
      this.error.set('Vui lòng nhập mã OTP');
      return;
    }

    this.validatePassword();

    if (this.passwordError()) {
      this.error.set(this.passwordError());
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error.set('Mật khẩu xác nhận không khớp');
      return;
    }

    this.error.set('');
    this.loading.set(true);

    this.authService.resetPassword({
      email: this.email.trim(),
      code: this.code.trim(),
      newPassword: this.newPassword
    }).subscribe({
      next: (res) => {
        this.loading.set(false);

        if (res?.code !== '200') {
          this.error.set(res?.message || 'Đặt lại mật khẩu thất bại');
          return;
        }

        this.step.set('done');

        if (this.countdownTimer) {
          clearInterval(this.countdownTimer);
          this.countdownTimer = null;
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Đặt lại mật khẩu thất bại');
      }
    });
  }

  backToEmailStep() {
    this.step.set('email');
    this.error.set('');
    this.code = '';
    this.passwordError.set('');
  }

  goLogin() {
    this.router.navigate(['/auth/login']);
  }

  ngOnDestroy() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  }
}
