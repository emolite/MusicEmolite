import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlbumService } from '../../../core/services/album.service';
import { AlbumResponse } from '../../../core/models/album/res-album.model';
import { AlbumRequest } from '../../../core/models/album/req-album.model';
import { BaseSearchDto } from '../../../core/models/base/base-search.model';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

import { PlayerService } from '../../../core/services/player.service';
import { SongService } from '../../../core/services/song.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { PAGINATION_USER } from '../../../core/constants/pagination.constants';

import { YoutubeVideoResponse } from '../../../core/models/youtube/youtube-res.model';
import { YoutubeSearchRequest } from '../../../core/models/youtube/youtube-req.model';

interface SongRow {
  id: string;
  songId?: number | null;
  name: string;
  artist: string;
  duration: number;
  imgUrl?: string;
  views: number;
  url: string;
  isLiked?: boolean;
  videoId: string;
}

@Component({
  selector: 'app-discover',
  standalone: true,
  imports: [
    CommonModule,
    PaginationComponent
  ],
  templateUrl: './discover.html',
})
export class DiscoverComponent implements OnInit, OnDestroy {

  player = inject(PlayerService);

  private songService = inject(SongService);
  private route = inject(ActivatedRoute);
  private albumService = inject(AlbumService);

  private destroy$ = new Subject<void>();
  private albumSearch$ = new Subject<string>();
  songs = signal<SongRow[]>([]);
  isLoading = signal(false);

  keyword = signal('');
  highlightId = signal<string | null>(null);

  page = signal(PAGINATION_USER.DEFAULT_PAGE);
  totalPages = signal(1);
  showAddToAlbum = signal(false);
  selectedSongId = signal<number | null>(null);
  selectedAlbumId = signal<number | null>(null);
  albumList = signal<AlbumResponse[]>([]);
  selectedSongAlbumIds = signal<number[]>([]);
  albumKeyword = signal('');
  isAddingToAlbum = signal(false);

  currentTrackId = computed(
    () => this.player.currentTrack()?.id ?? null
  );

  ngOnInit(): void {
    this.albumSearch$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(keyword => {
        this.fetchAlbums(keyword);
      });
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.keyword.set(params['keyword'] ?? '');

        this.highlightId.set(
          params['highlightId'] ?? null
        );

        this.page.set(PAGINATION_USER.DEFAULT_PAGE);

        this.loadSongs();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSongs(): void {
    const kw = this.keyword().trim();

    if (!kw) {
      this.songs.set([]);
      this.totalPages.set(1);
      return;
    }

    this.isLoading.set(true);

    this.songService.searchYoutube({
      page: this.page(),
      pageSize: PAGINATION_USER.DEFAULT_PAGE_SIZE,
      searchParams: {
        keyword: kw
      } as YoutubeSearchRequest
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          let items: SongRow[] = (res.data ?? []).map(
            (s: YoutubeVideoResponse) => this.mapYoutubeSong(s)
          );

          const hId = this.highlightId();

          if (hId) {
            const idx = items.findIndex(x => x.id === hId);

            if (idx > 0) {
              const [selected] = items.splice(idx, 1);
              items.unshift(selected);
            }
          }

          this.songs.set(items);
          this.totalPages.set(res.totalPages || 1);
          this.player.setQueue(items);
          this.isLoading.set(false);

          if (hId) {
            const selected = items.find(x => x.id === hId);

            if (selected) {
              this.player.playYoutubeSong(selected.id);
            }
          }
        },

        error: () => {
          this.isLoading.set(false);
        }
      });
  }

  playSong(id: string): void {
    this.player.setQueue(this.songs());
    this.player.playYoutubeSong(id);
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.loadSongs();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  private mapYoutubeSong(s: YoutubeVideoResponse): SongRow {
    return {
      id: s.videoId,
      songId: s.songId ?? null,
      videoId: s.videoId,
      name: s.title,
      artist: s.channel,
      duration: s.duration ?? 0,
      imgUrl:
        s.thumbnailMedium ||
        s.thumbnailHigh ||
        s.thumbnailDefault ||
        s.thumbnailStandard ||
        s.thumbnailMaxres,
      views: s.views ?? 0,
      url: '',
      isLiked: s.isLiked ?? false
    };
  }

  formatDuration(sec: number): string {
    if (!sec) return '--:--';

    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);

    return `${m}:${s < 10 ? '0' + s : s}`;
  }

  openAddToAlbum(song: SongRow, event: Event): void {
    event.stopPropagation();

    if (!song.songId) return;

    this.selectedSongAlbumIds.set([]);
    this.selectedSongId.set(song.songId);
    this.selectedAlbumId.set(null);
    this.albumKeyword.set('');
    this.showAddToAlbum.set(true);

    this.fetchAlbums('');
  }

  closeAddToAlbum(): void {
    this.showAddToAlbum.set(false);
    this.selectedSongId.set(null);
    this.selectedAlbumId.set(null);
  }

  selectAlbum(album: AlbumResponse): void {
    if (this.selectedSongAlbumIds().includes(album.id)) return;

    this.selectedAlbumId.set(album.id);
  }

  onAlbumSearch(event: Event): void {
    const keyword = (event.target as HTMLInputElement).value;

    this.albumKeyword.set(keyword);
    this.albumSearch$.next(keyword);
  }

  private fetchAlbums(keyword: string): void {
    const payload: BaseSearchDto<AlbumRequest> = {
      page: 1,
      pageSize: 20,
      asc: false,
      searchParams: {
        keyword
      }
    };

    this.albumService
      .searchAlbums(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.albumList.set(res.data ?? []);
      });
  }

  confirmAddToAlbum(): void {
    const songId = this.selectedSongId();
    const albumId = this.selectedAlbumId();

    if (!songId || !albumId) return;

    this.isAddingToAlbum.set(true);

    this.songService
      .addSongToAlbum(songId, albumId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isAddingToAlbum.set(false);
          this.closeAddToAlbum();
        },
        error: () => {
          this.isAddingToAlbum.set(false);
        }
      });
  }
}