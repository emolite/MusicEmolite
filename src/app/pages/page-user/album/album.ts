import { CommonModule } from "@angular/common";
import { Component, effect, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AlbumService } from "../../../core/services/album.service";
import { AlbumResponse } from "../../../core/models/album/res-album.model";
import { CreateAlbumPayload, CreateAlbumPopupComponent } from "./album-create-popup/album-create-popup";

@Component({
    selector: "app-album",
    imports: [CommonModule, FormsModule, RouterLink, CreateAlbumPopupComponent],
    templateUrl: "./album.html"
})
export class AlbumComponent {

    private albumService = inject(AlbumService);
    albums = signal<AlbumResponse[]>([]);
    keyword = signal('');
    selectedTab = signal<'public' | 'private'>('public');
    showCreateAlbum = signal(false);

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

    createAlbum(payload: CreateAlbumPayload) {
        this.albumService.createAlbum({
            title: payload.title,
            releaseDate: payload.releaseDate,
            albumType: payload.albumType,
            image: payload.image
        })
            .subscribe({
                next: () => {
                    this.showCreateAlbum.set(false);
                    this.loadAlbums();
                }
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