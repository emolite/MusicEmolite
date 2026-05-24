import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../../core/services/auth.service";
import { Router } from "@angular/router";

@Component({
    selector: 'app-login',
    imports: [CommonModule, FormsModule],
    templateUrl: './login.html'
})
export class LoginComponent {

    private authService = inject(AuthService);
    private router = inject(Router);

    showPassword = signal(false);
    loading = this.authService.loading;

    form = {
        userName: '',
        password: ''
    };

    togglePassword() {
        this.showPassword.update(v => !v);
    }

    login() {
        this.authService.login(this.form).subscribe({
            next: (res) => {
                const data = res?.data;
                if (!data?.accessToken) return;
                sessionStorage.setItem('token', data.accessToken);
                this.authService.getCurrentUser().subscribe({
                    next: (userRes: any) => {
                        const user = userRes?.data;
                        this.authService.user.set(user ?? null);
                        const roleCode = user?.roleCode ?? '';
                        if (roleCode.includes('ADMIN')) {
                            this.router.navigate(['/admin/profile']);
                            return;
                        }
                        if (roleCode.includes('USER')) {
                            this.router.navigate(['/users/home']);
                            return;
                        }
                        this.router.navigate(['/auth/login']);
                    },
                    error: () => {
                        this.router.navigate(['/auth/login']);
                    }
                });
            },
            error: (err) => {
                console.log(err);
            }
        });
    }
}