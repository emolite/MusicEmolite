import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppTableComponent } from '../../../shared/components/table/table';
import { TableColumn } from '../../../core/models/front-end/table/table-column.model';
import { DetailPanelComponent } from '../../../shared/components/detail-panel/detail-panel';
import { FoodEmoliteService } from '../../../core/services/food-emolite.service';
import { PAGINATION } from '../../../core/constants/pagination.constants';

const PAGE_SIZE = 20;

@Component({
    selector: 'app-food-agents',
    standalone: true,
    imports: [CommonModule, FormsModule, AppTableComponent, DetailPanelComponent],
    templateUrl: './food-agents.html'
})
export class FoodAgentsComponent {

    private foodEmoliteService = inject(FoodEmoliteService);

    loading = signal(false);
    rows = signal<any[]>([]);
    currentPage = signal(PAGINATION.DEFAULT_PAGE);
    totalPages = signal(PAGINATION.DEFAULT_PAGE);

    selectedAgent = signal<any | null>(null);
    agentStores = signal<any[]>([]);
    loadingAgentStores = signal(false);

    showCreateForm = signal(false);
    creating = signal(false);
    createError = signal<string | null>(null);
    form = { username: '', email: '', password: '' };

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

        this.foodEmoliteService.getAgents(this.currentPage(), PAGE_SIZE).subscribe({
            next: (res) => {
                const items: any[] = res?.items ?? [];

                const mapped = items.map((item, index) => ({
                    stt: ((this.currentPage() - 1) * PAGE_SIZE) + index + 1,
                    id: item.account?.id,
                    refCode: item.account?.refCode,
                    username: item.account?.username,
                    email: item.account?.email,
                    isActived: item.account?.isActive,
                    fullName: item.profile?.fullName,
                    phone: item.profile?.phoneNumber,
                    store: item.store,
                    raw: item
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
        this.form = { username: '', email: '', password: '' };
        this.createError.set(null);
        this.showCreateForm.set(true);
    }

    closeCreateForm() {
        if (this.creating()) return;
        this.showCreateForm.set(false);
    }

    submitCreate() {
        if (!this.form.username.trim() || !this.form.email.trim() || !this.form.password.trim()) {
            this.createError.set('Vui lòng nhập đầy đủ tên đăng nhập, email và mật khẩu');
            return;
        }

        this.creating.set(true);
        this.createError.set(null);

        this.foodEmoliteService.createAgent(this.form).subscribe({
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
