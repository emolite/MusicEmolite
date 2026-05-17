import { Component, inject, ChangeDetectorRef, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SongService } from '../../../../core/services/song.service';
import { ArtistService } from '../../../../core/services/artist.service';
import { AlbumService } from '../../../../core/services/album.service';
import { ToastService } from '../../../../core/services/toast.service';
import {
  DropdownComponent,
  DropdownOption
} from '../../../../shared/components/dropdown/dropdown';

import { SongCreateRequest, SongLyricsCreateRequest, LyricsLine } from '../../../../core/models/song/req-song.model';
import { AddArtistComponent } from '../add-artist/add-artist';
import { LyricsPreviewComponent } from '../lyrics-preview/lyrics-preview';
import { SongType } from '../../../../core/enums/song-type.enums';

@Component({
  selector: 'app-add-music',
  standalone: true,
  imports: [
    DropdownComponent,
    FormsModule,
    AddArtistComponent,
    LyricsPreviewComponent
  ],
  templateUrl: './add-music.html'
})
export class AddMusicComponent {

  private songService = inject(SongService);
  private artistService = inject(ArtistService);
  private albumService = inject(AlbumService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  model: SongCreateRequest = {
    title: '',
    releaseDate: '',
    artistId: 0,
    albumId: 0,
    fileUrl: {} as File,
    imgUrl: {} as File,
    type: SongType.Public,
  };

  artistOptions: DropdownOption[] = [];
  albumOptions: DropdownOption[] = [];

  showArtistModal = false;
  showLyricsPreview = false;

  imagePreview: string | null = null;
  audioName = '';
  isSubmitting = signal(false);
  isLoadingLyrics = signal(false);

  selectedArtistName = '';

  lyricsMode: 'none' | 'manual' | 'auto' = 'none';
  plainLyrics = '';
  syncedLyricsRaw = '';
  syncedLyricsParsed: LyricsLine[] = [];
  lyricsError = '';

  previewAudioUrl: string | null = null;
  previewCurrentTime = 0;
  previewCurrentLine = -1;
  private audioEl: HTMLAudioElement | null = null;
  private animFrame: number | null = null;

  ngOnInit() {
    this.loadArtists();
    this.loadAlbums();
  }

  ngOnDestroy() {
    this.stopPreviewAudio();
  }

  loadArtists() {
    this.artistService.searchArtists({
      page: 1,
      pageSize: 50,
      searchParams: { keyword: '' }
    }).subscribe(res => {
      this.artistOptions = res.data?.map(x => ({
        label: x.stageName || x.name,
        value: x.id
      })) || [];
    });
  }

  loadAlbums() {
    this.albumService.searchAlbums({
      page: 1,
      pageSize: 50,
      searchParams: { keyword: '' }
    }).subscribe(res => {
      this.albumOptions = res.data?.map(x => ({
        label: x.title,
        value: x.id
      })) || [];
    });
  }

  onArtistSelect(option: DropdownOption | null) {
    this.model.artistId = option?.value ?? 0;
    this.selectedArtistName = option?.label ?? '';
  }

  onAlbumSelect(option: DropdownOption | null) {
    this.model.albumId = option?.value ?? 0;
  }

  openArtistModal() {
    this.showArtistModal = true;
  }

  closeArtistModal() {
    this.showArtistModal = false;
  }

  onArtistCreated(_: any) {
    this.closeArtistModal();
    this.loadArtists();
  }

  onAudioChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.model.fileUrl = file;
    this.audioName = file.name;
    if (this.previewAudioUrl) {
      URL.revokeObjectURL(this.previewAudioUrl);
    }
    this.previewAudioUrl = URL.createObjectURL(file);
  }

  onImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.model.imgUrl = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  async compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e: any) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const scale = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          if (!ctx) { resolve(file); return; }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (!blob) { resolve(file); return; }
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          }, 'image/jpeg', 0.8);
        };
      };
    });
  }

  removeAudio() {
    this.audioName = '';
    this.model.fileUrl = {} as File;
    if (this.previewAudioUrl) {
      URL.revokeObjectURL(this.previewAudioUrl);
      this.previewAudioUrl = null;
    }
  }

  setLyricsMode(mode: 'none' | 'manual' | 'auto') {
    this.lyricsMode = mode;
    this.lyricsError = '';
    if (mode === 'auto') {
      this.fetchLyricsAuto();
    }
  }

  fetchLyricsAuto() {
    if (!this.model.title) {
      this.lyricsError = 'Vui lòng nhập tên bài hát trước';
      this.cdr.markForCheck();
      return;
    }
    this.isLoadingLyrics.set(true);
    this.lyricsError = '';
    this.songService.getLyrics({
      title: this.model.title,
      artist: this.selectedArtistName || undefined
    }).subscribe({
      next: (res) => {
        console.log('lyrics res:', res);
        const data = (res as any).data ?? res;
        if (!data || (!data.lyrics && !data.rawSyncedLyrics && !data.syncedLyrics?.length)) {
          this.lyricsError = 'Không tìm thấy lyrics cho bài hát này';
          this.isLoadingLyrics.set(false);
          this.cdr.markForCheck();
          return;
        }
        this.plainLyrics = data.lyrics || '';
        this.syncedLyricsParsed = data.syncedLyrics || [];
        this.syncedLyricsRaw = data.rawSyncedLyrics || this.buildRawSynced(data.syncedLyrics || []);
        this.isLoadingLyrics.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.lyricsError = 'Lỗi khi tải lyrics. Vui lòng thử lại.';
        this.isLoadingLyrics.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  buildRawSynced(lines: LyricsLine[]): string {
    return lines.map(l => {
      const totalSeconds = l.time;
      const m = Math.floor(totalSeconds / 60);
      const s = (totalSeconds % 60).toFixed(2).padStart(5, '0');
      return `[${String(m).padStart(2, '0')}:${s}] ${l.text}`;
    }).join('\n');
  }

  parseSyncedLyrics(raw: string): LyricsLine[] {
    const lines: LyricsLine[] = [];
    const regex = /\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)/g;
    let match;
    while ((match = regex.exec(raw)) !== null) {
      const text = match[3].trim();
      if (!text) continue;
      if (/\[\d+:\d+/.test(text)) continue;
      const minutes = parseInt(match[1], 10);
      const seconds = parseFloat(match[2]);
      lines.push({
        time: minutes * 60 + seconds,
        text
      });
    }
    return lines.sort((a, b) => a.time - b.time);
  }

  onSyncedRawChange() {
    this.syncedLyricsParsed = this.parseSyncedLyrics(this.syncedLyricsRaw);
  }

  getLyricsForSubmit(): SongLyricsCreateRequest | undefined {
    if (this.lyricsMode === 'none') return undefined;
    return {
      lyrics: this.plainLyrics,
      syncedLyrics: this.syncedLyricsParsed.length
        ? this.syncedLyricsParsed
        : this.parseSyncedLyrics(this.syncedLyricsRaw)
    };
  }

  openLyricsPreview() {
    this.syncedLyricsParsed = this.parseSyncedLyrics(this.syncedLyricsRaw);
    this.showLyricsPreview = true;
    this.previewCurrentTime = 0;
    this.previewCurrentLine = -1;
    this.cdr.detectChanges();
    setTimeout(() => this.initPreviewAudio(), 50);
  }

  closeLyricsPreview() {
    this.stopPreviewAudio();
    this.showLyricsPreview = false;
  }

  private initPreviewAudio() {
    if (!this.previewAudioUrl) return;
    this.audioEl = document.getElementById('preview-audio') as HTMLAudioElement;
    if (!this.audioEl) return;
    this.audioEl.ontimeupdate = () => {
      this.previewCurrentTime = (this.audioEl?.currentTime ?? 0) * 1000;
      this.updateCurrentLine();
      this.cdr.detectChanges();
    };
  }

  private updateCurrentLine() {
    const t = this.previewCurrentTime;
    const lines = this.syncedLyricsParsed;
    let idx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].time <= t) idx = i;
      else break;
    }
    if (idx !== this.previewCurrentLine) {
      this.previewCurrentLine = idx;
      if (idx >= 0) {
        const el = document.getElementById(`lyric-line-${idx}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  private stopPreviewAudio() {
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.ontimeupdate = null;
      this.audioEl = null;
    }
    if (this.animFrame !== null) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = null;
    }
  }

  submit() {
    if (this.isSubmitting()) return;
    if (
      !this.model.title ||
      !this.model.releaseDate ||
      !this.model.artistId ||
      !this.model.albumId ||
      !this.model.fileUrl ||
      !this.model.imgUrl
    ) {
      this.toastService.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    this.isSubmitting.set(true);
    this.model.lyrics = this.getLyricsForSubmit();
    this.songService.createSong(this.model).subscribe({
      next: () => {
        this.toastService.success('Tạo bài hát thành công');
        this.resetForm();
        this.cdr.markForCheck();
      },
      error: () => {
        this.toastService.error('Tạo bài hát thất bại');
        this.isSubmitting.set(false);
        this.cdr.markForCheck();
      },
      complete: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  resetForm() {
    this.model = {
      title: '',
      releaseDate: '',
      artistId: 0,
      albumId: 0,
      fileUrl: {} as File,
      imgUrl: {} as File,
      type: SongType.Public
    };
    this.audioName = '';
    this.imagePreview = null;
    this.lyricsMode = 'none';
    this.plainLyrics = '';
    this.syncedLyricsRaw = '';
    this.syncedLyricsParsed = [];
    this.selectedArtistName = '';
    if (this.previewAudioUrl) {
      URL.revokeObjectURL(this.previewAudioUrl);
      this.previewAudioUrl = null;
    }
  }
}