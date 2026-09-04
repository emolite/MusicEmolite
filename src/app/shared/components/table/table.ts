import {
  Component,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { TableColumn } from '../../../core/models/front-end/table/table-column.model';
import { PaginationComponent } from '../pagination/pagination';
import { PageTableLoadingComponent } from '../../../pages/page-default/page-table-loading/page-table-loading';
import { PageTableEmptyComponent } from '../../../pages/page-default/page-table-empty/page-table-empty';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, PaginationComponent, PageTableLoadingComponent, PageTableEmptyComponent],
  templateUrl: './table.html'
})
export class AppTableComponent {

  @Input() columns: TableColumn[] = [];
  @Input() rows: any[] = [];
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() loading = false;
  @Input() sortBy = '';
  @Input() asc = false;
  @Input() emptyText = 'Không có dữ liệu';

  @Output() sortChange = new EventEmitter<string>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() rowDblClick = new EventEmitter<any>();
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

  onRowDblClick(row: any) {
    this.rowDblClick.emit(row);
  }

  onPageChange(page: number) {
    this.pageChange.emit(page);
  }

  onSort(column: TableColumn) {
    if (!column.sortable) {
      return;
    }
    this.sortChange.emit(column.key);
  }
}