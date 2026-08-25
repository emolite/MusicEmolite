import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
    selector: 'app-account-security',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './account-security.html'
})
export class AccountSecurity {

    private authService = inject(AuthService);
    private toastService = inject(ToastService);

    loading = signal(false);
    error = signal('');

    oldPassword = '';
    newPassword = '';
    confirmPassword = '';

    get user() {
        return this.authService.user();
    }

    changePassword(): void {
        this.error.set('');

        if (!this.oldPassword) {
            this.error.set('Vui lòng nhập mật khẩu hiện tại');
            return;
        }

        if (!this.newPassword || this.newPassword.length < 6) {
            this.error.set('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        if (this.newPassword !== this.confirmPassword) {
            this.error.set('Mật khẩu xác nhận không khớp');
            return;
        }

        this.loading.set(true);

        this.authService.changePassword({
            oldPassword: this.oldPassword,
            newPassword: this.newPassword
        }).subscribe({
            next: (res) => {
                this.loading.set(false);

                if (res?.code !== '200') {
                    this.error.set(res?.message || 'Đổi mật khẩu thất bại');
                    return;
                }

                this.toastService.success('Đổi mật khẩu thành công');

                this.oldPassword = '';
                this.newPassword = '';
                this.confirmPassword = '';
            },
            error: (err) => {
                this.loading.set(false);
                this.error.set(err?.error?.message || 'Đổi mật khẩu thất bại');
            }
        });
    }
}
