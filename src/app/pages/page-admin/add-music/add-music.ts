import {
    Component,
    inject,
    ChangeDetectorRef,
    signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SongService } from '../../../core/services/song.service';
import { AlbumService } from '../../../core/services/album.service';
import { ToastService } from '../../../core/services/toast.service';

import {
    DropdownComponent,
    DropdownOption
} from '../../../shared/components/dropdown/dropdown';

import {
    SongCreateRequest,
    SongLyricsCreateRequest,
    LyricsLine
} from '../../../core/models/song/req-song.model';

import { LyricsPreviewComponent } from '../../page-user/settings/lyrics-preview/lyrics-preview';
import { SongType } from '../../../core/enums/song-type.enums';

@Component({
    selector: 'app-add-music',
    standalone: true,
    imports: [FormsModule, DropdownComponent, LyricsPreviewComponent],
    templateUrl: './add-music.html',
    styleUrl: './add-music.css'
})
export class AdminAddMusicComponent {

    private songService = inject(SongService);
    private albumService = inject(AlbumService);
    private toastService = inject(ToastService);
    private cdr = inject(ChangeDetectorRef);
    activeIndex = signal(-1);
    rotation = 0;

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

    showLyricsPreview = false;

    previewAudioUrl: string | null = null;

    ngOnInit() {
        this.loadAlbums();
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
            return;
        }
        this.isSearchingLyrics.set(true);
        this.songService.searchLyrics({
            page: 1,
            pageSize: 20,
            searchParams: { query: this.model.title, album: 'EMOLITE_MUSIC' }
        }).subscribe({
            next: (res) => {
                this.lyricsResults = res.data || [];
                this.isSearchingLyrics.set(false);
                this.cdr.markForCheck();
            },
            error: () => {
                this.lyricsResults = [];
                this.isSearchingLyrics.set(false);
                this.toastService.error('Không tìm thấy lyrics');
                this.cdr.markForCheck();
            }
        });
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
        if (this.previewAudioUrl) {
            URL.revokeObjectURL(this.previewAudioUrl);
            this.previewAudioUrl = null;
        }
    }

    parseSyncedLyrics(raw: string): LyricsLine[] {
        const lines: LyricsLine[] = [];
        const regex = /\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)/g;
        let match;
        while ((match = regex.exec(raw)) !== null) {
            const text = match[3].trim();
            if (!text) continue;
            const minutes = parseInt(match[1], 10);
            const seconds = parseFloat(match[2]);
            lines.push({ time: minutes * 60 + seconds, text });
        }
        return lines.sort((a, b) => a.time - b.time);
    }

    getLyricsForSubmit(): SongLyricsCreateRequest | undefined {
        if (!this.plainLyrics && !this.syncedLyricsParsed.length) return undefined;
        return { lyrics: this.plainLyrics, syncedLyrics: this.syncedLyricsParsed };
    }

    openLyricsPreview() {
        this.showLyricsPreview = true;
        this.cdr.detectChanges();
    }

    closeLyricsPreview() {
        this.showLyricsPreview = false;
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
        if (this.previewAudioUrl) {
            URL.revokeObjectURL(this.previewAudioUrl);
            this.previewAudioUrl = null;
        }
    }
}