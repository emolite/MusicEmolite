import { Component, HostListener, inject, signal } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { LucideAngularModule, LogOut, HomeIcon, ChevronDown, Settings } from "lucide-angular";
import { AuthService } from "../../core/services/auth.service";

@Component({
    selector: 'app-sidebar',
    imports: [RouterLink, RouterLinkActive, LucideAngularModule],
    templateUrl: './sidebar.html'
})
export class SidebarComponent {
    readonly LogoutIcon = LogOut;
    readonly HomeIcon = HomeIcon;
    readonly ChevronDownIcon = ChevronDown;
    readonly SettingsIcon = Settings
    private router = inject(Router);
    public authService = inject(AuthService)

    openMenu = signal(false);

    get displayName(): string {
        const user = this.authService.user();
        return user?.profile?.fullName || user?.username || '';
    }
    
    get profileUri(): string | null {
        return this.authService.user()?.profile?.uri ?? null;
    }
    toggleMenu() {
        this.openMenu.update(v => !v);
    }

    @HostListener('document:click')
    closeMenu() {
        this.openMenu.set(false);
    }

    goProfile() {
        this.router.navigate(['/setting/profile']);
        this.openMenu.set(false);
    }

    logout() {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('currentUser');
        this.authService.user.set(null);
        this.router.navigate(['/auth/login']);
    }
}