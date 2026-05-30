import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-welcome',
    imports: [CommonModule, FormsModule],
    templateUrl: './welcome.html'
})
export class WelcomeComponent implements OnInit {

    private router = inject(Router);
    private authService = inject(AuthService);

    loading = signal(false);
    errorMessage = signal('');

    googleName = signal('');
    googlePicture = signal('');

    useGoogleInfo = signal<boolean | null>(null);

    form = {
        fullName: '',
        phoneNumber: '',
        dateOfBirth: ''
    };

    ngOnInit() {
        const state = this.router.getCurrentNavigation()?.extras.state
            ?? history.state;

        const googleName = state?.['googleName'];
        const googlePicture = state?.['googlePicture'];

        if (!googleName) {
            this.router.navigate(['/auth/login']);
            return;
        }

        this.googleName.set(googleName);
        this.googlePicture.set(googlePicture ?? '');
    }

    selectGoogleInfo() {
        this.useGoogleInfo.set(true);
    }

    selectManual() {
        this.useGoogleInfo.set(false);
    }

    back() {
        this.useGoogleInfo.set(null);
    }

    submit() {
        this.errorMessage.set('');

        if (this.useGoogleInfo() === null) return;

        if (!this.useGoogleInfo() && !this.form.fullName.trim()) {
            this.errorMessage.set('Vui lòng nhập họ tên');
            return;
        }

        this.loading.set(true);

        const payload = {
            useGoogleInfo: this.useGoogleInfo(),
            fullName: this.form.fullName,
            phoneNumber: this.form.phoneNumber,
            dateOfBirth: this.form.dateOfBirth || null,
            googleName: this.googleName(),
            googlePicture: this.googlePicture()
        };

        this.authService.completeProfile(payload).subscribe({
            next: (res: any) => {
                this.loading.set(false);
                if (res?.code !== '200') {
                    this.errorMessage.set(res?.message || 'Lỗi hệ thống');
                    return;
                }
                this.router.navigate(['/users/home']);
            },
            error: () => {
                this.loading.set(false);
                this.errorMessage.set('Lỗi hệ thống');
            }
        });
    }
}