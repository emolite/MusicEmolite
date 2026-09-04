import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppTableComponent } from '../../../shared/components/table/table';
import { TableColumn } from '../../../core/models/front-end/table/table-column.model';
import { FoodEmoliteService } from '../../../core/services/food-emolite.service';
import { PAGINATION } from '../../../core/constants/pagination.constants';

const PAGE_SIZE = 20;

@Component({
    selector: 'app-food-stores',
    standalone: true,
    imports: [CommonModule, FormsModule, AppTableComponent],
    templateUrl: './food-stores.html'
})
export class FoodStoresComponent {

    private foodEmoliteService = inject(FoodEmoliteService);

    loading = signal(false);
    rows = signal<any[]>([]);
    currentPage = signal(PAGINATION.DEFAULT_PAGE);
    totalPages = signal(PAGINATION.DEFAULT_PAGE);

    columns: TableColumn[] = [
        { key: 'stt', label: 'STT', width: '80px', align: 'center' },
        { key: 'thumbnailUrl', label: 'Ảnh', type: 'image', width: '100px', align: 'left' },
        { key: 'storeName', label: 'Tên cửa hàng' },
        { key: 'phoneNumber', label: 'Số điện thoại' },
        { key: 'address', label: 'Địa chỉ' },
        { key: 'isActive', label: 'Trạng thái', type: 'status', align: 'center' }
    ];

    // Create store
    showCreateForm = signal(false);
    creating = signal(false);
    createError = signal<string | null>(null);
    agents = signal<any[]>([]);

    form = {
        storeName: '',
        ownerAccountId: null as number | null,
        phoneNumber: '',
        address: '',
        description: '',
        thumbnailFile: null as File | null
    };

    ngOnInit(): void {
        this.loadStores();
    }

    loadStores() {
        this.loading.set(true);

        this.foodEmoliteService.getAllStores(this.currentPage(), PAGE_SIZE).subscribe({
            next: (res) => {
                const items: any[] = res?.items ?? [];

                const mapped = items.map((item, index) => ({
                    ...item,
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
        this.loadStores();
    }

    openCreateForm() {
        this.form = { storeName: '', ownerAccountId: null, phoneNumber: '', address: '', description: '', thumbnailFile: null };
        this.createError.set(null);
        this.showCreateForm.set(true);

        this.foodEmoliteService.getAgents(1, 100).subscribe({
            next: (res) => this.agents.set(res?.items ?? []),
            error: () => {}
        });
    }

    closeCreateForm() {
        if (this.creating()) return;
        this.showCreateForm.set(false);
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        this.form.thumbnailFile = input.files?.[0] ?? null;
    }

    submitCreate() {
        if (!this.form.storeName.trim() || !this.form.ownerAccountId) {
            this.createError.set('Vui lòng nhập tên cửa hàng và chọn đại lý sở hữu');
            return;
        }

        this.creating.set(true);
        this.createError.set(null);

        const formData = new FormData();
        formData.append('StoreName', this.form.storeName);
        formData.append('OwnerAccountId', String(this.form.ownerAccountId));
        if (this.form.phoneNumber) formData.append('PhoneNumber', this.form.phoneNumber);
        if (this.form.address) formData.append('Address', this.form.address);
        if (this.form.description) formData.append('Description', this.form.description);
        if (this.form.thumbnailFile) formData.append('ThumbnailFile', this.form.thumbnailFile);

        this.foodEmoliteService.createStore(formData).subscribe({
            next: (res) => {
                this.creating.set(false);

                if (res?.isSuccess === false) {
                    this.createError.set(res?.message || 'Tạo cửa hàng thất bại');
                    return;
                }

                this.showCreateForm.set(false);
                this.currentPage.set(1);
                this.loadStores();
            },
            error: (err) => {
                this.creating.set(false);
                this.createError.set(err?.error?.message || 'Tạo cửa hàng thất bại');
            }
        });
    }
}
