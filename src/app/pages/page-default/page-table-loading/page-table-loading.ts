import { Component } from '@angular/core';

@Component({
  selector: 'app-page-table-loading',
  standalone: true,
  templateUrl: './page-table-loading.html'
})
export class PageTableLoadingComponent {
  skeletonRows = [
    { title: 62, subtitle: 38 },
    { title: 48, subtitle: 30 },
    { title: 70, subtitle: 42 },
    { title: 40, subtitle: 26 },
    { title: 56, subtitle: 34 },
  ];
}
