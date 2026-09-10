import { Component, inject, signal } from '@angular/core';
import { ENVI } from '../../../environment/environment';
import { UserService } from '../../core/services/user.service';

@Component({
    selector: 'app-user-footer',
    standalone: true,
    imports: [],
    templateUrl: './user-footer.html'
})
export class UserFooterComponent {
    private userService = inject(UserService);

    readonly ownerName = ENVI.appInfo.ownerName;
    readonly nickname = ENVI.appInfo.nickname;
    readonly phoneNumber = ENVI.appInfo.phoneNumber;
    readonly address = ENVI.appInfo.address;
    readonly foodSiteUrl = ENVI.appInfo.foodSiteUrl;
    readonly facebookUrl = ENVI.appInfo.facebookUrl;
    readonly youtubeUrl = ENVI.appInfo.youtubeUrl;
    readonly tiktokUrl = ENVI.appInfo.tiktokUrl;

    /** Fetched from the admin's own saved bank account (public endpoint) - no hardcoded bank info. */
    donationQrUrl = signal('');

    currentYear = new Date().getFullYear();

    ngOnInit() {
        this.userService.getAdminBankUsers().subscribe({
            next: (res: any) => {
                const bank = res?.data?.[0];
                if (!bank?.bankCode || !bank?.accountNo) return;

                this.donationQrUrl.set(
                    `https://img.vietqr.io/image/${bank.bankCode}-${bank.accountNo}-qr_only.png`
                );
            },
            error: (err) => console.log(err)
        });
    }
}
