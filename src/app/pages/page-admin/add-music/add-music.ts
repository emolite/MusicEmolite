import {
    Component,
    inject,
    ChangeDetectorRef,
    signal,
    ElementRef,
    ViewChild,
    OnDestroy,
    NgZone
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SongService } from '../../../core/services/song.service';
import { AlbumService } from '../../../core/services/album.service';
import { ToastService } from '../../../core/services/toast.service';
import { ArtistService } from '../../../core/services/artist.service';

import {
    DropdownComponent,
    DropdownOption
} from '../../../shared/components/dropdown/dropdown';

import {
    SongCreateRequest,
    SongLyricsCreateRequest,
    LyricsLine
} from '../../../core/models/song/req-song.model';

import { SongType } from '../../../core/enums/song-type.enums';

@Component({
    selector: 'app-add-music',
    standalone: true,
    imports: [FormsModule, DropdownComponent],
    templateUrl: './add-music.html',
    styleUrl: './add-music.css'
})
export class AdminAddMusicComponent implements OnDestroy {

    private songService = inject(SongService);
    private albumService = inject(AlbumService);
    private toastService = inject(ToastService);
    private artistService = inject(ArtistService);
    private cdr = inject(ChangeDetectorRef);
    private zone = inject(NgZone);

    @ViewChild('lyricsContainer') lyricsContainer!: ElementRef<HTMLDivElement>;
    @ViewChild('audioEl') audioEl!: ElementRef<HTMLAudioElement>;
    @ViewChild('seekBar') seekBar!: ElementRef<HTMLInputElement>;
    @ViewChild('timeDisplay') timeDisplay!: ElementRef<HTMLSpanElement>;
    @ViewChild('vinylImg') vinylImg!: ElementRef<HTMLDivElement>;

    currentLine = -1;
    currentTime = 0;
    duration = 0;
    isPlaying = false;
    isManualArtist = false;

    private rafId: number | null = null;
    private rotation = 0;
    private lastTimestamp: number | null = null;

    model: SongCreateRequest = {
        title: '',
        releaseDate: '',
        artistName: '',
        albumId: 0,
        fileUrl: {} as File,
        imgUrl: {} as File,
        type: SongType.Public
    };

    albumOptions: DropdownOption[] = [];
    artistOptions: DropdownOption[] = [];

    imagePreview: string | null = null;
    audioName = '';

    isSubmitting = signal(false);
    isSearchingLyrics = signal(false);

    plainLyrics = '';
    syncedLyricsRaw = '';
    syncedLyricsParsed: LyricsLine[] = [];

    selectedArtistName = '';

    lyricsResults: any[] = [];
    selectedLyricsId: number | null = null;

    previewAudioUrl: string | null = null;

    ngOnInit() {
        this.loadAlbums();
    }

    ngOnDestroy() {
        this.stopRaf();
        if (this.previewAudioUrl) URL.revokeObjectURL(this.previewAudioUrl);
    }

    private startRaf() {
        this.stopRaf();
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

    private stopRaf() {
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        this.lastTimestamp = null;
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
        bar.style.setProperty('--pct', `${(time / duration) * 100}%`);
    }

    private updateTimeDOM(time: number) {
        const el = this.timeDisplay?.nativeElement;
        if (!el) return;
        el.textContent = this.formatTime(time);
    }

    private getActiveLine(t: number): number {
        let idx = -1;
        for (let i = 0; i < this.syncedLyricsParsed.length; i++) {
            if (this.syncedLyricsParsed[i].time <= t) idx = i;
            else break;
        }
        return idx;
    }

    private scrollToLine(idx: number) {
        if (idx < 0) return;
        document.getElementById('pl-' + idx)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    onAudioLoaded() {
        this.duration = this.audioEl?.nativeElement?.duration || 0;
        this.startRaf();
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
        if (!seconds || isNaN(seconds)) return '00:00';
        const s = Math.floor(seconds);
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    getLineColor(idx: number): string {
        const diff = Math.abs(idx - this.currentLine);
        if (diff === 0) return '#111827';
        if (diff === 1) return 'rgba(17,24,39,0.5)';
        return 'rgba(17,24,39,0.2)';
    }

    getLineOpacity(idx: number): string {
        const diff = Math.abs(idx - this.currentLine);
        if (diff === 0) return '1';
        if (diff === 1) return '0.7';
        if (diff === 2) return '0.4';
        return '0.2';
    }

    loadAlbums() {
        this.albumService.searchPublicAlbums({
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

    onAlbumSelect(option: DropdownOption | null) {
        this.model.albumId = option?.value ?? 0;
    }

    onTitleBlur() {
        if (!this.model.title?.trim()) {
            this.lyricsResults = [];
            this.isManualArtist = true;
            this.loadArtists('');
            return;
        }

        this.isSearchingLyrics.set(true);

        this.songService.searchLyrics({
            page: 1,
            pageSize: 20,
            searchParams: {
                query: this.model.title,
                album: 'EMOLITE_MUSIC'
            }
        }).subscribe({
            next: (res) => {
                this.lyricsResults = res.data || [];
                if (!this.lyricsResults.length) {
                    this.isManualArtist = true;
                    this.selectedArtistName = '';
                    this.model.artistName = '';
                    this.loadArtists('');
                } else {
                    this.isManualArtist = false;
                }
                this.isSearchingLyrics.set(false);
                this.cdr.markForCheck();
            },

            error: () => {
                this.lyricsResults = [];
                this.isManualArtist = true;
                this.selectedArtistName = '';
                this.model.artistName = '';
                this.loadArtists('');
                this.isSearchingLyrics.set(false);
                this.toastService.error('Không tìm thấy lyrics');
                this.cdr.markForCheck();
            }
        });
    }

    loadArtists(keyword: string) {
        this.artistService.searchArtists({
            page: 1,
            pageSize: 50,
            searchParams: {
                keyword
            }
        }).subscribe({
            next: (res) => {
                this.artistOptions = (res.data || []).map(x => ({
                    label: x.name,
                    value: x.name
                }));
                this.cdr.markForCheck();
            }
        });
    }

    onArtistSelect(option: DropdownOption | null) {
        this.selectedArtistName = option?.label || '';
        this.model.artistName = option?.value || '';
    }

    onArtistSearch(event: Event) {
        const keyword = (event.target as HTMLInputElement)?.value || '';
        this.loadArtists(keyword);
    }

    selectLyrics(item: any) {
        this.selectedLyricsId = item.id;
        this.lyricsResults = [];
        this.songService.getLyricsById(item.id).subscribe({
            next: (res) => {
                const data = res.data;
                if (!data) return;
                this.selectedArtistName = data.artist || '';
                this.model.title = data.title || '';
                this.model.artistName = data.artist || '';
                this.plainLyrics = data.lyrics || '';
                this.syncedLyricsRaw = data.rawSyncedLyrics || '';
                this.syncedLyricsParsed = data.syncedLyrics || [];
                this.isManualArtist = false;
                this.cdr.markForCheck();
            },
            error: () => this.toastService.error('Không tải được lyrics')
        });
    }

    onAudioChange(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) return;
        const file = input.files[0];
        this.model.fileUrl = file;
        this.audioName = file.name;
        if (this.previewAudioUrl) URL.revokeObjectURL(this.previewAudioUrl);
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

    removeAudio() {
        this.audioName = '';
        this.model.fileUrl = {} as File;
        this.stopRaf();
        this.isPlaying = false;
        this.currentLine = -1;
        if (this.previewAudioUrl) {
            URL.revokeObjectURL(this.previewAudioUrl);
            this.previewAudioUrl = null;
        }
    }

    getLyricsForSubmit(): SongLyricsCreateRequest | undefined {
        if (!this.plainLyrics && !this.syncedLyricsParsed.length) return undefined;
        return { lyrics: this.plainLyrics, syncedLyrics: this.syncedLyricsParsed };
    }

    submit() {
        if (this.isSubmitting()) return;
        if (!this.model.title || !this.model.releaseDate || !this.model.albumId || !this.model.fileUrl || !this.model.imgUrl) {
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
            complete: () => this.isSubmitting.set(false)
        });
    }

    resetForm() {
        this.stopRaf();
        this.model = {
            title: '',
            releaseDate: '',
            artistName: '',
            albumId: 0,
            fileUrl: {} as File,
            imgUrl: {} as File,
            type: SongType.Public
        };
        this.audioName = '';
        this.imagePreview = null;
        this.selectedArtistName = '';
        this.plainLyrics = '';
        this.syncedLyricsRaw = '';
        this.syncedLyricsParsed = [];
        this.lyricsResults = [];
        this.selectedLyricsId = null;
        this.currentLine = -1;
        this.currentTime = 0;
        this.duration = 0;
        this.isPlaying = false;
        this.rotation = 0;
        if (this.previewAudioUrl) {
            URL.revokeObjectURL(this.previewAudioUrl);
            this.previewAudioUrl = null;
        }
    }
}