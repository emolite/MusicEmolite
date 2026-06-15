import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_SERVICE } from './commons/api.service';
import { API_END } from '../constants/api-end.constants';
import { LoginRequest } from '../models/auth/req-login.model';
import { LoginResponse } from '../models/auth/res-login.model';
import { RegisterRequest } from '../models/auth/req-register.model';
import { RegisterResponse } from '../models/auth/res-register.model';
import { CurrentUserResponse } from '../models/auth/res-current-user.model';
import { BaseResponse } from '../models/base/base-res.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = inject(API_SERVICE);

  user = signal<CurrentUserResponse | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');

    return !!token;
  }
  getCurrentUser() {
    return this.api.getData<BaseResponse<CurrentUserResponse>>(
      API_END.AUTH.CURRENT_USER
    );
  }

  login(payload: LoginRequest) {
    this.loading.set(true);
    this.error.set(null);

    return this.api.postData<BaseResponse<LoginResponse>, LoginRequest>(
      API_END.AUTH.LOGIN,
      payload
    ).pipe(
      tap({
        next: () => {
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.message || 'Login failed');
          this.loading.set(false);
        }
      })
    );
  }

  register(payload: RegisterRequest) {
    this.loading.set(true);
    this.error.set(null);

    return this.api.postData<BaseResponse<RegisterResponse>, RegisterRequest>(
      API_END.AUTH.REGISTER,
      payload
    ).pipe(
      tap({
        next: () => {
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.message || 'Register failed');
          this.loading.set(false);
        }
      })
    );
  }
  
  completeProfile(payload: any) {
    return this.api.postData<BaseResponse<boolean>, any>(
      API_END.AUTH.COMPLETE_PROFILE,
      payload
    );
  }

  checkEmail(email: string) {
    return this.api.getData<BaseResponse<boolean>>(
      `${API_END.AUTH.CHECK_EMAIL}?email=${email}`
    );
  }

  checkUsername(username: string) {
    return this.api.getData<BaseResponse<boolean>>(
      `${API_END.AUTH.CHECK_USERNAME}?username=${username}`
    );
  }

  checkIp(ipAddress: string) {
    return this.api.getData<BaseResponse<boolean>>(
      `${API_END.AUTH.CHECK_IP}?ipAddress=${ipAddress}`
    );
  }

  loginWithGoogle(): Observable<any> {
    this.loading.set(true);
    this.error.set(null);

    return new Observable(observer => {
      const google = (window as any).google;

      if (!google) {
        this.loading.set(false);
        observer.error('Google SDK chưa load');
        return;
      }

      google.accounts.id.initialize({
        client_id: '721913068181-vthg768rcefrt046vlhnad1t4gqq1uk0.apps.googleusercontent.com',
        callback: (response: any) => {
          const idToken = response.credential;

          if (!idToken) {
            this.loading.set(false);
            observer.error('Không lấy được token từ Google');
            return;
          }

          this.api.postData<BaseResponse<LoginResponse>, { idToken: string }>(
            API_END.AUTH.LOGIN_WITH_GG,
            { idToken }
          ).pipe(
            tap({
              next: () => this.loading.set(false),
              error: (err) => {
                this.error.set(err?.error?.message || 'Google login failed');
                this.loading.set(false);
              }
            })
          ).subscribe(observer);
        }
      });

      google.accounts.id.prompt();
    });
  }
}