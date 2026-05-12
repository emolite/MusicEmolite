import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

@Component({
    selector: 'app-discover',
    imports: [CommonModule],
    templateUrl: './discover.html',
})
export class DiscoverComponent {
selectedGenre: any;
genres: any;
newReleases: any;
moods: any;
chartTracks: any;
featuredArtists: any;
}