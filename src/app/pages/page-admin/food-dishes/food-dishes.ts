import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import { AppTableComponent } from '../../../shared/components/table/table';
import { TableColumn } from '../../../core/models/front-end/table/table-column.model';
import { FoodEmoliteService } from '../../../core/services/food-emolite.service';
import { PAGINATION } from '../../../core/constants/pagination.constants';

const PAGE_SIZE = 20;

@Component({
    selector: 'app-food-dishes',
    standalone: true,
    imports: [CommonModule, AppTableComponent],
    templateUrl: './food-dishes.html'
})
export class FoodDishesComponent {

    private foodEmoliteService = inject(FoodEmoliteService);

    loading = signal(false);
    rows = signal<any[]>([]);
    currentPage = signal(PAGINATION.DEFAULT_PAGE);
    totalPages = signal(PAGINATION.DEFAULT_PAGE);

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
    }

    loadDishes() {
        this.loading.set(true);

        this.foodEmoliteService.getStoreFoods(this.currentPage(), PAGE_SIZE).subscribe({
            next: (res) => {
                const items: any[] = res?.items ?? [];

                const mapped = items.map((item, index) => ({
                    ...item,
                    price: `${(item.price ?? 0).toLocaleString('vi-VN')}₫`,
                    stt: ((this.currentPage() - 1) * PAGE_SIZE) + index + 1
                }));

                this.rows.set(mapped);
                this.totalPages.set(res?.totalPages ?? PAGINATION.DEFAULT_PAGE);
                this.loading.set(false);
            },
            error: (err) => {
                console.log(err);
                this.loading.set(false);
            }
        });
    }

    onPageChange(page: number) {
        this.currentPage.set(page);
        this.loadDishes();
    }
}
