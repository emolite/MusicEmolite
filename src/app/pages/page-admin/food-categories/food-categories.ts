import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import { AppTableComponent } from '../../../shared/components/table/table';
import { TableColumn } from '../../../core/models/front-end/table/table-column.model';
import { FilterComponent } from '../../../shared/components/filter/filter';
import { FilterField } from '../../../core/models/front-end/filter/filter-field.model';
import { FoodEmoliteService } from '../../../core/services/food-emolite.service';
import { PAGINATION } from '../../../core/constants/pagination.constants';

@Component({
    selector: 'app-food-categories',
    standalone: true,
    imports: [CommonModule, AppTableComponent, FilterComponent],
    templateUrl: './food-categories.html'
})
export class FoodCategoriesComponent {

    private foodEmoliteService = inject(FoodEmoliteService);

    loading = signal(false);
    rows = signal<any[]>([]);
    currentPage = signal(PAGINATION.DEFAULT_PAGE);
    totalPages = signal(PAGINATION.DEFAULT_PAGE);
    totalRecords = signal(0);
    pageSize = signal(20);

    sortBy = signal('createdAt');
    asc = signal(false);

    filter = signal<{ keyword: string; storeRefCode: string }>({ keyword: '', storeRefCode: '' });

    filterFields: FilterField[] = [
        {
            key: 'keyword',
            label: 'Từ khóa',
            type: 'text',
            placeholder: 'Nhập tên danh mục...'
        },
        {
            key: 'storeRefCode',
            label: 'Cửa hàng',
            type: 'select',
            options: []
        }
    ];

    columns: TableColumn[] = [
        { key: 'stt', label: 'STT', width: '80px', align: 'center' },
        { key: 'categoryName', label: 'Tên danh mục' },
        { key: 'storeName', label: 'Cửa hàng' },
        { key: 'description', label: 'Mô tả' },
        { key: 'createdAt', label: 'Ngày tạo', type: 'date', sortable: true }
    ];

    ngOnInit(): void {
        this.loadCategories();
        this.loadStoreOptions();
    }

    loadStoreOptions() {
        this.foodEmoliteService.getAllStores(1, 100).subscribe({
            next: (res) => {
                const stores: any[] = res?.items ?? [];
                const storeField = this.filterFields.find(f => f.key === 'storeRefCode');
                if (storeField) {
                    storeField.options = stores.map(s => ({ label: s.storeName, value: s.refCode }));
                }
            },
            error: () => {}
        });
    }

    loadCategories() {
        this.loading.set(true);

        this.foodEmoliteService.getAllCategories(
            this.currentPage(),
            this.pageSize(),
            this.filter().keyword,
            this.filter().storeRefCode,
            this.sortBy(),
            this.asc()
        ).subscribe({
            next: (res) => {
                const items: any[] = res?.items ?? [];

                const mapped = items.map((item, index) => ({
                    ...item,
                    stt: ((this.currentPage() - 1) * this.pageSize()) + index + 1
                }));

                this.rows.set(mapped);
                this.totalPages.set(res?.totalPages ?? PAGINATION.DEFAULT_PAGE);
                this.totalRecords.set(res?.totalRecords ?? 0);
                this.loading.set(false);
            },
            error: (err) => {
                console.log(err);
                this.loading.set(false);
            }
        });
    }

    onFilterChange(data: any) {
        this.currentPage.set(1);
        this.filter.set({ keyword: data.keyword ?? '', storeRefCode: data.storeRefCode ?? '' });
        this.loadCategories();
    }

    onPageChange(page: number) {
        this.currentPage.set(page);
        this.loadCategories();
    }

    onPageSizeChange(size: number) {
        this.pageSize.set(size);
        this.currentPage.set(1);
        this.loadCategories();
    }

    onSort(column: string) {
        if (this.sortBy() === column) {
            this.asc.set(!this.asc());
        } else {
            this.sortBy.set(column);
            this.asc.set(false);
        }

        this.loadCategories();
    }
}
