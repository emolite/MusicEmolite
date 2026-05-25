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

interface SongRow {
  id: number;
  name: string;
  artist: string;
  duration: number;
  imgUrl?: string;
  views: number;
  url: string;
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
export class DiscoverComponent {

  player = inject(PlayerService);

  private songService = inject(SongService);
  private route = inject(ActivatedRoute);

  private destroy$ = new Subject<void>();

  songs = signal<SongRow[]>([]);
  isLoading = signal(false);

  keyword = signal('');
  highlightId = signal<number | null>(null);

  page = signal(PAGINATION_USER.DEFAULT_PAGE);
  totalPages = signal(1);

  currentTrackId = computed(
    () => this.player.currentTrack()?.id ?? null
  );

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {

        this.keyword.set(
          params['keyword'] ?? ''
        );

        this.highlightId.set(
          params['highlightId']
            ? Number(params['highlightId'])
            : null
        );

        this.page.set(
          PAGINATION_USER.DEFAULT_PAGE
        );

        this.loadSongs();
      });
  }

  ngOnDestroy(): void {

    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSongs() {

    this.isLoading.set(true);

    this.songService.searchPublicSongs({
      page: this.page(),
      pageSize: PAGINATION_USER.DEFAULT_PAGE_SIZE,
      searchParams: {
        keyword: this.keyword()
      }
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({

        next: (res) => {

          let items: SongRow[] =
            (res.data ?? []).map((s: any) =>
              this.mapSong(s)
            );

          const hId = this.highlightId();
          if (hId) {

            const idx =
              items.findIndex(x => x.id === hId);

            if (idx > 0) {

              const [selected] =
                items.splice(idx, 1);

              items.unshift(selected);
            }
          }

          this.songs.set(items);

          this.totalPages.set(
            res.totalPages
          );

          this.player.setQueue(items);
          this.isLoading.set(false);
        },

        error: () => {
          this.isLoading.set(false);
        }
      });
  }

  playSong(id: number) {

    this.player.setQueue(this.songs());
    this.player.playSong(id);
  }

  onPageChange(page: number) {
    this.page.set(page);
    this.loadSongs();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  private mapSong(s: any): SongRow {
    return {
      id: s.id,
      name: s.title,
      artist: s.artistName ?? '',
      duration: s.duration,
      imgUrl: s.imgUrl,
      views: s.views,
      url: s.fileUrl,
    };
  }

  formatDuration(sec: number): string {

    if (!sec) return '0:00';

    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);

    return `${m}:${s < 10 ? '0' + s : s}`;
  }
}