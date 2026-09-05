import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import { AppTableComponent } from '../../../shared/components/table/table';
import { TableColumn } from '../../../core/models/front-end/table/table-column.model';
import { FilterComponent } from '../../../shared/components/filter/filter';
import { FilterField } from '../../../core/models/front-end/filter/filter-field.model';
import { FoodEmoliteService } from '../../../core/services/food-emolite.service';
import { PAGINATION } from '../../../core/constants/pagination.constants';

const PAGE_SIZE = 20;

@Component({
    selector: 'app-food-customers',
    standalone: true,
    imports: [CommonModule, AppTableComponent, FilterComponent],
    templateUrl: './food-customers.html'
})
export class FoodCustomersComponent {

    private foodEmoliteService = inject(FoodEmoliteService);

    loading = signal(false);
    rows = signal<any[]>([]);
    currentPage = signal(PAGINATION.DEFAULT_PAGE);
    totalPages = signal(PAGINATION.DEFAULT_PAGE);

    sortBy = signal('totalspent');
    asc = signal(false);

    filter = signal<{ keyword: string; storeRefCode: string }>({ keyword: '', storeRefCode: '' });

    filterFields: FilterField[] = [
        {
            key: 'keyword',
            label: 'Từ khóa',
            type: 'text',
            placeholder: 'Tên, SĐT hoặc email...'
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
        { key: 'customerName', label: 'Tên khách hàng' },
        {
            key: 'isGuest',
            label: 'Loại',
            type: 'badge',
            align: 'center',
            badgeConfig: {
                trueLabel: 'Khách vãng lai',
                falseLabel: 'Thành viên',
                trueClass: 'bg-gray-100 text-gray-600',
                falseClass: 'bg-green-100 text-green-700'
            }
        },
        { key: 'phoneNumber', label: 'Số điện thoại' },
        { key: 'email', label: 'Email' },
        { key: 'storeName', label: 'Cửa hàng' },
        { key: 'totalOrders', label: 'Tổng đơn', align: 'center', sortable: true },
        { key: 'totalSpent', label: 'Tổng chi tiêu', align: 'right', sortable: true },
        { key: 'lastOrderAt', label: 'Đơn gần nhất', type: 'date' }
    ];

    ngOnInit(): void {
        this.loadCustomers();
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

    loadCustomers() {
        this.loading.set(true);

        this.foodEmoliteService.searchCustomers({
            page: this.currentPage(),
            pageSize: PAGE_SIZE,
            asc: this.asc(),
            sortBy: this.sortBy(),
            searchParams: {
                keyword: this.filter().keyword || null,
                storeRefCode: this.filter().storeRefCode || null
            }
        }).subscribe({
            next: (res) => {
                const items: any[] = res?.items ?? [];

                const mapped = items.map((item, index) => ({
                    ...item,
                    totalSpent: `${(item.totalSpent ?? 0).toLocaleString('vi-VN')}₫`,
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

    onFilterChange(data: any) {
        this.currentPage.set(1);
        this.filter.set({ keyword: data.keyword ?? '', storeRefCode: data.storeRefCode ?? '' });
        this.loadCustomers();
    }

    onPageChange(page: number) {
        this.currentPage.set(page);
        this.loadCustomers();
    }

    onSort(column: string) {
        if (this.sortBy() === column) {
            this.asc.set(!this.asc());
        } else {
            this.sortBy.set(column);
            this.asc.set(false);
        }

        this.loadCustomers();
    }
}
