import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { SongService } from '../../../core/services/song.service';
import { AlbumService } from '../../../core/services/album.service';
import { PlayerService } from '../../../core/services/player.service';
import { AuthService } from '../../../core/services/auth.service';

import { SongResponse } from '../../../core/models/song/res-song.model';
import { AlbumResponse } from '../../../core/models/album/res-album.model';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { AlbumRequest } from '../../../core/models/album/req-album.model';
import { BaseSearchDto } from '../../../core/models/base/base-search.model';
import { PAGINATION } from '../../../core/constants/pagination.constants';

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
  private player = inject(PlayerService);
  private router = inject(Router);
  private authService = inject(AuthService);

  recentItems = signal<any[]>([]);
  trendingTracks = signal<any[]>([]);
  playlists = signal<any[]>([]);
  featuredSong = signal<any>(null);

  recentQueue = signal<any[]>([]);
  trendingQueue = signal<any[]>([]);

  showAddToAlbum = signal(false);
  selectedSongId = signal<number | null>(null);
  selectedAlbumId = signal<number | null>(null);

  albumList = signal<AlbumResponse[]>([]);
  selectedSongAlbumIds = signal<number[]>([]);
  albumKeyword = signal('');

  isAddingToAlbum = signal(false);

  selectedPreviewSong = signal<any>(null);
  showLoginMessage = signal(false);

  isLoggedIn = computed(() => !!this.authService.user());

  private albumSearch$ = new Subject<string>();

  ngOnInit() {
    this.loadSongs();
    this.loadAlbums();

    this.albumSearch$
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(keyword => {
        this.fetchAlbums(keyword);
      });
  }

  openAddToAlbum(songId: number, event: Event) {
    event.stopPropagation();

    const allSongs = [
      ...this.trendingTracks(),
      ...this.recentItems()
    ];

    const clickedSong = allSongs.find(t => t.id === songId);

    if (!this.isLoggedIn()) {
      this.selectedPreviewSong.set(clickedSong);
      this.showLoginMessage.set(true);
      return;
    }

    this.selectedSongAlbumIds.set(clickedSong?.albumIds ?? []);
    this.selectedSongId.set(songId);
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
    if (this.selectedSongAlbumIds().includes(album.id)) return;
    this.selectedAlbumId.set(album.id);
  }

  onAlbumSearch(event: Event) {
    const keyword = (event.target as HTMLInputElement).value;

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

    this.albumService.searchAlbums(payload).subscribe(res => {
      this.albumList.set(res.data ?? []);
    });
  }

  confirmAddToAlbum() {
    const songId = this.selectedSongId();
    const albumId = this.selectedAlbumId();

    if (!songId || !albumId) return;

    this.isAddingToAlbum.set(true);

    this.songService.addSongToAlbum(songId, albumId).subscribe({
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
    return new Promise((resolve) => {
      const audio = new Audio();

      audio.src = url;

      audio.onloadedmetadata = () => {
        resolve(Math.floor(audio.duration));
      };

      audio.onerror = () => {
        resolve(0);
      };
    });
  }

  async loadSongs() {
    if (this.isLoggedIn()) {

      this.songService.getRecentSongs({
        page: 1,
        pageSize: 14,
        asc: false,
        searchParams: {
          keyword: ''
        }
      }).subscribe(async recentRes => {

        const recentData = recentRes.data ?? [];

        const recentQueue = await Promise.all(
          recentData.map(async (s: SongResponse) => ({
            id: s.id,
            name: s.title,
            artist: s.artistName,
            duration: await this.getRealDuration(s.fileUrl),
            url: s.fileUrl,
            imgUrl: s.imgUrl || null,
            like: s.likes ?? 0,
            view: s.views ?? 0,
            albumIds: s.albumIds ?? [],
            year: s.createdAt
              ? new Date(s.createdAt).getFullYear()
              : ''
          }))
        );

        this.recentQueue.set(recentQueue);

        this.recentItems.set(
          recentQueue.slice(0, 6).map((s: any) => ({
            id: s.id,
            name: s.name,
            artist: s.artist,
            duration: s.duration,
            url: s.url,
            imgUrl: s.imgUrl || null,
            albumIds: s.albumIds ?? [],
            views: s.view ?? 0,
            color: 'linear-gradient(135deg, #8b5cf6, #0f0d1a)'
          }))
        );
      });
    }

    const trendingRequest = this.songService.getTrendingSongs({
      page: 1,
      pageSize: 14,
      asc: false,
      searchParams: {
        keyword: ''
      }
    });

    trendingRequest.subscribe(async trendingRes => {

      const trendingData = trendingRes.data ?? [];

      const trendingQueue = await Promise.all(
        trendingData.map(async (s: SongResponse) => ({
          id: s.id,
          name: s.title,
          artist: s.artistName,
          duration: await this.getRealDuration(s.fileUrl),
          url: s.fileUrl,
          imgUrl: s.imgUrl || null,
          like: s.likes ?? 0,
          view: s.views ?? 0,
          albumIds: s.albumIds ?? [],
          year: s.createdAt
            ? new Date(s.createdAt).getFullYear()
            : ''
        }))
      );

      this.trendingQueue.set(trendingQueue);

      this.featuredSong.set(trendingQueue[0] ?? null);

      this.trendingTracks.set(
        trendingQueue.map((s: any) => ({
          id: s.id,
          name: s.name,
          artist: s.artist,
          duration: s.duration,
          url: s.url,
          like: s.like,
          view: s.view,
          plays: s.view.toLocaleString(),
          imgUrl: s.imgUrl || null,
          albumIds: s.albumIds ?? [],
          color: 'linear-gradient(135deg, #3b82f6, #0f0d1a)'
        }))
      );
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

    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  playRecentSong(id: number) {

    const clickedSong = this.recentQueue().find(x => x.id === id);

    if (!clickedSong) return;

    if (!this.isLoggedIn()) {
      this.selectedPreviewSong.set(clickedSong);
      this.showLoginMessage.set(true);
      return;
    }

    this.player.setQueue(this.recentQueue());
    this.player.playSong(id);
  }

  playTrendingSong(id: number) {

    const clickedSong = this.trendingQueue().find(x => x.id === id);

    if (!clickedSong) return;

    if (!this.isLoggedIn()) {
      this.selectedPreviewSong.set(clickedSong);
      this.showLoginMessage.set(true);
      return;
    }

    this.player.setQueue(this.trendingQueue());
    this.player.playSong(id);
  }

  goLogin() {
    this.router.navigate(['/auth/login']);
  }

  goToPlaylist(tab: 'recent' | 'trending' = 'recent') {
    this.router.navigate(
      ['/users/playlist'],
      {
        queryParams: { tab }
      }
    );
  }
}