import { Injectable, NgZone, inject, signal } from '@angular/core';
import { SongService } from './song.service';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

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

  private youtubePlayer: any = null;
  private youtubeReady = false;
  private youtubeTimer: ReturnType<typeof setInterval> | null = null;
  private pendingYoutubeVideoId: string | null = null;

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

  isYoutubeMode = signal(false);
  youtubeVideoId = signal<string | null>(null);

  constructor() {
    this.initAudioEvents();
    this.initYoutubePlayer();
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
  };

  private onDocumentMouseUp = () => {
    this.isDraggingVolume = false;
    this.volumeBarRef = null;

    document.removeEventListener('mousemove', this.onDocumentMouseMove);
    document.removeEventListener('mouseup', this.onDocumentMouseUp);
  };

  private updateVolume(clientX: number) {
    if (!this.volumeBarRef) return;

    const rect = this.volumeBarRef.getBoundingClientRect();
    const percent = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const volume = Math.round(percent * 100);

    this.volume.set(volume);
    this.audio.volume = percent;

    if (this.youtubePlayer) {
      this.youtubePlayer.setVolume(volume);
    }
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
    this.audio.src = '';

    this.stopYoutubeTimer();

    if (this.youtubePlayer) {
      this.youtubePlayer.stopVideo();
    }

    this.isYoutubeMode.set(false);
    this.youtubeVideoId.set(null);
    this.pendingYoutubeVideoId = null;

    this.currentTrack.set(null);
    this.queue = [];
    this.currentIndex = -1;

    this.isPlaying.set(false);
    this.currentTime.set('0:00');
    this.duration.set('0:00');
    this.currentTimeRaw.set(0);
    this.progressPercent.set(0);
  }

  playSong(id: number) {
    const current = this.currentTrack();

    if (current?.id === id && !this.isYoutubeMode()) {
      this.togglePlay();
      return;
    }

    const index = this.queue.findIndex(x => x.id === id);
    if (index === -1) return;

    this.currentIndex = index;
    this.startTrack(this.queue[index]);
  }

  playYoutubeSong(id: string) {
    const current = this.currentTrack();

    if (current?.id === id && this.isYoutubeMode()) {
      this.togglePlay();
      return;
    }

    const index = this.queue.findIndex(x => x.id === id);
    if (index === -1) return;

    this.currentIndex = index;

    const track = this.queue[index];

    this.audio.pause();
    this.audio.currentTime = 0;
    this.audio.src = '';

    this.hasAddedHistory = false;
    this.hasIncrementedView = false;
    this.listenedSeconds = 0;
    this.lastTime = 0;

    this.isYoutubeMode.set(true);
    this.youtubeVideoId.set(track.videoId);

    this.currentTrack.set({
      ...track,
      dbSongId: null,
      isLiked: track.isLiked ?? false,
      syncedLyrics: []
    });

    this.isLiked.set(track.isLiked ?? false);

    this.isPlaying.set(true);
    this.currentTime.set('0:00');
    this.duration.set(track.duration ? this.formatTime(track.duration) : '--:--');
    this.currentTimeRaw.set(0);
    this.progressPercent.set(0);

    this.addYoutubeHistory(track);
    this.loadYoutubeVideo(track.videoId);
  }

  private addYoutubeHistory(track: any) {
    if (this.hasAddedHistory) return;

    this.hasAddedHistory = true;

    this.songService
      .addSongHistory({
        videoId: track.videoId,
        title: track.name,
        channel: track.artist,
        thumbnailHigh: track.imgUrl ?? '',
        duration: track.duration ?? 0
      })
      .subscribe({
        next: (res: any) => {
          const song = res.data;
          if (!song?.id) return;

          const currentLiked = this.currentTrack()?.isLiked ?? track.isLiked ?? false;

          this.currentTrack.update((current: any) => ({
            ...current,
            dbSongId: song.id,
            views: song.views ?? current.views ?? 0,
            likes: song.likes ?? current.likes ?? 0,
            isLiked: currentLiked,
            youtubeVideoId: song.youtubeVideoId,
            playCount: song.playCount,
            sourceType: song.sourceType
          }));

          this.isLiked.set(currentLiked);
        }
      });
  }

  private startTrack(track: any) {
    this.stopYoutubeTimer();

    if (this.youtubePlayer) {
      this.youtubePlayer.stopVideo();
    }

    this.isYoutubeMode.set(false);
    this.youtubeVideoId.set(null);
    this.pendingYoutubeVideoId = null;

    this.hasAddedHistory = false;
    this.hasIncrementedView = false;
    this.listenedSeconds = 0;
    this.lastTime = 0;

    this.songService.getSongDetail(track.id).subscribe(res => {
      const detail = res.data;

      this.currentTrack.set({
        ...track,
        dbSongId: track.id,
        isLiked: detail?.isLiked ?? false,
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
    if (this.isYoutubeMode()) {
      if (!this.youtubePlayer) return;

      const state = this.youtubePlayer.getPlayerState?.();

      if (state === window.YT?.PlayerState?.PLAYING) {
        this.youtubePlayer.pauseVideo();
        this.isPlaying.set(false);
        return;
      }

      this.youtubePlayer.playVideo();
      this.isPlaying.set(true);
      this.startYoutubeTimer();
      return;
    }

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
    const current = this.currentTrack();
    if (!current) return;

    const songId = this.isYoutubeMode()
      ? current.dbSongId
      : current.id;

    if (!songId) return;

    this.songService.toggleLike(songId).subscribe((res: any) => {
      const data = res.data;
      const liked = data?.isLiked ?? !this.isLiked();

      this.isLiked.set(liked);

      this.currentTrack.update((track: any) => ({
        ...track,
        isLiked: liked,
        likes: data?.likes ?? track.likes
      }));
    });
  }

  nextTrack() {
    if (!this.queue.length) return;

    if (this.isShuffle()) {
      this.currentIndex = Math.floor(Math.random() * this.queue.length);
    } else {
      this.currentIndex = this.currentIndex + 1 >= this.queue.length
        ? 0
        : this.currentIndex + 1;
    }

    this.playCurrentTrack();
  }

  prevTrack() {
    if (!this.queue.length) return;

    this.currentIndex = this.currentIndex - 1 < 0
      ? this.queue.length - 1
      : this.currentIndex - 1;

    this.playCurrentTrack();
  }

  private playCurrentTrack() {
    const track = this.queue[this.currentIndex];
    if (!track) return;

    if (track.videoId) {
      this.playYoutubeSong(track.id);
      return;
    }

    this.startTrack(track);
  }

  seek(event: MouseEvent) {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const percent = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));

    if (this.isYoutubeMode()) {
      if (!this.youtubePlayer) return;

      const duration = this.youtubePlayer.getDuration?.() ?? 0;
      if (!duration) return;

      this.youtubePlayer.seekTo(percent * duration, true);
      this.syncYoutubeProgress();
      return;
    }

    if (!this.audio.duration) return;

    this.audio.currentTime = percent * this.audio.duration;
  }

  toggleMute() {
    this.isMuted.set(!this.isMuted());

    this.audio.muted = this.isMuted();

    if (!this.youtubePlayer) return;

    if (this.isMuted()) {
      this.youtubePlayer.mute();
    } else {
      this.youtubePlayer.unMute();
    }
  }

  toggleShuffle() {
    this.isShuffle.set(!this.isShuffle());
  }

  toggleRepeat() {
    this.isRepeat.set(!this.isRepeat());
  }

  private initAudioEvents() {
    this.audio.ontimeupdate = () => {
      this.zone.run(() => {
        if (this.isYoutubeMode()) return;

        const current = this.audio.currentTime;

        const delta = current - this.lastTime;
        if (delta > 0 && delta < 2) {
          this.listenedSeconds += delta;
        }

        this.lastTime = current;

        this.currentTimeRaw.set(current);
        this.currentTime.set(this.formatTime(current));

        if (this.audio.duration) {
          this.progressPercent.set((current / this.audio.duration) * 100);

          const listenedPercent = (this.listenedSeconds / this.audio.duration) * 100;

          if (!this.hasIncrementedView && listenedPercent >= 70) {
            this.hasIncrementedView = true;

            const currentTrack = this.currentTrack();

            if (currentTrack?.id) {
              this.songService
                .incrementView(currentTrack.id)
                .subscribe((res: any) => {
                  const data = res.data;
                  if (!data) return;

                  this.currentTrack.update((track: any) => ({
                    ...track,
                    views: data.views ?? track.views
                  }));
                });
            }
          }
        }
      });
    };

    this.audio.onloadedmetadata = () => {
      this.zone.run(() => {
        if (this.isYoutubeMode()) return;
        this.duration.set(this.formatTime(this.audio.duration));
      });
    };

    this.audio.onended = () => {
      this.zone.run(() => {
        if (this.isYoutubeMode()) return;

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

  private initYoutubePlayer() {
    const existing = document.getElementById('hidden-youtube-player');

    if (!existing) {
      const host = document.createElement('div');
      host.id = 'hidden-youtube-player';
      host.style.position = 'fixed';
      host.style.width = '1px';
      host.style.height = '1px';
      host.style.opacity = '0';
      host.style.pointerEvents = 'none';
      host.style.left = '-9999px';
      host.style.top = '-9999px';

      document.body.appendChild(host);
    }

    const createPlayer = () => {
      this.youtubePlayer = new window.YT.Player('hidden-youtube-player', {
        width: '1',
        height: '1',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0
        },
        events: {
          onReady: () => {
            this.zone.run(() => {
              this.youtubeReady = true;
              this.youtubePlayer.setVolume(this.volume());

              if (this.pendingYoutubeVideoId) {
                this.loadYoutubeVideo(this.pendingYoutubeVideoId);
              }
            });
          },
          onStateChange: (event: any) => {
            this.zone.run(() => this.handleYoutubeStateChange(event.data));
          }
        }
      });
    };

    if (window.YT?.Player) {
      createPlayer();
      return;
    }

    window.onYouTubeIframeAPIReady = () => {
      createPlayer();
    };

    if (!document.getElementById('youtube-iframe-api-script')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }
  }

  private loadYoutubeVideo(videoId: string) {
    if (!videoId) return;

    if (!this.youtubeReady || !this.youtubePlayer) {
      this.pendingYoutubeVideoId = videoId;
      return;
    }

    this.pendingYoutubeVideoId = null;

    this.youtubePlayer.loadVideoById(videoId);
    this.youtubePlayer.setVolume(this.volume());

    if (this.isMuted()) {
      this.youtubePlayer.mute();
    } else {
      this.youtubePlayer.unMute();
    }

    this.startYoutubeTimer();
  }

  private handleYoutubeStateChange(state: number) {
    if (!this.isYoutubeMode()) return;

    if (state === window.YT.PlayerState.PLAYING) {
      this.isPlaying.set(true);
      this.startYoutubeTimer();
      return;
    }

    if (state === window.YT.PlayerState.PAUSED) {
      this.isPlaying.set(false);
      return;
    }

    if (state === window.YT.PlayerState.ENDED) {
      this.stopYoutubeTimer();

      if (this.isRepeat()) {
        this.youtubePlayer.seekTo(0, true);
        this.youtubePlayer.playVideo();
        this.startYoutubeTimer();
        return;
      }

      if (this.currentIndex + 1 < this.queue.length) {
        this.nextTrack();
      } else {
        this.isPlaying.set(false);
      }
    }
  }

  private startYoutubeTimer() {
    if (this.youtubeTimer) return;

    this.youtubeTimer = setInterval(() => {
      this.zone.run(() => this.syncYoutubeProgress());
    }, 300);
  }

  private stopYoutubeTimer() {
    if (!this.youtubeTimer) return;

    clearInterval(this.youtubeTimer);
    this.youtubeTimer = null;
  }

  private syncYoutubeProgress() {
    if (!this.isYoutubeMode() || !this.youtubePlayer) return;

    const current = this.youtubePlayer.getCurrentTime?.() ?? 0;
    const duration = this.youtubePlayer.getDuration?.() ?? 0;

    const delta = current - this.lastTime;
    if (delta > 0 && delta < 2) {
      this.listenedSeconds += delta;
    }

    this.lastTime = current;

    this.currentTimeRaw.set(current);
    this.currentTime.set(this.formatTime(current));

    if (duration) {
      this.duration.set(this.formatTime(duration));
      this.progressPercent.set((current / duration) * 100);

      const listenedPercent = (this.listenedSeconds / duration) * 100;

      if (!this.hasIncrementedView && listenedPercent >= 70) {
        this.hasIncrementedView = true;

        const currentTrack = this.currentTrack();
        const songId = currentTrack?.dbSongId;

        if (songId) {
          this.songService
            .incrementView(songId)
            .subscribe((res: any) => {
              const data = res.data;
              if (!data) return;

              this.currentTrack.update((track: any) => ({
                ...track,
                views: data.views ?? track.views
              }));
            });
        }
      }
    }
  }

  private formatTime(sec: number) {
    if (!sec) return '0:00';

    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);

    return `${m}:${s < 10 ? '0' + s : s}`;
  }
}