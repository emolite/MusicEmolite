import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  NgZone,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { TableColumn } from '../../../core/models/front-end/table/table-column.model';
import { PaginationComponent } from '../pagination/pagination';
import { PageTableLoadingComponent } from '../../../pages/page-default/page-table-loading/page-table-loading';
import { PageTableEmptyComponent } from '../../../pages/page-default/page-table-empty/page-table-empty';
import { TooltipDirective } from '../../directives/tooltip.directive';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, PaginationComponent, PageTableLoadingComponent, PageTableEmptyComponent, TooltipDirective],
  templateUrl: './table.html'
})
export class AppTableComponent implements AfterViewInit, OnChanges, OnDestroy {

  @ViewChild('scrollBody') scrollBody?: ElementRef<HTMLDivElement>;

  /**
   * Explicit per-column pixel widths shared by the header table and the body table (via <colgroup>).
   * Computed once from the body wrapper's clientWidth (which already excludes its scrollbar), so both
   * tables always render at the exact same column widths - no dependency on which container is a few
   * pixels narrower because of the scrollbar. Same technique used in Seller/FE's order-history table.
   */
  colWidths = signal<number[]>([]);
  private resizeObserver?: ResizeObserver;

  constructor(private zone: NgZone) { }

  ngAfterViewInit(): void {
    if (!this.scrollBody) {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.zone.run(() => this.measure());
    });

    this.resizeObserver.observe(this.scrollBody.nativeElement);
    this.measure();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns'] || changes['rows'] || changes['loading']) {
      setTimeout(() => this.measure());
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  private measure(): void {
    if (!this.scrollBody || this.columns.length === 0) {
      return;
    }

    const containerWidth = this.scrollBody.nativeElement.clientWidth;
    if (!containerWidth) {
      return;
    }

    const explicitWidths = this.columns.map(c => c.width ? parseInt(c.width, 10) || 0 : null);
    const explicitSum = explicitWidths.reduce((sum: number, w) => sum + (w ?? 0), 0);
    const autoCount = explicitWidths.filter(w => w === null).length;
    const remaining = Math.max(containerWidth - explicitSum, 0);
    const autoWidth = autoCount > 0 ? Math.floor(remaining / autoCount) : 0;

    let autoIndexSeen = 0;
    const widths = explicitWidths.map(w => {
      if (w !== null) {
        return w;
      }
      autoIndexSeen++;
      // Give the last auto column the leftover pixels so columns fully fill the container.
      return autoIndexSeen === autoCount ? remaining - autoWidth * (autoCount - 1) : autoWidth;
    });

    this.colWidths.set(widths);
  }

  @Input() columns: TableColumn[] = [];
  @Input() rows: any[] = [];
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() loading = false;
  @Input() sortBy = '';
  @Input() asc = false;
  @Input() emptyText = 'Chưa có dữ liệu';

  /** Optional - when totalRecords > 0, the pagination bar shows "Hiển thị X-Y / Z bản ghi" + a page-size picker. */
  @Input() totalRecords = 0;
  @Input() pageSize = 0;
  @Input() pageSizeOptions: number[] = [20, 50, 100];

  @Output() sortChange = new EventEmitter<string>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() rowDblClick = new EventEmitter<any>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

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

  onPageSizeChange(size: number) {
    this.pageSizeChange.emit(size);
  }

  onSort(column: TableColumn) {
    if (!column.sortable) {
      return;
    }
    this.sortChange.emit(column.key);
  }
}
