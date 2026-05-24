import {
  Component,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { TableColumn } from '../../../core/models/front-end/table/table-column.model';
import { PaginationComponent } from '../pagination/pagination';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './table.html'
})
export class AppTableComponent {

  @Input() columns: TableColumn[] = [];
  @Input() rows: any[] = [];
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() loading = false;
  @Input() emptyText = 'Không có dữ liệu';
  @Output() rowClick = new EventEmitter<any>();
  @Output() pageChange = new EventEmitter<number>();

  trackByColumn(_: number, item: TableColumn) {
    return item.key;
  }

  getValue(row: any, key: string) {
    return row?.[key];
  }

  onRowClick(row: any) {
    this.rowClick.emit(row);
  }

  onPageChange(page: number) {
    this.pageChange.emit(page);
  }
}