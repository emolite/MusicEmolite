import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { SongService } from '../../../../core/services/song.service';
import { PlayerService } from '../../../../core/services/player.service';
import { AuthService } from '../../../../core/services/auth.service';

import { SongResponse } from '../../../../core/models/song/res-song.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { PAGINATION } from '../../../../core/constants/pagination.constants';

@Component({
  selector: 'app-album-detail',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './album-detail.html',
  styleUrl: './album-detail.css'
})
export class AlbumDetailComponent {

  private route = inject(ActivatedRoute);
  private songService = inject(SongService);
  player = inject(PlayerService);
  
  currentTrack = this.player.currentTrack;

  authService = inject(AuthService);

  songs = signal<any[]>([]);
  albumId = signal<number>(0);
  currentAlbum = signal<any>(null);
  isLoading = signal(false);
  page = signal(PAGINATION.DEFAULT_PAGE);
  totalPages = signal(0);
  selectedPreviewSong = signal<any>(null);
  showLoginMessage = signal(false);

  isLoggedIn = computed(() => !!this.authService.user());

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      this.albumId.set(id);
      this.loadSongs();
    });
  }

  loadSongs() {
    this.isLoading.set(true);

    this.songService.searchPublicSongs({
      page: this.page(),
      pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
      asc: false,
      searchParams: {
        keyword: '',
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

      this.songs.set(songs);

      this.player.setQueue(songs);

      this.totalPages.set(res.totalPages ?? 0);

      this.isLoading.set(false);
    });
  }

  playSong(id: number) {
    const song = this.songs().find(x => x.id === id);
    if (!song) return;

    if (!this.isLoggedIn()) {
      this.selectedPreviewSong.set(song);
      this.showLoginMessage.set(true);
      return;
    }

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

  onPageChange(page: number) {
    this.page.set(page);
    this.loadSongs();
  }
}