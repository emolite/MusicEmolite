import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { SongService } from '../../../../core/services/song.service';
import { PlayerService } from '../../../../core/services/player.service';

import { SongResponse } from '../../../../core/models/song/res-song.model';
import { PAGINATION_USER } from '../../../../core/constants/pagination.constants';
import { InfiniteScrollDirective } from '../../../../shared/directives/infinite-scroll.directive';

/**
 * Local, not PAGINATION_USER.DEFAULT_PAGE_SIZE - that constant is shared with
 * discover.ts's classic pagination, so changing it here would silently
 * change that unrelated page's page size too.
 */
const PAGE_SIZE = 50;

@Component({
  selector: 'app-album-detail',
  standalone: true,
  imports: [CommonModule, InfiniteScrollDirective],
  templateUrl: './album-detail.html',
  styleUrl: './album-detail.css'
})
export class AlbumDetailComponent {

  private route = inject(ActivatedRoute);
  private songService = inject(SongService);
  player = inject(PlayerService);

  currentTrack = this.player.currentTrack;

  songs = signal<any[]>([]);
  albumId = signal<number>(0);
  currentAlbum = signal<any>(null);
  isLoading = signal(false);
  isLoadingMore = signal(false);
  page = signal(PAGINATION_USER.DEFAULT_PAGE);
  totalPages = signal(0);

  hasMore = computed(() => this.page() < this.totalPages());

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      this.albumId.set(id);
      this.page.set(1);
      this.loadSongs();
    });
  }

  loadMore() {
    if (this.isLoading() || this.isLoadingMore() || !this.hasMore()) return;

    this.page.update(p => p + 1);
    this.loadSongs(true);
  }

  /** `append` distinguishes infinite-scroll loads (add to the list) from a fresh page-1 load (replace it). */
  loadSongs(append = false) {
    if (append) {
      this.isLoadingMore.set(true);
    } else {
      this.isLoading.set(true);
    }

    this.songService.searchPublicSongs({
      page: this.page(),
      pageSize: PAGE_SIZE,
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

      this.totalPages.set(res.totalPages ?? 0);

      if (append) {
        this.songs.update(list => [...list, ...songs]);
        this.isLoadingMore.set(false);
      } else {
        this.songs.set(songs);
        this.isLoading.set(false);
      }
    });
  }

  playSong(id: number) {
    const song = this.songs().find(x => x.id === id);
    if (!song) return;

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
}