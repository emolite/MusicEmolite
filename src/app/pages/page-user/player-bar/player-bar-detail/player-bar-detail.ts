import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, QueryList, signal, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../../../core/services/player.service';


@Component({
  selector: 'app-player-bar-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-bar-detail.html',
  styleUrl: './player-bar-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerBarDetailComponent {
  player = inject(PlayerService);
  @ViewChild('lyricsContainer') lyricsContainer!: ElementRef<HTMLElement>;
  @ViewChildren('lyricLine') lyricLines!: QueryList<ElementRef<HTMLElement>>;
  loading = signal(true);
  song = computed(() => {
    const track = this.player.currentTrack();
    if (!track) return null;
    return track;
  });
  progress = computed(() => this.player.progressPercent());

  syncedLyrics = computed(() => {
    const track = this.player.currentTrack();
    if (!track?.syncedLyrics) return [];
    return track.syncedLyrics as { time: number; text: string }[];
  });

  activeLyricIndex = computed(() => {
    const t = this.player.currentTimeRaw();
    const lyrics = this.syncedLyrics();
    let idx = -1;
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (t >= lyrics[i].time) { idx = i; break; }
    }
    return idx;
  });
  constructor() {
    effect(() => {
      const idx = this.activeLyricIndex();
      if (idx < 0) return;
      setTimeout(() => {
        const container = this.lyricsContainer?.nativeElement;
        const lines = this.lyricLines?.toArray();
        if (!container || !lines?.[idx]) return;
        const el = lines[idx].nativeElement;
        container.scrollTo({
          top: el.offsetTop - container.clientHeight / 2 + el.offsetHeight / 2,
          behavior: 'smooth'
        });
      }, 0);
    });
  }
}