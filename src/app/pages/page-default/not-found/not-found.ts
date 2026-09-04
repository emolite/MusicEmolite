import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './not-found.html'
})
export class NotFoundComponent {

  private location = inject(Location);

  goBack(): void {
    this.location.back();
  }

}
