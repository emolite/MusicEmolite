import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ArtistService } from '../../../../core/services/artist.service';
import { ArtistResponse } from '../../../../core/models/artist/res-artist.model';

@Component({
  selector: 'app-settings-artists',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './artists.html'
})
export class SettingsArtists {

  private artistService = inject(ArtistService);

  artists = signal<ArtistResponse[]>([]);
  keyword = signal('');

  ngOnInit() {
    this.loadArtists();
  }

  loadArtists() {
    this.artistService.searchArtists({
      page: 1,
      pageSize: 100,
      asc: false,
      searchParams: {
        keyword: this.keyword()
      }
    }).subscribe(res => {
      this.artists.set(res.data ?? []);
    });
  }

  onSearch(value: string) {
    this.keyword.set(value);
    this.loadArtists();
  }
}
