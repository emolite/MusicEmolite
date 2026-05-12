import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import {
    DropdownComponent,
    DropdownOption
} from '../../../../shared/components/dropdown/dropdown';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, FormsModule, DropdownComponent],
    templateUrl: './profile.html'
})
export class Profile {

    genderOptions: DropdownOption[] = [
        { label: 'Nam', value: 'male' },
        { label: 'Nữ', value: 'female' },
        { label: 'Khác', value: 'other' },
    ];

    previewImage = signal<string | null>(null);

    private authService = inject(AuthService);
    private userService = inject(UserService);

    loading = false;

    selectedFile: File | null = null;

    form = {
        fullName: this.user?.profile?.fullName || '',
        phone: this.user?.profile?.phone || '',
        dateOfBirth: this.user?.profile?.dateOfBirth || '',
        gender: this.user?.profile?.gender || '',
        bio: this.user?.profile?.bio || '',
    };

    ngOnInit(): void {

        this.userService.getUserProfile().subscribe({
            next: (res: any) => {

                const profile = res.data;

                this.previewImage.set(profile.uri);

                this.form = {
                    fullName: profile.fullName || '',
                    phone: profile.phone || '',
                    dateOfBirth: profile.dateOfBirth
                        ? profile.dateOfBirth.split('T')[0]
                        : '',
                    gender: profile.gender || '',
                    bio: profile.bio || '',
                };
            }
        });
    }

    get user() {
        return this.authService.user();
    }

    async onSelectImage(event: Event) {

        const input = event.target as HTMLInputElement;

        if (!input.files?.length) return;

        const file = input.files[0];

        const compressedFile = await this.compressImage(file);

        this.selectedFile = compressedFile;

        const reader = new FileReader();

        reader.onload = () => {
            this.previewImage.set(reader.result as string);
        };

        reader.readAsDataURL(compressedFile);
    }

    compressImage(file: File): Promise<File> {
        return new Promise((resolve) => {
            const image = new Image();
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event: any) => {
                image.src = event.target.result;
            };

            image.onload = () => {
                const canvas = document.createElement('canvas');
                const maxWidth = 1000;
                const scale = maxWidth / image.width;
                canvas.width = image.width > maxWidth
                    ? maxWidth
                    : image.width;
                canvas.height = image.width > maxWidth
                    ? image.height * scale
                    : image.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(file);
                    return;
                }
                ctx.drawImage(
                    image,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            resolve(file);
                            return;
                        }
                        const compressed = new File(
                            [blob],
                            file.name,
                            {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            }
                        );
                        resolve(compressed);
                    },
                    'image/jpeg',
                    0.7
                );
            };
        });
    }

    saveProfile() {
        const formData = new FormData();
        formData.append('fullName', this.form.fullName);
        formData.append('phone', this.form.phone);
        formData.append('dateOfBirth', this.form.dateOfBirth);
        formData.append('gender', this.form.gender);
        formData.append('bio', this.form.bio);
        if (this.selectedFile) {
            formData.append('uri', this.selectedFile);
        }

        this.userService.updateUser(formData).subscribe({
            next: () => {
                const currentUser = this.authService.user();
                if (!currentUser || !currentUser.profile) return;
                this.authService.user.set({
                    ...currentUser,
                    profile: {
                        ...currentUser.profile,
                        fullName: this.form.fullName,
                        phone: this.form.phone,
                        dateOfBirth: this.form.dateOfBirth,
                        gender: this.form.gender,
                        bio: this.form.bio,
                        uri: this.previewImage()
                    }
                });
            }
        });
    }
}