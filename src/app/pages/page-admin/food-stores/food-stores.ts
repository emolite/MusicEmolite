import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppTableComponent } from '../../../shared/components/table/table';
import { TableColumn } from '../../../core/models/front-end/table/table-column.model';
import { FilterComponent } from '../../../shared/components/filter/filter';
import { FilterField } from '../../../core/models/front-end/filter/filter-field.model';
import { DropdownComponent, DropdownOption } from '../../../shared/components/dropdown/dropdown';
import { FoodEmoliteService } from '../../../core/services/food-emolite.service';
import { PAGINATION } from '../../../core/constants/pagination.constants';

@Component({
    selector: 'app-food-stores',
    standalone: true,
    imports: [CommonModule, FormsModule, AppTableComponent, FilterComponent, DropdownComponent],
    templateUrl: './food-stores.html'
})
export class FoodStoresComponent {

    private foodEmoliteService = inject(FoodEmoliteService);

    loading = signal(false);
    rows = signal<any[]>([]);
    currentPage = signal(PAGINATION.DEFAULT_PAGE);
    totalPages = signal(PAGINATION.DEFAULT_PAGE);
    totalRecords = signal(0);
    pageSize = signal(20);

    filter = signal<{ keyword: string; isActive: string }>({ keyword: '', isActive: '' });

    filterFields: FilterField[] = [
        { key: 'keyword', label: 'Tìm kiếm', type: 'text', placeholder: 'Tên cửa hàng...' },
        {
            key: 'isActive',
            label: 'Trạng thái',
            type: 'select',
            options: [
                { label: 'Hoạt động', value: 'true' },
                { label: 'Ngừng hoạt động', value: 'false' }
            ]
        }
    ];

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
    agentOptions = signal<DropdownOption[]>([]);
    thumbnailPreviewUrl = signal<string | null>(null);

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

        const isActive = this.filter().isActive === '' ? null : this.filter().isActive === 'true';

        this.foodEmoliteService.getAllStores(this.currentPage(), this.pageSize(), this.filter().keyword, isActive).subscribe({
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

    onPageChange(page: number) {
        this.currentPage.set(page);
        this.loadStores();
    }

    onPageSizeChange(size: number) {
        this.pageSize.set(size);
        this.currentPage.set(1);
        this.loadStores();
    }

    onFilterChange(data: any) {
        this.currentPage.set(1);
        this.filter.set({ keyword: data.keyword ?? '', isActive: data.isActive ?? '' });
        this.loadStores();
    }

    openCreateForm() {
        this.form = { storeName: '', ownerAccountId: null, phoneNumber: '', address: '', description: '', thumbnailFile: null };
        this.thumbnailPreviewUrl.set(null);
        this.createError.set(null);
        this.showCreateForm.set(true);

        this.foodEmoliteService.getAgents(1, 100).subscribe({
            next: (res) => {
                const items: any[] = res?.items ?? [];
                this.agents.set(items);
                this.agentOptions.set(items.map(agent => ({
                    label: agent.profile?.fullName || agent.account?.username,
                    value: agent.account?.id
                })));
            },
            error: () => {}
        });
    }

    onOwnerChange(option: DropdownOption | null) {
        this.form.ownerAccountId = option?.value ?? null;
    }

    closeCreateForm() {
        if (this.creating()) return;
        this.showCreateForm.set(false);
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0] ?? null;
        this.form.thumbnailFile = file;

        if (file) {
            const reader = new FileReader();
            reader.onload = () => this.thumbnailPreviewUrl.set(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            this.thumbnailPreviewUrl.set(null);
        }
    }

    removeThumbnail() {
        this.form.thumbnailFile = null;
        this.thumbnailPreviewUrl.set(null);
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
