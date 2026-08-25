import { CommonModule } from "@angular/common";
import { Component, computed, effect, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { AlbumService } from "../../../core/services/album.service";
import { AuthService } from "../../../core/services/auth.service";
import { AlbumResponse } from "../../../core/models/album/res-album.model";
import { CreateAlbumPayload, CreateAlbumPopupComponent } from "./album-create-popup/album-create-popup";
import { InfiniteScrollDirective } from "../../../shared/directives/infinite-scroll.directive";

const PAGE_SIZE = 20;

@Component({
    selector: "app-album",
    imports: [CommonModule, FormsModule, RouterLink, CreateAlbumPopupComponent, InfiniteScrollDirective],
    templateUrl: "./album.html"
})
export class AlbumComponent {

    private albumService = inject(AlbumService);
    public authService = inject(AuthService);
    albums = signal<AlbumResponse[]>([]);
    keyword = signal('');
    selectedTab = signal<'public' | 'private'>('public');
    showCreateAlbum = signal(false);

    page = signal(1);
    totalPages = signal(0);
    isLoadingMore = signal(false);
    isSearching = signal(false);

    hasMore = computed(() => this.page() < this.totalPages());

    private searchSubject = new Subject<string>();

    ngOnInit() {
        this.loadAlbums();
    }

    constructor() {
        effect(() => {
            this.selectedTab();
            this.page.set(1);
            this.loadAlbums();
        });

        this.searchSubject.pipe(
            debounceTime(500),
            distinctUntilChanged()
        ).subscribe(value => {
            this.keyword.set(value);
            this.page.set(1);
            this.loadAlbums(false, true);
        });
    }

    loadMore() {
        if (this.isLoadingMore() || !this.hasMore()) return;

        this.page.update(p => p + 1);
        this.loadAlbums(true);
    }

    /**
     * `append` distinguishes infinite-scroll loads (add to the grid) from a
     * fresh tab/search/page-1 load (replace it). `isSearch` is a
     * search-debounced reload of an already-visible grid - dims it instead
     * of swapping content abruptly.
     */
    loadAlbums(append = false, isSearch = false) {
        if (append) {
            this.isLoadingMore.set(true);
        } else if (isSearch) {
            this.isSearching.set(true);
        }

        const request = {
            page: this.page(),
            pageSize: PAGE_SIZE,
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
            this.totalPages.set(res.totalPages ?? 0);

            if (append) {
                this.albums.update(list => [...list, ...(res.data ?? [])]);
                this.isLoadingMore.set(false);
            } else {
                this.albums.set(res.data ?? []);
                this.isSearching.set(false);
            }
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
                    this.page.set(1);
                    this.loadAlbums();
                }
            });
    }

    onSearch(value: string) {
        this.searchSubject.next(value);
    }

    changeTab(tab: 'public' | 'private') {
        // The selectedTab effect (constructor) already resets the page and
        // reloads - calling loadAlbums() here too would just double-fetch.
        this.selectedTab.set(tab);
    }
}