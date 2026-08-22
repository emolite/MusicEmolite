import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../../core/services/player.service';
import { SongService } from '../../../core/services/song.service';
import { SongResponse } from '../../../core/models/song/res-song.model';
import { PAGINATION } from '../../../core/constants/pagination.constants';
import { InfiniteScrollDirective } from '../../../shared/directives/infinite-scroll.directive';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute } from '@angular/router';

/**
 * Local, not PAGINATION_USER.DEFAULT_PAGE_SIZE - that constant is shared with
 * discover.ts's classic pagination, so changing it here would silently
 * change that unrelated page's page size too.
 */
const PAGE_SIZE = 50;

@Component({
  selector: 'app-playlist',
  standalone: true,
  imports: [CommonModule, InfiniteScrollDirective],
  templateUrl: './playlist.html',
  styleUrl: './playlist.css',
})
export class PlaylistComponent implements OnInit {
  private songService = inject(SongService);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  player = inject(PlayerService);

  activeTab = signal<'recent' | 'trending' | 'newest' | 'most-played'>('recent');
  songs = signal<any[]>([]);
  isLoading = signal(true);
  isLoadingMore = signal(false);
  page = signal(PAGINATION.DEFAULT_PAGE);
  totalPages = signal(0);

  hasMore = computed(() => this.page() < this.totalPages());

  isLoggedIn = computed(() => !!this.authService.user());

  currentTrackId = computed(() =>
    this.player.currentTrack()?.id
  );

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];

      if (!this.isLoggedIn()) {
        if (tab === 'newest') {
          this.activeTab.set('newest');
        }
        else {
          this.activeTab.set('trending');
        }
      }
      else {
        if (tab === 'trending') {
          this.activeTab.set('trending');
        }
        else if (tab === 'newest') {
          this.activeTab.set('newest');
        }
        else if (tab === 'most-played') {
          this.activeTab.set('most-played');
        }
        else {
          this.activeTab.set('recent');
        }
      }

      this.page.set(1);
      this.loadSongs();
    });
  }

  setTab(tab: 'recent' | 'trending' | 'newest' | 'most-played') {
    if (this.activeTab() === tab) return;

    this.activeTab.set(tab);
    this.page.set(1);
    this.loadSongs();
  }

  loadMore() {
    if (this.isLoading() || this.isLoadingMore() || !this.hasMore()) return;

    this.page.update(p => p + 1);
    this.loadSongs(true);
  }

  /** `append` distinguishes infinite-scroll loads (add to the list) from a fresh tab/page-1 load (replace it). */
  private loadSongs(append = false) {
    if (!this.isLoggedIn() && (this.activeTab() === 'recent' || this.activeTab() === 'most-played')) {
      this.songs.set([]);
      this.totalPages.set(0);
      this.isLoading.set(false);
      return;
    }

    if (append) {
      this.isLoadingMore.set(true);
    } else {
      this.isLoading.set(true);
    }

    const request = {
      page: this.page(),
      pageSize: PAGE_SIZE,
      asc: false,
      searchParams: {
        keyword: ''
      }
    };

    let api$;

    switch (this.activeTab()) {
      case 'trending':
        api$ = this.songService.getTrendingSongs(request);
        break;

      case 'newest':
        api$ = this.songService.getNewestSongs(request);
        break;

      case 'most-played':
        api$ = this.songService.getMostPlayedSongs(20);
        break;

      default:
        api$ = this.songService.getRecentSongs(request);
        break;
    }

    api$.subscribe(res => {
      const data = res.data ?? [];

      this.totalPages.set(res.totalPages ?? 0);

      const mapped = data.map((s: SongResponse) => {
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

          duration: s.duration,

          url: isYoutube
            ? ''
            : s.fileUrl,

          imgUrl: s.imgUrl || null,

          likes: s.likes ?? 0,

          views: s.views ?? 0,

          isLiked: s.isLiked ?? false,

          typeSong: s.typeSong,

          albumIds: s.albumIds ?? []
        };
      });

      if (append) {
        this.songs.update(list => [...list, ...mapped]);
        this.isLoadingMore.set(false);
      } else {
        this.songs.set(mapped);
        this.isLoading.set(false);
      }
    });
  }

  playSong(id: any) {
    const clickedSong = this.songs()
      .find(x => x.id === id || x.dbSongId === id);

    if (!clickedSong) return;

    this.player.setQueue(this.songs());

    if (clickedSong.videoId) {
      this.player.playYoutubeSong(clickedSong.videoId);
      return;
    }

    this.player.playSong(clickedSong.dbSongId);
  }

  formatDuration(sec: number): string {
    if (!sec) return '0:00';

    const m = Math.floor(sec / 60);
    const s = sec % 60;

    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}