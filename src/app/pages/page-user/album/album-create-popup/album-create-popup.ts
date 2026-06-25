import {
    Component,
    EventEmitter,
    Output,
    signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CreateAlbumPayload {
    title: string;
    releaseDate: string;
    albumType: number;
    image: File;
}

@Component({
    selector: 'app-create-album-popup',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule
    ],
    templateUrl: './album-create-popup.html'
})
export class CreateAlbumPopupComponent {
    @Output() close = new EventEmitter<void>();
    @Output() submitAlbum = new EventEmitter<CreateAlbumPayload>();

    title = signal('');
    titleError = signal(false);
    releaseDate = signal(
        new Date(
            Date.now() - new Date().getTimezoneOffset() * 60000
        )
            .toISOString()
            .split('T')[0]
    );
    albumType = signal(1);

    imageFile = signal<File | null>(null);
    imagePreview = signal<string | null>(null);

    onFileChange(event: Event) {

        const input = event.target as HTMLInputElement;

        if (!input.files?.length) {
            return;
        }

        const file = input.files[0];

        this.imageFile.set(file);

        const reader = new FileReader();

        reader.onload = () => {
            this.imagePreview.set(
                reader.result as string
            );
        };

        reader.readAsDataURL(file);
    }

    createAlbum() {
        if (!this.title().trim()) {
            this.titleError.set(true)
            return
        }
        this.titleError.set(false)
        this.submitAlbum.emit({
            title: this.title(),
            releaseDate: this.releaseDate(),
            albumType: this.albumType(),
            image: this.imageFile()!
        })
    }

    onClose() {
        this.close.emit();
    }
}
