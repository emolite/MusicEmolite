import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { SongService } from '../../../../core/services/song.service';
import { ArtistService } from '../../../../core/services/artist.service';
import { PlayerService } from '../../../../core/services/player.service';

import { SongResponse } from '../../../../core/models/song/res-song.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { PAGINATION } from '../../../../core/constants/pagination.constants';

@Component({
  selector: 'app-artist-detail',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './artist-detail.html',
  styleUrl: './artist-detail.css'
})
export class ArtistDetailComponent {

  private route = inject(ActivatedRoute);
  private songService = inject(SongService);
  private artistService = inject(ArtistService);
  player = inject(PlayerService);

  currentTrack = this.player.currentTrack;

  songs = signal<any[]>([]);
  artistId = signal<number>(0);
  currentArtist = signal<any>(null);
  isLoading = signal(false);
  page = signal(PAGINATION.DEFAULT_PAGE);
  totalPages = signal(0);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      this.artistId.set(id);
      this.loadArtist();
      this.loadSongs();
    });
  }

  loadArtist() {
    this.artistService.getArtistDetail(this.artistId())
      .subscribe(res => {
        this.currentArtist.set(res.data ?? null);
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
        artistId: this.artistId()
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

      this.totalPages.set(res.totalPages ?? 0);

      this.isLoading.set(false);
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

  onPageChange(page: number) {
    this.page.set(page);
    this.loadSongs();
  }
}
