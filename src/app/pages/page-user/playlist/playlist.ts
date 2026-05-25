import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../../core/services/player.service';
import { SongService } from '../../../core/services/song.service';
import { SongResponse } from '../../../core/models/song/res-song.model';
import { PAGINATION, PAGINATION_USER } from '../../../core/constants/pagination.constants';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-playlist',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './playlist.html',
  styleUrl: './playlist.css',
})
export class PlaylistComponent {
  private songService = inject(SongService);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  player = inject(PlayerService);
  activeTab = signal<'recent' | 'trending'>('recent');
  songs = signal<any[]>([]);
  isLoading = signal(true);
  page = signal(PAGINATION.DEFAULT_PAGE);
  totalPages = signal(0);
  showLoginMessage = signal(false);
  isLoggedIn = computed(() => !!this.authService.user());
  selectedPreviewSong = signal<any>(null);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {

      const tab = params['tab'];

      if (!this.isLoggedIn()) {
        this.activeTab.set('trending');
      }
      else if (tab === 'trending') {
        this.activeTab.set('trending');
      }
      else {
        this.activeTab.set('recent');
      }

      this.loadSongs();
    });
  }

  setTab(tab: 'recent' | 'trending') {
    if (this.activeTab() === tab) return;
    this.activeTab.set(tab);
    this.page.set(1);
    this.loadSongs();
  }

  private loadSongs() {

    if (!this.isLoggedIn() && this.activeTab() === 'recent') {
      this.songs.set([]);
      this.totalPages.set(0);
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);

    const request = {
      page: this.page(),
      pageSize: PAGINATION_USER.DEFAULT_PAGE_SIZE,
      asc: false,
      searchParams: {
        keyword: ''
      }
    };

    const api$ =
      this.activeTab() === 'trending'
        ? this.songService.getTrendingSongs(request)
        : this.songService.getRecentSongs(request);

    api$.subscribe(res => {

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
    const clickedSong = this.songs().find(x => x.id === id);
    if (!this.isLoggedIn()) {
      this.selectedPreviewSong.set(clickedSong);
      this.showLoginMessage.set(true);
      return;
    }

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