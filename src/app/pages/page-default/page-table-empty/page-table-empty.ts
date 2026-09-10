import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-table-empty',
  standalone: true,
  templateUrl: './page-table-empty.html'
})
export class PageTableEmptyComponent {
  @Input() text = 'Chưa có dữ liệu';
}
