import { Injectable, NgZone, inject, signal } from '@angular/core';
import { SongService } from './song.service';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private songService = inject(SongService);
  private zone = inject(NgZone);
  private audio = new Audio();
  private queue: any[] = [];
  private currentIndex = -1;
  private isDraggingVolume = false;
  private volumeBarRef: HTMLElement | null = null;
  private hasAddedHistory = false;
  private hasIncrementedView = false;
  private listenedSeconds = 0;
  private lastTime = 0;

  currentTrack = signal<any>(null);
  isPlaying = signal(false);
  isShuffle = signal(false);
  isRepeat = signal(false);
  isLiked = signal(false);
  isDetailOpen = signal(false);
  currentTime = signal('0:00');
  duration = signal('0:00');
  progressPercent = signal(0);
  volume = signal(100);
  isMuted = signal(false);
  isPlayerHidden = signal(false);
  currentTimeRaw = signal(0);

  constructor() {
    this.initAudioEvents();
  }

  togglePlayerBar() {
    this.isPlayerHidden.update(v => !v);
  }
  openDetail() {
    this.isDetailOpen.set(true);
  }

  closeDetail() {
    this.isDetailOpen.set(false);
  }

  startVolumeDrag(event: MouseEvent) {
    this.isDraggingVolume = true;
    this.volumeBarRef = event.currentTarget as HTMLElement;
    this.updateVolume(event.clientX);

    document.addEventListener('mousemove', this.onDocumentMouseMove);
    document.addEventListener('mouseup', this.onDocumentMouseUp);
  }

  private onDocumentMouseMove = (event: MouseEvent) => {
    if (!this.isDraggingVolume || !this.volumeBarRef) return;
    this.zone.run(() => this.updateVolume(event.clientX));
  }

  private onDocumentMouseUp = () => {
    this.isDraggingVolume = false;
    this.volumeBarRef = null;
    document.removeEventListener('mousemove', this.onDocumentMouseMove);
    document.removeEventListener('mouseup', this.onDocumentMouseUp);
  }

  private updateVolume(clientX: number) {
    if (!this.volumeBarRef) return;
    const rect = this.volumeBarRef.getBoundingClientRect();
    const percent = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    this.volume.set(Math.round(percent * 100));
    this.audio.volume = percent;
  }

  setVolume(event: MouseEvent) {
    this.volumeBarRef = event.currentTarget as HTMLElement;
    this.updateVolume(event.clientX);
  }

  setQueue(queue: any[]) {
    this.queue = queue;
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.currentTrack.set(null);
    this.queue = [];
    this.currentIndex = -1;
  }

  playSong(id: number) {
    const current = this.currentTrack();
    if (current?.id === id) {
      this.togglePlay();
      return;
    }
    const index = this.queue.findIndex(x => x.id === id);
    if (index === -1) return;
    this.currentIndex = index;
    this.startTrack(this.queue[index]);
  }

  private startTrack(track: any) {

    this.hasAddedHistory = false;
    this.hasIncrementedView = false;

    this.listenedSeconds = 0;
    this.lastTime = 0;

    this.songService.getSongDetail(track.id).subscribe(res => {

      const detail = res.data;

      this.currentTrack.set({
        ...track,
        isLiked: detail?.isLiked,
        imgUrl: detail?.imgUrl,
        releaseDate: detail?.releaseDate,
        syncedLyrics: detail?.syncedLyrics ?? [],
      });
      this.isLiked.set(detail?.isLiked ?? false);
      this.audio.src = track.url;
      this.audio.load();
      this.audio.play();
      this.isPlaying.set(true);
      if (!this.hasAddedHistory) {

        this.hasAddedHistory = true;

        this.songService
          .addSongHistory(track.id)
          .subscribe();
      }
    });
  }

  togglePlay() {
    if (!this.audio.src) return;
    if (this.audio.paused) {
      this.audio.play();
      this.isPlaying.set(true);
    } else {
      this.audio.pause();
      this.isPlaying.set(false);
    }
  }

  toggleLike() {
    if (!this.currentTrack()) return;
    this.songService.toggleLike(this.currentTrack().id).subscribe(() => {
      this.isLiked.set(!this.isLiked());
      this.currentTrack.update((track: any) => ({ ...track, isLiked: !track.isLiked }));
    });
  }

  nextTrack() {
    if (!this.queue.length) return;
    if (this.isShuffle()) {
      this.currentIndex = Math.floor(Math.random() * this.queue.length);
    } else {
      this.currentIndex = this.currentIndex + 1 >= this.queue.length ? 0 : this.currentIndex + 1;
    }
    this.startTrack(this.queue[this.currentIndex]);
  }

  prevTrack() {
    if (!this.queue.length) return;
    this.currentIndex = this.currentIndex - 1 < 0 ? this.queue.length - 1 : this.currentIndex - 1;
    this.startTrack(this.queue[this.currentIndex]);
  }

  seek(event: MouseEvent) {
    if (!this.audio.duration) return;
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const percent = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    this.audio.currentTime = percent * this.audio.duration;
  }

  toggleMute() {
    this.isMuted.set(!this.isMuted());
    this.audio.muted = this.isMuted();
  }

  toggleShuffle() { this.isShuffle.set(!this.isShuffle()); }
  toggleRepeat() {
    this.isRepeat.set(!this.isRepeat());
  }

  private initAudioEvents() {
    this.audio.ontimeupdate = () => {

      this.zone.run(() => {

        const current = this.audio.currentTime;

        const delta = current - this.lastTime;
        if (delta > 0 && delta < 2) {
          this.listenedSeconds += delta;
        }

        this.lastTime = current;

        this.currentTimeRaw.set(current);

        this.currentTime.set(
          this.formatTime(current)
        );

        if (this.audio.duration) {

          this.progressPercent.set(
            (current / this.audio.duration) * 100
          );

          const listenedPercent =
            (this.listenedSeconds / this.audio.duration) * 100;

          if (
            !this.hasIncrementedView &&
            listenedPercent >= 70
          ) {

            this.hasIncrementedView = true;

            const currentTrack = this.currentTrack();

            if (currentTrack?.id) {

              this.songService
                .incrementView(currentTrack.id)
                .subscribe();
            }
          }
        }
      });
    };

    this.audio.onloadedmetadata = () => {
      this.zone.run(() => this.duration.set(this.formatTime(this.audio.duration)));
    };

    this.audio.onended = () => {
      this.zone.run(() => {
        if (this.isRepeat()) {
          this.audio.currentTime = 0;
          this.audio.play();
        } else {
          if (this.currentIndex + 1 < this.queue.length) {
            this.nextTrack();
          } else {
            this.isPlaying.set(false);
          }
        }
      });
    };
  }

  private formatTime(sec: number) {
    if (!sec) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' + s : s}`;
  }
}