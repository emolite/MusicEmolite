import { Component, inject, signal, OnDestroy } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/auth/req-register.model';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OTP_PURPOSE } from '../../../core/constants/otp-purpose.constants';
import { OtpInputComponent } from '../../../shared/components/otp-input/otp-input';
import { AuthBackgroundComponent } from '../../../shared/components/auth-background/auth-background';

@Component({
  selector: 'app-register',
  imports: [FormsModule, OtpInputComponent, AuthBackgroundComponent],
  templateUrl: './register.html'
})
export class RegisterComponent implements OnDestroy {

  private authService = inject(AuthService);
  private router = inject(Router);

  loading = this.authService.loading;

  showPassword = signal(false);
  emailError = signal('');
  checkingEmail = signal(false);
  checkingUsername = signal(false);
  usernameError = signal('');
  passwordError = signal('');
  form: RegisterRequest = {
    fullName: '',
    userName: '',
    email: '',
    password: ''
  };

  confirmPassword = '';

  otpCode = '';
  otpSent = signal(false);
  emailVerified = signal(false);
  sendingOtp = signal(false);
  verifyingOtp = signal(false);
  otpError = signal('');
  resendCountdown = signal(0);

  private countdownTimer: ReturnType<typeof setInterval> | null = null;

  validateUsername(event?: Event) {

    const input = event?.target as HTMLInputElement;

    if (input) {

      input.value = input.value
        .replace(/[^a-zA-Z0-9_]/g, '');

      this.form.userName = input.value;
    }

    this.usernameError.set('');

    this.checkUsername();
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

  onEmailInput() {
    this.emailError.set('');
    this.resetOtpState();
  }

  private resetOtpState() {
    this.otpSent.set(false);
    this.emailVerified.set(false);
    this.otpError.set('');
    this.otpCode = '';
    this.resendCountdown.set(0);

    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
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

  checkUsername() {
    if (!this.form.userName?.trim()) {
      this.usernameError.set('');
      return;
    }

    this.checkingUsername.set(true);

    this.authService
      .checkUsername(this.form.userName)
      .subscribe({
        next: (res) => {
          if (res.data) {
            this.usernameError.set('Tên người dùng đã tồn tại');
          }
          else {
            this.usernameError.set('');
          }
          this.checkingUsername.set(false);
        },
        error: () => {
          this.usernameError.set('');
          this.checkingUsername.set(false);
        }
      });
  }

  sendEmailOtp() {
    const email = this.form.email?.trim();

    if (!email || this.emailError() || this.checkingEmail() || this.resendCountdown() > 0) {
      return;
    }

    this.otpError.set('');
    this.sendingOtp.set(true);

    this.authService.sendOtp(email, OTP_PURPOSE.VERIFY_EMAIL).subscribe({
      next: (res) => {
        this.sendingOtp.set(false);

        if (res?.code !== '200') {
          this.otpError.set(res?.message || 'Không gửi được mã OTP');
          return;
        }

        this.otpSent.set(true);
        this.startCountdown();
      },
      error: (err) => {
        this.sendingOtp.set(false);
        this.otpError.set(err?.error?.message || 'Không gửi được mã OTP');
      }
    });
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

  verifyEmailOtp() {
    const email = this.form.email?.trim();

    if (!email || !this.otpCode.trim()) {
      this.otpError.set('Vui lòng nhập mã OTP');
      return;
    }

    this.otpError.set('');
    this.verifyingOtp.set(true);

    this.authService.verifyOtp(email, this.otpCode.trim(), OTP_PURPOSE.VERIFY_EMAIL).subscribe({
      next: (res) => {
        this.verifyingOtp.set(false);

        if (res?.code !== '200') {
          this.otpError.set(res?.message || 'Mã OTP không đúng');
          return;
        }

        this.emailVerified.set(true);
      },
      error: (err) => {
        this.verifyingOtp.set(false);
        this.otpError.set(err?.error?.message || 'Mã OTP không đúng');
      }
    });
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  register() {
    if (!this.emailVerified()) {
      this.otpError.set('Vui lòng xác thực email trước khi đăng ký');
      return;
    }

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

  ngOnDestroy() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  }
}
