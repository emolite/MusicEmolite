import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { SongService } from '../../../../core/services/song.service';
import { AlbumService } from '../../../../core/services/album.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PlayerService } from '../../../../core/services/player.service';
import { PopupService } from '../../../../core/services/popup.service';

import { SongResponse } from '../../../../core/models/song/res-song.model';
import { PAGINATION_USER } from '../../../../core/constants/pagination.constants';
import { InfiniteScrollDirective } from '../../../../shared/directives/infinite-scroll.directive';

/**
 * Local, not PAGINATION_USER.DEFAULT_PAGE_SIZE - that constant is shared with
 * discover.ts's classic pagination, so changing it here would silently
 * change that unrelated page's page size too.
 */
const PAGE_SIZE = 50;

@Component({
  selector: 'app-album-detail',
  standalone: true,
  imports: [CommonModule, InfiniteScrollDirective],
  templateUrl: './album-detail.html',
  styleUrl: './album-detail.css'
})
export class AlbumDetailComponent {

  private route = inject(ActivatedRoute);
  private songService = inject(SongService);
  private albumService = inject(AlbumService);
  private authService = inject(AuthService);
  private popupService = inject(PopupService);
  player = inject(PlayerService);

  currentTrack = this.player.currentTrack;

  songs = signal<any[]>([]);
  albumId = signal<number>(0);
  currentAlbum = signal<any>(null);
  isLoading = signal(false);
  isLoadingMore = signal(false);
  isSearching = signal(false);
  keyword = signal('');
  page = signal(PAGINATION_USER.DEFAULT_PAGE);
  totalPages = signal(0);

  hasMore = computed(() => this.page() < this.totalPages());

  isOwner = computed(() => {
    const userId = this.authService.user()?.userId;
    return !!userId && this.currentAlbum()?.createdBy === userId;
  });

  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(value => {
      this.keyword.set(value);
      this.page.set(1);
      this.loadSongs(false, true);
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      this.albumId.set(id);
      this.currentAlbum.set(null);
      this.keyword.set('');
      this.page.set(1);
      this.loadSongs();

      this.albumService.getAlbumById(id).subscribe({
        next: res => this.currentAlbum.set(res.data ?? null),
        error: () => {}
      });
    });
  }

  loadMore() {
    if (this.isLoading() || this.isLoadingMore() || !this.hasMore()) return;

    this.page.update(p => p + 1);
    this.loadSongs(true);
  }

  onSearch(value: string) {
    this.searchSubject.next(value);
  }

  /**
   * `append` distinguishes infinite-scroll loads (add to the list) from a
   * fresh page-1 load (replace it). `isSearch` is a search-debounced reload
   * of an already-visible list - dims it instead of swapping content abruptly.
   */
  loadSongs(append = false, isSearch = false) {
    if (append) {
      this.isLoadingMore.set(true);
    } else if (isSearch) {
      this.isSearching.set(true);
    } else {
      this.isLoading.set(true);
    }

    this.songService.searchPublicSongs({
      page: this.page(),
      pageSize: PAGE_SIZE,
      asc: false,
      searchParams: {
        keyword: this.keyword(),
        albumId: this.albumId()
      }
    }).subscribe(res => {

      const data = res.data ?? [];

      const songs = data.map((s: SongResponse) => {
        const isYoutube = s.sourceType === 3 && !!s.youtubeVideoId;

        return {
          id: s.id,

          dbSongId: s.id,

          videoId: s.youtubeVideoId ?? null,

          sourceType: s.sourceType,

          name: s.title,

          artist: s.artistName,

          albumName: s.albumName,

          duration: s.duration,

          url: isYoutube ? null : s.fileUrl,

          imgUrl: s.imgUrl,

          views: s.views ?? 0,

          likes: s.likes ?? 0,

          isLiked: s.isLiked ?? false,

          albumIds: s.albumIds ?? []
        };
      });

      this.totalPages.set(res.totalPages ?? 0);

      if (append) {
        this.songs.update(list => [...list, ...songs]);
        this.isLoadingMore.set(false);
      } else {
        this.songs.set(songs);
        this.isLoading.set(false);
        this.isSearching.set(false);
      }
    });
  }

  async removeSong(song: any, event: Event): Promise<void> {
    event.stopPropagation();

    const confirmed = await this.popupService.confirm({
      message: `Bạn có muốn xoá "${song.name}" ra khỏi album này?`,
      confirmText: 'Xoá',
      danger: true,
      imageUrl: song.imgUrl
    });
    if (!confirmed) return;

    this.songService.removeSongFromAlbum(song.dbSongId, this.albumId()).subscribe({
      next: () => {
        this.songs.update(list => list.filter(s => s.id !== song.id));
      }
    });
  }

  playSong(id: number) {
    const song = this.songs().find(x => x.id === id);
    if (!song) return;

    this.player.setQueue(this.songs());

    if (song.videoId) {
      this.player.playYoutubeSong(song.id);
      return;
    }

    this.player.playSong(song.id);
  }

  currentTrackId() {
    return this.player.currentTrack()?.id;
  }

  formatDuration(sec: number): string {
    if (!sec) return '0:00';

    const m = Math.floor(sec / 60);
    const s = sec % 60;

    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}