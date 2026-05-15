import { CommonModule } from "@angular/common";
import { Component, effect, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AlbumService } from "../../../core/services/album.service";
import { AlbumResponse } from "../../../core/models/album/res-album.model";

@Component({
    selector: "app-album",
    imports: [CommonModule, FormsModule],
    templateUrl: "./album.html"
})
export class AlbumComponent {

    private albumService = inject(AlbumService);
    albums = signal<AlbumResponse[]>([]);
    keyword = signal('');
    selectedTab = signal<'public' | 'private'>('public');

    ngOnInit() {
        this.loadAlbums();
    }

    constructor() {
        effect(() => {
            this.selectedTab();
            this.loadAlbums();
        });
    }

    loadAlbums() {
        const request = {
            page: 1,
            pageSize: 20,
            asc: false,
            searchParams: {
                keyword: this.keyword()
            }
        };
        const api =
            this.selectedTab() === 'public'
                ? this.albumService.searchPublicAlbums(request)
                : this.albumService.searchAlbums(request);
        api.subscribe(res => {
            this.albums.set(res.data ?? []);
        });
    }

    onSearch(value: string) {
        this.keyword.set(value);
        this.loadAlbums();
    }

    changeTab(tab: 'public' | 'private') {
        this.selectedTab.set(tab);
        this.loadAlbums();
    }
}