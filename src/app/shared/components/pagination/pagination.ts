import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

type PageItem = number | '...';
type PaginationVariant = 'user' | 'admin';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.html',
})
export class PaginationComponent {
  currentPage = input.required<number>();
  totalPages = input.required<number>();
  variant = input<PaginationVariant>('user');

  pageChange = output<number>();

  pages = computed<PageItem[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: PageItem[] = [1];

    if (current > 3) pages.push('...');

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push('...');

    pages.push(total);

    return pages;
  });

  go(page: PageItem) {
    if (page === '...') return;
    if (page === this.currentPage()) return;
    this.pageChange.emit(page);
  }

  prev() {
    const c = this.currentPage();
    if (c > 1) this.pageChange.emit(c - 1);
  }

  next() {
    const c = this.currentPage();
    const t = this.totalPages();
    if (c < t) this.pageChange.emit(c + 1);
  }
}