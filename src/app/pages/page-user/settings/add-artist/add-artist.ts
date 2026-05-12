import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ArtistService } from '../../../../core/services/artist.service';
import { ArtistCreateRequest } from '../../../../core/models/artist/req-artist.model';

@Component({
  selector: 'app-add-artist',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './add-artist.html'
})
export class AddArtistComponent {

  private artistService = inject(ArtistService);
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  model: ArtistCreateRequest = {
    name: '',
    stageName: '',
    country: ''
  };

  close() {
    this.closed.emit();
  }

  submit() {

    if (
      !this.model.name ||
      !this.model.stageName
    ) {
      return;
    }

    this.artistService
      .createArtist(this.model)
      .subscribe(() => {

        this.model = {
          name: '',
          stageName: '',
          country: ''
        };

        this.created.emit();

      });

  }
}