import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../../core/services/player.service';
import { SongService } from '../../../core/services/song.service';
import { SongResponse } from '../../../core/models/song/res-song.model';
import { PAGINATION } from '../../../core/constants/pagination.constants';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-playlist',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './playlist.html',
  styleUrl: './playlist.css',
})
export class PlaylistComponent {
  private songService = inject(SongService);
  player = inject(PlayerService);

  songs = signal<any[]>([]);
  isLoading = signal(true);
  page = signal(PAGINATION.DEFAULT_PAGE);
  totalPages = signal(0);
  ngOnInit(): void {
    this.loadSongs();
  }

  private loadSongs() {
    this.songService.searchPublicSongs({
      page: this.page(),
      pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
      asc: false,
      searchParams: { keyword: '' }
    }).subscribe(res => {
      const data = res.data ?? [];
      const total = res.totalPages ?? 0;
      this.totalPages.set(total);
      const mapped = data.map((s: SongResponse) => ({
        id: s.id,
        name: s.title,
        artist: s.artistName,
        duration: s.duration,
        url: s.fileUrl,
        imgUrl: s.imgUrl || null,
        likes: s.likes ?? 0,
        views: s.views ?? 0,
        typeSong: s.typeSong,
      }));
      this.songs.set(mapped);
      this.player.setQueue(mapped);
      this.isLoading.set(false);
    });
  }

  currentTrackId = computed(() => this.player.currentTrack()?.id);

  playSong(id: number) {
    this.player.playSong(id);
  }

  onPageChange(page: number) {
    this.page.set(page);
    this.loadSongs();
  }

  formatDuration(sec: number): string {
    if (!sec) return '0:00';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}