import { Component, inject, signal } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { LucideAngularModule, LogOut, HomeIcon, ChevronDown, Settings } from "lucide-angular";
import { AuthService } from "../../core/services/auth.service";
import { ArtistService } from "../../core/services/artist.service";
import { ChatHubService } from "../../core/services/chat-hub.service";
import { ArtistResponse } from "../../core/models/artist/res-artist.model";

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
    private artistService = inject(ArtistService);
    public chatHubService = inject(ChatHubService);

    user = this.authService.user;
    artists = signal<ArtistResponse[]>([]);

    ngOnInit() {
        this.loadArtists();
    }

    private loadArtists() {
        this.artistService.searchArtists({
            page: 1,
            pageSize: 50,
            asc: false,
            searchParams: {
                keyword: ''
            }
        }).subscribe(res => {
            this.artists.set(res.data ?? []);
        });
    }

    get displayName(): string {
        const user = this.authService.user();
        return user?.profile?.fullName || user?.username || '';
    }
    
    get profileUri(): string | null {
        return this.authService.user()?.profile?.uri ?? null;
    }

    /**
     * The 3 "Xã giao" links all point at /users/messages, differing only by
     * ?tab= - routerLinkActive can't distinguish them (it ignores query
     * params), so this reads the tab straight off the current URL instead.
     */
    get activeMessagesTab(): string {
        if (!this.router.url.startsWith('/users/messages')) return '';

        const match = this.router.url.match(/[?&]tab=([^&]+)/);
        return match ? match[1] : 'friends';
    }
}