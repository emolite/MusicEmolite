import {
  Component,
  ElementRef,
  HostListener,
  QueryList,
  ViewChild,
  ViewChildren,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SongService } from '../../../core/services/song.service';
import { ToastService } from '../../../core/services/toast.service';

interface LyricLine {
  text: string;
  time: string;
}

@Component({
  selector: 'app-publish-lyrics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './publish-lyrics.html'
})
export class PublishLyricsComponent {

  private songService = inject(SongService);

  private toastService = inject(ToastService);

  @ViewChild('audioPlayer')
  audioPlayer!: ElementRef<HTMLAudioElement>;

  @ViewChildren('lyricLineRef')
  lyricLineRefs!: QueryList<ElementRef>;

  loading = false;

  activeTab: 'plain' | 'synced' = 'plain';

  audioUrl = '';

  currentLyricIndex = 0;

  lyricsLines: LyricLine[] = [];

  form = {
    trackName: '',
    artistName: '',
    albumName: '',
    duration: 0,
    plainLyrics: '',
    syncedLyrics: ''
  };

  onSelectAudio(event: Event) {

    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];

    this.audioUrl = URL.createObjectURL(file);
  }

  onAudioLoadedMetadata() {

    if (!this.audioPlayer?.nativeElement) {
      return;
    }

    this.form.duration = Math.floor(
      this.audioPlayer.nativeElement.duration || 0
    );
  }

  initializeSyncLyrics() {

    this.lyricsLines = this.form.plainLyrics
      .split('\n')
      .map(x => x.trim())
      .filter(Boolean)
      .map(text => ({
        text,
        time: ''
      }));

    this.currentLyricIndex = 0;

    this.form.syncedLyrics = '';

    this.toastService.success('Đã khởi tạo lyrics');
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {

    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    if (event.code === 'Space') {

      event.preventDefault();

      this.toggleAudio();
    }

    if (event.key.toLowerCase() === 'r') {

      event.preventDefault();

      this.syncCurrentLyric();
    }
  }

  toggleAudio() {

    if (!this.audioPlayer?.nativeElement) {
      return;
    }

    const audio = this.audioPlayer.nativeElement;

    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }

  syncCurrentLyric() {

    if (!this.audioPlayer?.nativeElement) {
      return;
    }

    if (this.currentLyricIndex >= this.lyricsLines.length) {

      this.toastService.success('Đã sync toàn bộ lyrics');

      return;
    }

    const currentTime =
      this.audioPlayer.nativeElement.currentTime;

    this.lyricsLines[this.currentLyricIndex].time =
      this.formatTime(currentTime);

    this.buildSyncedLyrics();

    this.currentLyricIndex++;

    setTimeout(() => {

      const nextElement =
        this.lyricLineRefs.get(this.currentLyricIndex);

      nextElement?.nativeElement?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

    });
  }

  jumpToLyric(index: number) {

    this.currentLyricIndex = index;

    const currentLine = this.lyricsLines[index];

    if (!currentLine?.time) {
      return;
    }

    if (!this.audioPlayer?.nativeElement) {
      return;
    }

    const parsedTime =
      this.parseTimestamp(currentLine.time);

    this.audioPlayer.nativeElement.currentTime =
      parsedTime;
  }

  removeLyricTimestamp(index: number) {

    this.lyricsLines[index].time = '';

    this.currentLyricIndex = index;

    this.buildSyncedLyrics();

    this.toastService.success('Đã xoá timestamp');
  }

  resetSyncLyrics() {

    this.lyricsLines = [];

    this.currentLyricIndex = 0;

    this.form.syncedLyrics = '';

    this.toastService.success('Đã reset lyrics');
  }

  buildSyncedLyrics() {

    this.form.syncedLyrics = this.lyricsLines
      .filter(x => x.time)
      .map(x => `${x.time} ${x.text}`)
      .join('\n');
  }

  parseTimestamp(time: string): number {

    const cleanTime = time
      .replace('[', '')
      .replace(']', '');

    const [minutes, remain] =
      cleanTime.split(':');

    const [seconds, milliseconds] =
      remain.split('.');

    return (
      Number(minutes) * 60 +
      Number(seconds) +
      Number(milliseconds) / 100
    );
  }

  formatTime(seconds: number): string {

    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');

    const remainSeconds = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');

    const milliseconds = Math.floor((seconds % 1) * 100)
      .toString()
      .padStart(2, '0');

    return `[${minutes}:${remainSeconds}.${milliseconds}]`;
  }

  validateForm(): boolean {

    if (!this.form.trackName.trim()) {

      this.toastService.error('Vui lòng nhập tên bài hát');

      return false;
    }

    if (!this.form.artistName.trim()) {

      this.toastService.error('Vui lòng nhập tên nghệ sĩ');

      return false;
    }

    if (!this.form.plainLyrics.trim()) {

      this.toastService.error('Vui lòng nhập lyrics');

      return false;
    }

    if (!this.form.syncedLyrics.trim()) {

      this.toastService.error('Vui lòng sync lyrics trước');

      return false;
    }

    return true;
  }

  publishLyrics() {

    if (this.loading) {
      return;
    }

    if (!this.validateForm()) {
      return;
    }

    this.loading = true;

    this.songService.publishLyrics(this.form)
      .subscribe({
        next: (res) => {

          this.toastService.success(
            res.message || 'Publish lyrics thành công'
          );

          this.loading = false;
        },

        error: (err) => {

          this.toastService.error(
            err?.error?.message ||
            'Publish lyrics thất bại'
          );

          this.loading = false;
        }
      });
  }
}