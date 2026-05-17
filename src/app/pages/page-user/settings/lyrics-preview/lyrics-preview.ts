import {
  Component, Input, Output, EventEmitter,
  OnChanges, OnDestroy, SimpleChanges,
  ElementRef, ViewChild,
  ChangeDetectionStrategy, ChangeDetectorRef, inject,
  NgZone
} from '@angular/core';
import { LyricsLine } from '../../../../core/models/song/req-song.model';

@Component({
  selector: 'app-lyrics-preview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lyrics-preview.html',
  styleUrl: './lyrics-preview.css'
})
export class LyricsPreviewComponent implements OnChanges, OnDestroy {

  @Input() open = false;
  @Input() songTitle = '';
  @Input() artistName = '';
  @Input() imgUrl: string | null = null;
  @Input() audioUrl: string | null = null;
  @Input() lines: LyricsLine[] = [];

  @Output() close = new EventEmitter<void>();

  @ViewChild('lyricsContainer') lyricsContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('audioEl') audioEl!: ElementRef<HTMLAudioElement>;
  @ViewChild('seekBar') seekBar!: ElementRef<HTMLInputElement>;
  @ViewChild('timeDisplay') timeDisplay!: ElementRef<HTMLSpanElement>;
  @ViewChild('vinylImg') vinylImg!: ElementRef<HTMLDivElement>;

  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  currentLine = -1;
  currentTime = 0;
  duration = 0;
  isPlaying = false;

  private rafId: number | null = null;
  private rotation = 0;
  private lastTimestamp: number | null = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['open']) {
      if (this.open) {
        this.currentLine = -1;
        this.currentTime = 0;
        this.rotation = 0;
        this.lastTimestamp = null;

        this.cdr.markForCheck();

        queueMicrotask(() => {
          this.startRaf();
        });

      } else {
        this.stopRaf();
      }
    }
  }

  ngOnDestroy() {
    this.stopRaf();
  }

  private startRaf() {
    this.zone.runOutsideAngular(() => {
      const tick = (timestamp: number) => {
        const audio = this.audioEl?.nativeElement;
        if (audio) {
          const newTime = audio.currentTime;
          const newDuration = audio.duration || 0;
          const newPlaying = !audio.paused;
          const newLine = this.getActiveLine(newTime);

          this.currentTime = newTime;
          this.duration = newDuration;
          this.isPlaying = newPlaying;

          this.updateSeekBarDOM(newTime, newDuration);
          this.updateTimeDOM(newTime);
          this.updateVinylRotation(timestamp, newPlaying);

          if (newLine !== this.currentLine) {
            this.currentLine = newLine;
            this.scrollToLine(newLine);
            this.zone.run(() => this.cdr.markForCheck());
          }
        }
        this.rafId = requestAnimationFrame(tick);
      };
      this.rafId = requestAnimationFrame(tick);
    });
  }

  private updateVinylRotation(timestamp: number, playing: boolean) {
    if (playing && this.lastTimestamp !== null) {
      const delta = timestamp - this.lastTimestamp;
      this.rotation = (this.rotation + delta * 0.03) % 360;
      const el = this.vinylImg?.nativeElement;
      if (el) el.style.transform = `rotate(${this.rotation}deg)`;
    }
    this.lastTimestamp = timestamp;
  }

  private updateSeekBarDOM(time: number, duration: number) {
    const bar = this.seekBar?.nativeElement;
    if (!bar || !duration) return;
    bar.value = String(time);
    bar.max = String(duration);
    const pct = (time / (duration)) * 100;
    bar.style.setProperty('--pct', `${pct}%`);
  }

  private updateTimeDOM(time: number) {
    const el = this.timeDisplay?.nativeElement;
    if (!el) return;
    el.textContent = this.formatTime(time);
  }

  private stopRaf() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.lastTimestamp = null;
  }

  private getActiveLine(t: number): number {
    let idx = -1;
    for (let i = 0; i < this.lines.length; i++) {
      if (this.lines[i].time <= t) idx = i;
      else break;
    }
    return idx;
  }

  private scrollToLine(idx: number) {
    if (idx < 0) return;
    const el = document.getElementById('pl-' + idx);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  onAudioLoaded() {
    this.duration = this.audioEl?.nativeElement?.duration || 0;
    this.cdr.markForCheck();
  }

  togglePlay() {
    const audio = this.audioEl?.nativeElement;
    if (!audio) return;
    audio.paused ? audio.play() : audio.pause();
    this.isPlaying = !audio.paused;
    this.cdr.markForCheck();
  }

  onSeek(event: Event) {
    const input = event.target as HTMLInputElement;
    const audio = this.audioEl?.nativeElement;
    if (!audio) return;
    audio.currentTime = parseFloat(input.value);
  }

  formatTime(seconds: number): string {
    const s = Math.floor(seconds);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  getLineColor(idx: number): string {
    const diff = Math.abs(idx - this.currentLine);
    if (diff === 0) return '#c4b5fd';
    if (diff === 1) return 'rgba(196,181,253,0.5)';
    return 'rgba(255,255,255,0.2)';
  }

  getLineOpacity(idx: number): string {
    const diff = Math.abs(idx - this.currentLine);
    if (diff === 0) return '1';
    if (diff === 1) return '0.7';
    if (diff === 2) return '0.4';
    return '0.2';
  }

  onBackdropClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('backdrop')) {
      this.close.emit();
    }
  }
}