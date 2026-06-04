import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { BankService } from '../../../core/services/bank.service';

import { DropdownComponent, DropdownOption } from '../../../shared/components/dropdown/dropdown';
import { ResBank } from '../../../core/models/bank/res-bank.model';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownComponent],
  templateUrl: './admin-profile.html'
})
export class AdminProfileComponent {

  private authService = inject(AuthService);
  private userService = inject(UserService);
  private bankService = inject(BankService);

  previewImage = signal<string | null>(null);
  bankId = signal<number | null>(null);

  selectedFile: File | null = null;

  banks = signal<ResBank[]>([]);
  bankOptions = signal<DropdownOption[]>([]);

  form = signal({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    bio: ''
  });

  bankForm = signal({
    bankCode: '',
    bankName: '',
    accountNo: '',
    accountName: '',
    vietQrUrl: '',
    qrImageUrl: ''
  });

  vietQrImageUrl = computed(() => {
    const bank = this.bankForm();

    if (!bank.bankCode || !bank.accountNo) return '';

    return `https://img.vietqr.io/image/${bank.bankCode}-${bank.accountNo}-compact2.png?accountName=${encodeURIComponent(bank.accountName || '')}`;
  });

  genderOptions: DropdownOption[] = [
    { label: 'Nam', value: 'male' },
    { label: 'Nữ', value: 'female' },
    { label: 'Khác', value: 'other' }
  ];

  ngOnInit() {
    this.loadProfile();
    this.loadBanks();
    this.loadBankUser();
  }

  get user() {
    return this.authService.user();
  }

  loadBanks() {
    this.bankService.getBanks().subscribe({
      next: (res: any) => {
        const banks = res.data ?? [];

        this.banks.set(banks);

        this.bankOptions.set(
          banks.map((x: ResBank) => ({
            label: `${x.shortName || x.name} - ${x.bin}`,
            value: x.bin
          }))
        );
      }
    });
  }

  onBankChange(bin: string) {
    const bank = this.banks().find(x => x.bin === bin);

    if (!bank) return;

    this.bankForm.update(x => ({
      ...x,
      bankCode: bank.bin,
      bankName: bank.shortName || bank.name
    }));
  }

  loadProfile() {
    this.userService.getUserProfile().subscribe({
      next: (res: any) => {
        const profile = res.data;

        this.previewImage.set(profile.uri);

        this.form.set({
          fullName: profile.fullName || '',
          phone: profile.phone || '',
          dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
          gender: profile.gender || '',
          bio: profile.bio || ''
        });
      }
    });
  }

  loadBankUser() {
    this.userService.getBankUser().subscribe({
      next: (res: any) => {
        const bank = res.data;
        if (!bank) return;

        this.bankId.set(bank.id);

        this.bankForm.set({
          bankCode: bank.bankCode || '',
          bankName: bank.bankName || '',
          accountNo: bank.accountNo || '',
          accountName: bank.accountName || '',
          vietQrUrl: bank.vietQrUrl || '',
          qrImageUrl: bank.qrImageUrl || ''
        });
      }
    });
  }

  updateForm(key: keyof ReturnType<AdminProfileComponent['form']>, value: string) {
    this.form.update(x => ({
      ...x,
      [key]: value
    }));
  }

  updateBankForm(key: keyof ReturnType<AdminProfileComponent['bankForm']>, value: string) {
    this.bankForm.update(x => ({
      ...x,
      [key]: value
    }));
  }

  async onSelectImage(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const compressedFile = await this.compressImage(file);

    this.selectedFile = compressedFile;

    const reader = new FileReader();
    reader.onload = () => this.previewImage.set(reader.result as string);
    reader.readAsDataURL(compressedFile);
  }

  compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const image = new Image();
      const reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onload = (event: any) => image.src = event.target.result;

      image.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 1000;
        const scale = maxWidth / image.width;

        canvas.width = image.width > maxWidth ? maxWidth : image.width;
        canvas.height = image.width > maxWidth ? image.height * scale : image.height;

        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            }));
          },
          'image/jpeg',
          0.7
        );
      };
    });
  }

  saveProfile() {
    const data = this.form();

    const formData = new FormData();

    formData.append('fullName', data.fullName);
    formData.append('phone', data.phone);
    formData.append('dateOfBirth', data.dateOfBirth);
    formData.append('gender', data.gender);
    formData.append('bio', data.bio);

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
            fullName: data.fullName,
            phone: data.phone,
            dateOfBirth: data.dateOfBirth,
            gender: data.gender,
            bio: data.bio,
            uri: this.previewImage()
          }
        });
      }
    });
  }

  saveBankUser() {
    const data = this.bankForm();

    if (!data.bankCode || !data.accountNo || !data.accountName) {
      return;
    }

    const payload = {
      ...data,
      vietQrUrl: this.vietQrImageUrl(),
      qrImageUrl: this.vietQrImageUrl()
    };

    const id = this.bankId();

    if (id) {
      this.userService.updateBankUser(id, payload).subscribe({
        next: () => {
          this.bankForm.update(x => ({
            ...x,
            vietQrUrl: this.vietQrImageUrl(),
            qrImageUrl: this.vietQrImageUrl()
          }));
        }
      });

      return;
    }

    this.userService.createBankUser(payload).subscribe({
      next: (res: any) => {
        const bank = res.data;
        if (!bank) return;

        this.bankId.set(bank.id);

        this.bankForm.update(x => ({
          ...x,
          vietQrUrl: this.vietQrImageUrl(),
          qrImageUrl: this.vietQrImageUrl()
        }));
      }
    });
  }

  saveAll() {
    this.saveProfile();
    this.saveBankUser();
  }
}