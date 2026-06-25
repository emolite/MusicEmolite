import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { SongService } from '../../../core/services/song.service';
import { AlbumService } from '../../../core/services/album.service';
import { PlayerService } from '../../../core/services/player.service';
import { AuthService } from '../../../core/services/auth.service';

import { SongResponse } from '../../../core/models/song/res-song.model';
import { AlbumResponse } from '../../../core/models/album/res-album.model';

import {
  debounceTime,
  distinctUntilChanged,
  Subject
} from 'rxjs';

import { AlbumRequest }
  from '../../../core/models/album/req-album.model';

import { BaseSearchDto }
  from '../../../core/models/base/base-search.model';

import { PAGINATION }
  from '../../../core/constants/pagination.constants';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class HomeComponent {

  private songService = inject(SongService);

  private albumService = inject(AlbumService);

  public player = inject(PlayerService);

  private router = inject(Router);

  private authService = inject(AuthService);

  recentItems = signal<any[]>([]);

  trendingTracks = signal<any[]>([]);

  newestTracks = signal<any[]>([]);

  playlists = signal<any[]>([]);

  featuredSong = signal<any>(null);

  recentQueue = signal<any[]>([]);

  trendingQueue = signal<any[]>([]);

  newestQueue = signal<any[]>([]);

  showAddToAlbum = signal(false);

  selectedSongId = signal<number | null>(null);

  selectedAlbumId = signal<number | null>(null);

  albumList = signal<AlbumResponse[]>([]);

  selectedSongAlbumIds = signal<number[]>([]);

  albumKeyword = signal('');

  isAddingToAlbum = signal(false);

  selectedPreviewSong = signal<any>(null);

  showLoginMessage = signal(false);

  currentTrackId = computed(() =>
    this.player.currentTrack()?.id
  );

  isLoggedIn = computed(() =>
    !!this.authService.user()
  );

  private albumSearch$ = new Subject<string>();

  ngOnInit() {

    this.loadTrendingSongs();

    this.loadNewestSongs();

    this.loadAlbums();

    this.waitForAuthAndLoadRecent();

    this.albumSearch$
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(keyword => {
        this.fetchAlbums(keyword);
      });
  }

  private waitForAuthAndLoadRecent() {

    const interval = setInterval(() => {

      if (this.isLoggedIn()) {

        clearInterval(interval);

        this.loadRecentSongs();
      }

    }, 200);
  }
  private async mapSongQueue(data: SongResponse[]) {

    return await Promise.all(
      data.map(async (s: SongResponse) => {
        const isYoutube = s.sourceType === 3 || !!s.youtubeVideoId;

        return {
          id: isYoutube
            ? s.youtubeVideoId
            : s.id,

          dbSongId: s.id,

          videoId: s.youtubeVideoId,

          sourceType: s.sourceType,

          name: s.title,

          artist: s.artistName,

          duration: isYoutube
            ? s.duration
            : await this.getRealDuration(s.fileUrl),

          url: isYoutube
            ? ''
            : s.fileUrl,

          imgUrl: s.imgUrl || null,

          like: s.likes ?? 0,

          view: s.views ?? 0,

          isLiked: s.isLiked ?? false,

          albumIds: s.albumIds ?? [],

          year: s.releaseDate
            ? new Date(s.releaseDate).getFullYear()
            : s.createdAt
              ? new Date(s.createdAt).getFullYear()
              : ''
        };
      })
    );
  }

  private loadRecentSongs() {

    this.songService.getRecentSongs({
      page: 1,
      pageSize: 14,
      asc: false,
      searchParams: {
        keyword: ''
      }
    }).subscribe(async res => {

      const queue = await this.mapSongQueue(
        res.data ?? []
      );

      this.recentQueue.set(queue);

      this.recentItems.set(
        queue.slice(0, 6).map((s: any) => ({
          id: s.id,
          dbSongId: s.dbSongId,
          videoId: s.videoId,
          sourceType: s.sourceType,
          name: s.name,
          artist: s.artist,
          duration: s.duration,
          url: s.url,
          imgUrl: s.imgUrl,
          like: s.like,
          view: s.view,
          isLiked: s.isLiked,
          albumIds: s.albumIds,
          views: s.view,
          color: 'linear-gradient(135deg, #8b5cf6, #0f0d1a)'
        }))
      );
    });
  }

  private loadTrendingSongs() {

    this.songService.getTrendingSongs({
      page: 1,
      pageSize: 14,
      asc: false,
      searchParams: {
        keyword: ''
      }
    }).subscribe(async res => {

      const queue = await this.mapSongQueue(
        res.data ?? []
      );

      this.trendingQueue.set(queue);

      this.featuredSong.set(
        queue[0] ?? null
      );

      this.trendingTracks.set(
        queue.map((s: any) => ({
          id: s.id,
          dbSongId: s.dbSongId,
          videoId: s.videoId,
          sourceType: s.sourceType,
          name: s.name,
          artist: s.artist,
          duration: s.duration,
          url: s.url,
          like: s.like,
          view: s.view,
          isLiked: s.isLiked,
          plays: s.view.toLocaleString(),
          imgUrl: s.imgUrl,
          albumIds: s.albumIds,
          color: 'linear-gradient(135deg, #8b5cf6, #0f0d1a)'
        }))
      );
    });
  }

  private loadNewestSongs() {

    this.songService.getNewestSongs({
      page: 1,
      pageSize: 14,
      asc: false,
      searchParams: {
        keyword: ''
      }
    }).subscribe(async res => {

      const queue = await this.mapSongQueue(
        res.data ?? []
      );

      this.newestQueue.set(queue);

      this.newestTracks.set(
        queue.map((s: any) => ({
          id: s.id,
          dbSongId: s.dbSongId,
          videoId: s.videoId,
          sourceType: s.sourceType,
          name: s.name,
          artist: s.artist,
          duration: s.duration,
          url: s.url,
          like: s.like,
          view: s.view,
          isLiked: s.isLiked,
          plays: s.view.toLocaleString(),
          imgUrl: s.imgUrl,
          albumIds: s.albumIds,
          year: s.year,
          color: 'linear-gradient(135deg, #8b5cf6, #0f0d1a)'
        }))
      );
    });
  }
  openAddToAlbum(songId: number, event: Event) {

    event.stopPropagation();

    const allSongs = [
      ...this.trendingTracks(),
      ...this.recentItems(),
      ...this.newestTracks()
    ];

    const clickedSong = allSongs.find(
      t => t.dbSongId === songId || t.id === songId
    );

    if (!this.isLoggedIn()) {

      this.selectedPreviewSong.set(
        clickedSong
      );

      this.showLoginMessage.set(true);

      return;
    }

    this.selectedSongAlbumIds.set(
      clickedSong?.albumIds ?? []
    );

    this.selectedSongId.set(clickedSong?.dbSongId ?? songId);

    this.selectedAlbumId.set(null);

    this.albumKeyword.set('');

    this.showAddToAlbum.set(true);

    this.fetchAlbums('');
  }

  closeAddToAlbum() {

    this.showAddToAlbum.set(false);

    this.selectedSongId.set(null);

    this.selectedAlbumId.set(null);
  }

  selectAlbum(album: AlbumResponse) {

    if (
      this.selectedSongAlbumIds()
        .includes(album.id)
    ) return;

    this.selectedAlbumId.set(album.id);
  }

  onAlbumSearch(event: Event) {

    const keyword =
      (event.target as HTMLInputElement).value;

    this.albumKeyword.set(keyword);

    this.albumSearch$.next(keyword);
  }

  private fetchAlbums(keyword: string) {

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
      .subscribe(res => {

        this.albumList.set(
          res.data ?? []
        );
      });
  }

  confirmAddToAlbum() {

    const songId = this.selectedSongId();

    const albumId = this.selectedAlbumId();

    if (!songId || !albumId) return;

    this.isAddingToAlbum.set(true);

    this.songService
      .addSongToAlbum(songId, albumId)
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

  private getRealDuration(url: string): Promise<number> {

    if (!url) {
      return Promise.resolve(0);
    }

    return new Promise((resolve) => {

      const audio = new Audio();

      audio.src = url;

      audio.onloadedmetadata = () => {
        resolve(
          Math.floor(audio.duration)
        );
      };

      audio.onerror = () => {
        resolve(0);
      };
    });
  }

  loadAlbums() {

    this.albumService.searchPublicAlbums({
      page: 1,
      pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
      asc: false,
      searchParams: {
        keyword: ''
      }
    }).subscribe(res => {

      const data = res.data ?? [];

      this.playlists.set(
        data.map((a: AlbumResponse) => ({
          id: a.id,
          name: a.title,
          desc: a.albumTypeName ?? 'Album',
          color: 'linear-gradient(135deg, #ec4899, #0f0d1a)'
        }))
      );
    });
  }

  formatDuration(sec: number): string {

    if (!sec) return '0:00';

    const m = Math.floor(sec / 60);

    const s = sec % 60;

    return `${m}:${s
      .toString()
      .padStart(2, '0')}`;
  }

  playRecentSong(id: any) {

    const clickedSong =
      this.recentQueue()
        .find(x => x.id === id || x.dbSongId === id);

    if (!clickedSong) return;

    if (!this.isLoggedIn()) {

      this.selectedPreviewSong.set(
        clickedSong
      );

      this.showLoginMessage.set(true);

      return;
    }

    this.player.setQueue(
      this.recentQueue()
    );

    if (clickedSong.videoId) {
      this.player.playYoutubeSong(clickedSong.id);
      return;
    }

    this.player.playSong(clickedSong.id);
  }

  playTrendingSong(id: any) {

    const clickedSong =
      this.trendingQueue()
        .find(x => x.id === id || x.dbSongId === id);

    if (!clickedSong) return;

    if (!this.isLoggedIn()) {

      this.selectedPreviewSong.set(
        clickedSong
      );

      this.showLoginMessage.set(true);

      return;
    }

    this.player.setQueue(
      this.trendingQueue()
    );

    if (clickedSong.videoId) {
      this.player.playYoutubeSong(clickedSong.id);
      return;
    }

    this.player.playSong(clickedSong.id);
  }

  playNewestSong(id: any) {

    const clickedSong =
      this.newestQueue()
        .find(x => x.id === id || x.dbSongId === id);

    if (!clickedSong) return;

    if (!this.isLoggedIn()) {

      this.selectedPreviewSong.set(
        clickedSong
      );

      this.showLoginMessage.set(true);

      return;
    }

    this.player.setQueue(
      this.newestQueue()
    );

    if (clickedSong.videoId) {
      this.player.playYoutubeSong(clickedSong.id);
      return;
    }

    this.player.playSong(clickedSong.id);
  }

  goLogin() {

    this.router.navigate([
      '/auth/login'
    ]);
  }

  goToPlaylist(
    tab: 'recent' | 'trending' | 'newest' = 'recent'
  ) {

    this.router.navigate(
      ['/users/playlist'],
      {
        queryParams: { tab }
      }
    );
  }
}