import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SongService } from '../../../../core/services/song.service';
import { ArtistService } from '../../../../core/services/artist.service';
import { AlbumService } from '../../../../core/services/album.service';
import { ToastService } from '../../../../core/services/toast.service';
import {
  DropdownComponent,
  DropdownOption
} from '../../../../shared/components/dropdown/dropdown';

import { SongCreateRequest } from '../../../../core/models/song/req-song.model';
import { AddArtistComponent } from '../add-artist/add-artist';

@Component({
  selector: 'app-add-music',
  standalone: true,
  imports: [
    DropdownComponent,
    FormsModule,
    AddArtistComponent
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
    imgUrl: {} as File
  };

  artistOptions: DropdownOption[] = [];
  albumOptions: DropdownOption[] = [];

  showArtistModal = false;

  imagePreview: string | null = null;

  audioName = '';

  isSubmitting = false;

  ngOnInit() {
    this.loadArtists();
    this.loadAlbums();
  }

  loadArtists() {

    this.artistService.searchArtists({
      page: 1,
      pageSize: 50,
      searchParams: {
        keyword: ''
      }
    }).subscribe(res => {

      this.artistOptions =
        res.data?.map(x => ({
          label: x.stageName || x.name,
          value: x.id
        })) || [];

    });

  }

  loadAlbums() {
    this.albumService.searchAlbums({
      page: 1,
      pageSize: 50,
      searchParams: {
        keyword: ''
      }
    }).subscribe(res => {

      this.albumOptions =
        res.data?.map(x => ({
          label: x.title,
          value: x.id
        })) || [];

    });

  }

  onArtistSelect(option: DropdownOption | null) {
    this.model.artistId = option?.value ?? 0;
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

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];

    this.model.fileUrl = file;
    this.audioName = file.name;

  }

  onImageChange(event: Event) {

    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }
    const file = input.files[0];
    this.model.imgUrl = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview =
        reader.result as string;
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

          if (!ctx) {
            resolve(file);
            return;
          }

          ctx.drawImage(
            img,
            0,
            0,
            canvas.width,
            canvas.height
          );

          canvas.toBlob(
            (blob) => {

              if (!blob) {
                resolve(file);
                return;
              }

              resolve(
                new File(
                  [blob],
                  file.name,
                  {
                    type: 'image/jpeg'
                  }
                )
              );

            },
            'image/jpeg',
            0.8
          );
        };
      };
    });
  }
  removeAudio() {
    this.audioName = '';
    this.model.fileUrl = {} as File;
  }

  submit() {

    if (this.isSubmitting) {
      return;
    }

    if (
      !this.model.title ||
      !this.model.releaseDate ||
      !this.model.artistId ||
      !this.model.albumId ||
      !this.model.fileUrl ||
      !this.model.imgUrl
    ) {

      this.toastService.error(
        'Vui lòng nhập đầy đủ thông tin'
      );

      return;
    }

    this.isSubmitting = true;

    this.songService
      .createSong(this.model)
      .subscribe({
        next: () => {

          this.toastService.success(
            'Tạo bài hát thành công'
          );

          this.resetForm();

        },
        error: () => {

          this.toastService.error(
            'Tạo bài hát thất bại'
          );

          this.isSubmitting = false;

        },
        complete: () => {
          this.isSubmitting = false;
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
      imgUrl: {} as File
    };
    this.audioName = '';
    this.imagePreview = null;
  }
}