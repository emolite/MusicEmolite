import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppTableComponent } from '../../../shared/components/table/table';
import { TableColumn } from '../../../core/models/front-end/table/table-column.model';
import { DetailPanelComponent } from '../../../shared/components/detail-panel/detail-panel';
import { FilterComponent } from '../../../shared/components/filter/filter';
import { FilterField } from '../../../core/models/front-end/filter/filter-field.model';
import { FoodEmoliteService } from '../../../core/services/food-emolite.service';
import { PAGINATION } from '../../../core/constants/pagination.constants';

@Component({
    selector: 'app-food-agents',
    standalone: true,
    imports: [CommonModule, FormsModule, AppTableComponent, DetailPanelComponent, FilterComponent],
    templateUrl: './food-agents.html'
})
export class FoodAgentsComponent {

    private foodEmoliteService = inject(FoodEmoliteService);

    loading = signal(false);
    rows = signal<any[]>([]);
    currentPage = signal(PAGINATION.DEFAULT_PAGE);
    totalPages = signal(PAGINATION.DEFAULT_PAGE);
    totalRecords = signal(0);
    pageSize = signal(20);

    filter = signal<{ keyword: string; isActive: string }>({ keyword: '', isActive: '' });

    filterFields: FilterField[] = [
        { key: 'keyword', label: 'Tìm kiếm', type: 'text', placeholder: 'Tên đăng nhập hoặc email...' },
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

    selectedAgent = signal<any | null>(null);
    agentStores = signal<any[]>([]);
    loadingAgentStores = signal(false);

    showCreateForm = signal(false);
    creating = signal(false);
    createError = signal<string | null>(null);
    showPassword = signal(false);
    showConfirmPassword = signal(false);
    form = { username: '', email: '', password: '', confirmPassword: '' };

    columns: TableColumn[] = [
        { key: 'stt', label: 'STT', width: '80px', align: 'center' },
        { key: 'username', label: 'Tên đăng nhập' },
        { key: 'fullName', label: 'Họ tên' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Số điện thoại' },
        { key: 'isActived', label: 'Trạng thái', type: 'status', align: 'center' }
    ];

    ngOnInit(): void {
        this.loadAgents();
    }

    loadAgents() {
        this.loading.set(true);

        const isActive = this.filter().isActive === '' ? null : this.filter().isActive === 'true';

        this.foodEmoliteService.getAgents(this.currentPage(), this.pageSize(), this.filter().keyword, isActive).subscribe({
            next: (res) => {
                const items: any[] = res?.items ?? [];

                const mapped = items.map((item, index) => ({
                    stt: ((this.currentPage() - 1) * this.pageSize()) + index + 1,
                    id: item.account?.id,
                    refCode: item.account?.refCode,
                    username: item.account?.username,
                    email: item.account?.email,
                    isActived: item.account?.isActive,
                    fullName: item.profile?.fullName,
                    phone: item.profile?.phoneNumber,
                    gender: item.profile?.gender,
                    dateOfBirth: item.profile?.dateOfBirth,
                    address: item.profile?.address,
                    avatarUrl: item.profile?.avatarUrl,
                    bankAccounts: item.bankAccounts ?? [],
                    store: item.store,
                    raw: item
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
        this.loadAgents();
    }

    onPageSizeChange(size: number) {
        this.pageSize.set(size);
        this.currentPage.set(1);
        this.loadAgents();
    }

    onFilterChange(data: any) {
        this.currentPage.set(1);
        this.filter.set({ keyword: data.keyword ?? '', isActive: data.isActive ?? '' });
        this.loadAgents();
    }

    onRowDblClick(row: any) {
        this.selectedAgent.set(row);
        this.loadAgentStores(row.refCode);
    }

    closeDetail() {
        this.selectedAgent.set(null);
        this.agentStores.set([]);
    }

    openCreateForm() {
        this.form = { username: '', email: '', password: '', confirmPassword: '' };
        this.showPassword.set(false);
        this.showConfirmPassword.set(false);
        this.createError.set(null);
        this.showCreateForm.set(true);
    }

    closeCreateForm() {
        if (this.creating()) return;
        this.showCreateForm.set(false);
    }

    togglePasswordVisibility() {
        this.showPassword.set(!this.showPassword());
    }

    toggleConfirmPasswordVisibility() {
        this.showConfirmPassword.set(!this.showConfirmPassword());
    }

    submitCreate() {
        if (!this.form.username.trim() || !this.form.email.trim() || !this.form.password.trim()) {
            this.createError.set('Vui lòng nhập đầy đủ tên đăng nhập, email và mật khẩu');
            return;
        }

        if (this.form.password !== this.form.confirmPassword) {
            this.createError.set('Mật khẩu xác nhận không khớp');
            return;
        }

        this.creating.set(true);
        this.createError.set(null);

        this.foodEmoliteService.createAgent({
            username: this.form.username,
            email: this.form.email,
            password: this.form.password
        }).subscribe({
            next: (res) => {
                this.creating.set(false);

                if (res?.isSuccess === false) {
                    this.createError.set(res?.message || 'Tạo đại lý thất bại');
                    return;
                }

                this.showCreateForm.set(false);
                this.currentPage.set(1);
                this.loadAgents();
            },
            error: (err) => {
                this.creating.set(false);
                this.createError.set(err?.error?.message || 'Tạo đại lý thất bại');
            }
        });
    }

    private loadAgentStores(ownerRefCode: string) {
        if (!ownerRefCode) return;

        this.loadingAgentStores.set(true);

        this.foodEmoliteService.getStoresByOwner(ownerRefCode, 1, 50).subscribe({
            next: (res) => {
                this.agentStores.set(res?.items ?? []);
                this.loadingAgentStores.set(false);
            },
            error: () => {
                this.loadingAgentStores.set(false);
            }
        });
    }
}
