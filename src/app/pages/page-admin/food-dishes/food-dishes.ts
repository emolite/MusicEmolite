import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import { AppTableComponent } from '../../../shared/components/table/table';
import { TableColumn } from '../../../core/models/front-end/table/table-column.model';
import { FilterComponent } from '../../../shared/components/filter/filter';
import { FilterField } from '../../../core/models/front-end/filter/filter-field.model';
import { FoodEmoliteService } from '../../../core/services/food-emolite.service';
import { PAGINATION } from '../../../core/constants/pagination.constants';

@Component({
    selector: 'app-food-dishes',
    standalone: true,
    imports: [CommonModule, AppTableComponent, FilterComponent],
    templateUrl: './food-dishes.html'
})
export class FoodDishesComponent {

    private foodEmoliteService = inject(FoodEmoliteService);

    loading = signal(false);
    rows = signal<any[]>([]);
    currentPage = signal(PAGINATION.DEFAULT_PAGE);
    totalPages = signal(PAGINATION.DEFAULT_PAGE);
    totalRecords = signal(0);
    pageSize = signal(20);

    filter = signal<{ keyword: string; storeRefCode: string }>({ keyword: '', storeRefCode: '' });

    filterFields: FilterField[] = [
        {
            key: 'keyword',
            label: 'Từ khóa',
            type: 'text',
            placeholder: 'Nhập tên món...'
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
        { key: 'thumbnailUrl', label: 'Ảnh', type: 'image', width: '100px', align: 'left' },
        { key: 'foodName', label: 'Tên món' },
        { key: 'storeName', label: 'Cửa hàng' },
        { key: 'price', label: 'Giá', align: 'right' },
        { key: 'quantity', label: 'Số lượng', align: 'center' },
        { key: 'isAvailable', label: 'Trạng thái', type: 'status', align: 'center' }
    ];

    ngOnInit(): void {
        this.loadDishes();
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

    loadDishes() {
        this.loading.set(true);

        this.foodEmoliteService.getStoreFoods(this.currentPage(), this.pageSize(), this.filter().storeRefCode, this.filter().keyword).subscribe({
            next: (res) => {
                const items: any[] = res?.items ?? [];

                const mapped = items.map((item, index) => ({
                    ...item,
                    price: `${(item.price ?? 0).toLocaleString('vi-VN')}₫`,
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
        this.loadDishes();
    }

    onPageChange(page: number) {
        this.currentPage.set(page);
        this.loadDishes();
    }

    onPageSizeChange(size: number) {
        this.pageSize.set(size);
        this.currentPage.set(1);
        this.loadDishes();
    }
}
