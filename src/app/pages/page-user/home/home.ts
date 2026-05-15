import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { SongService } from '../../../core/services/song.service';
import { AlbumService } from '../../../core/services/album.service';
import { PlayerService } from '../../../core/services/player.service';
import { AuthService } from '../../../core/services/auth.service';

import { SongResponse } from '../../../core/models/song/res-song.model';
import { AlbumResponse } from '../../../core/models/album/res-album.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
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

  showLoginMessage = signal(false);
  isLoggedIn = computed(() => !!this.authService.user());

  ngOnInit() {
    this.loadSongs();
    this.loadAlbums();
  }

  private getRealDuration(url: string): Promise<number> {
    return new Promise((resolve) => {
      const audio = new Audio();

      audio.src = url;

      audio.onloadedmetadata = () =>
        resolve(Math.floor(audio.duration));

      audio.onerror = () => resolve(0);
    });
  }

  async loadSongs() {
    this.songService.searchPublicSongs({
      page: 1,
      pageSize: 10,
      asc: false,
      searchParams: { keyword: '' }
    }).subscribe(async res => {
      const data = res.data ?? [];
      const queue = await Promise.all(
        data.map(async (s: SongResponse) => ({
          id: s.id,
          name: s.title,
          artist: s.artistName,
          duration: await this.getRealDuration(s.fileUrl),
          url: s.fileUrl,
          imgUrl: s.imgUrl || null,
          like: s.likes ?? 0,
          view: s.views ?? 0,
          year: s.createdAt
            ? new Date(s.createdAt).getFullYear()
            : ''
        }))
      );
      const sorted = [...queue].sort(
        (a, b) => (b.like + b.view) - (a.like + a.view)
      );
      this.featuredSong.set(sorted[0] ?? null);

      this.player.setQueue(queue);

      this.trendingTracks.set(queue.map((s: any) => ({
        id: s.id,
        name: s.name,
        artist: s.artist,
        like: s.like,
        view: s.view,
        plays: (s.like + s.view).toLocaleString(),
        imgUrl: s.imgUrl || null,
        color: 'linear-gradient(135deg, #3b82f6, #0f0d1a)'
      })));

      this.recentItems.set(queue.slice(0, 6).map((s: any) => ({
        id: s.id,
        name: s.name,
        artist: s.artist,
        imgUrl: s.imgUrl || null,
        color: 'linear-gradient(135deg, #8b5cf6, #0f0d1a)'
      })));
    });
  }

  loadAlbums() {
    this.albumService.searchPublicAlbums({
      page: 1,
      pageSize: 10,
      asc: false,
      searchParams: { keyword: '' }
    }).subscribe(res => {
      const data = res.data ?? [];
      this.playlists.set(data.map((a: AlbumResponse) => ({
        id: a.id,
        name: a.title,
        desc: a.albumTypeName ?? 'Album',
        color: 'linear-gradient(135deg, #ec4899, #0f0d1a)'
      })));
    });
  }

  formatDuration(sec: number): string {
    if (!sec) return '0:00';

    const m = Math.floor(sec / 60);
    const s = sec % 60;

    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  playSong(id: number) {

    if (!this.isLoggedIn) {
      this.showLoginMessage.set(true);
      return;
    }
    this.player.playSong(id);
  }

  goLogin() {
    this.router.navigate(['/auth/login']);
  }
}