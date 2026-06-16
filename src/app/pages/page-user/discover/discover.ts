

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
import { Subject, takeUntil } from 'rxjs';

import { PlayerService } from '../../../core/services/player.service';
import { SongService } from '../../../core/services/song.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { PAGINATION_USER } from '../../../core/constants/pagination.constants';

import { YoutubeVideoResponse } from '../../../core/models/youtube/youtube-res.model';
import { YoutubeSearchRequest } from '../../../core/models/youtube/youtube-req.model';
import { AddSongHistoryRequest } from '../../../core/models/song/req-song.model';

interface SongRow {
  id: string;
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

  private destroy$ = new Subject<void>();

  songs = signal<SongRow[]>([]);
  isLoading = signal(false);

  keyword = signal('');
  highlightId = signal<string | null>(null);

  page = signal(PAGINATION_USER.DEFAULT_PAGE);
  totalPages = signal(1);

  currentTrackId = computed(
    () => this.player.currentTrack()?.id ?? null
  );

  ngOnInit(): void {
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

    const song = this.songs()
      .find(x => x.id === id);

    // if (song) {
    //   this.addHistory(song);
    // }

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

  // private addHistory(song: SongRow): void {

  //   const payload: AddSongHistoryRequest = {
  //     videoId: song.videoId,
  //     title: song.name,
  //     channel: song.artist,
  //     thumbnailHigh: song.imgUrl ?? '',
  //     duration: song.duration
  //   };

  //   this.songService
  //     .addSongHistory(payload)
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       error: (err) => {
  //         console.error('Add history failed', err);
  //       }
  //     });
  // }
}