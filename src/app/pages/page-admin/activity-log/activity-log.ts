import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppTableComponent } from '../../../shared/components/table/table';
import { TableColumn } from '../../../core/models/front-end/table/table-column.model';
import { DatePickerComponent } from '../../../shared/components/date-picker/date-picker';
import { DropdownComponent, DropdownOption } from '../../../shared/components/dropdown/dropdown';
import { ActivityLogService } from '../../../core/services/activity-log.service';
import { FoodEmoliteService } from '../../../core/services/food-emolite.service';
import { PAGINATION } from '../../../core/constants/pagination.constants';

const PAGE_SIZE = 20;

const MUSIC_ACTION_LABELS: Record<string, string> = {
    PLAY: 'Nghe nhạc',
    LIKE: 'Thích bài hát'
};

const FOOD_ACTION_LABELS: Record<string, string> = {
    CREATE_STORE: 'Tạo cửa hàng',
    CREATE_AGENT: 'Tạo đại lý',
    CREATE_ORDER: 'Tạo đơn hàng',
    CONFIRM_PAYMENT: 'Xác nhận thanh toán'
};

const FOOD_ACTOR_LABELS: Record<string, string> = {
    Customer: 'Khách hàng',
    Guest: 'Khách vãng lai',
    Agent: 'Đại lý',
    System: 'Hệ thống'
};

const MUSIC_ACTION_OPTIONS: DropdownOption[] = Object.entries(MUSIC_ACTION_LABELS)
    .map(([value, label]) => ({ label, value }));

const FOOD_ACTION_OPTIONS: DropdownOption[] = Object.entries(FOOD_ACTION_LABELS)
    .map(([value, label]) => ({ label, value }));

@Component({
    selector: 'app-activity-log',
    standalone: true,
    imports: [CommonModule, FormsModule, AppTableComponent, DatePickerComponent, DropdownComponent],
    templateUrl: './activity-log.html'
})
export class ActivityLogComponent {

    private activityLogService = inject(ActivityLogService);
    private foodEmoliteService = inject(FoodEmoliteService);

    activeTab = signal<'music' | 'food'>('music');

    // MusicEmolite
    loadingMusic = signal(false);
    musicLogs = signal<any[]>([]);
    musicCurrentPage = signal(PAGINATION.DEFAULT_PAGE);
    musicTotalPages = signal(PAGINATION.DEFAULT_PAGE);
    musicAsc = signal(false);

    musicKeyword = '';
    musicActionType: string | null = null;
    musicFromDate: string | null = null;
    musicToDate: string | null = null;

    musicActionOptions = MUSIC_ACTION_OPTIONS;

    musicColumns: TableColumn[] = [
        { key: 'stt', label: 'STT', width: '80px', align: 'center' },
        { key: 'userName', label: 'Người dùng' },
        { key: 'actionLabel', label: 'Hành động', align: 'center' },
        { key: 'songTitle', label: 'Bài hát' },
        { key: 'createdAt', label: 'Thời gian', type: 'date', sortable: true }
    ];

    // FoodEmolite
    loadingFood = signal(false);
    foodLogs = signal<any[]>([]);
    foodCurrentPage = signal(PAGINATION.DEFAULT_PAGE);
    foodTotalPages = signal(PAGINATION.DEFAULT_PAGE);
    foodAsc = signal(false);

    foodKeyword = '';
    foodAction: string | null = null;
    foodFromDate: string | null = null;
    foodToDate: string | null = null;

    foodActionOptions = FOOD_ACTION_OPTIONS;

    foodColumns: TableColumn[] = [
        { key: 'stt', label: 'STT', width: '80px', align: 'center' },
        { key: 'actorName', label: 'Người thực hiện' },
        { key: 'actorTypeLabel', label: 'Vai trò', align: 'center' },
        { key: 'actionLabel', label: 'Hành động', align: 'center' },
        { key: 'description', label: 'Nội dung' },
        { key: 'createdAt', label: 'Thời gian', type: 'date', sortable: true }
    ];

    ngOnInit(): void {
        this.loadMusicLogs();
        this.loadFoodLogs();
    }

    setTab(tab: 'music' | 'food') {
        this.activeTab.set(tab);
    }

    loadMusicLogs() {
        this.loadingMusic.set(true);

        this.activityLogService.search({
            page: this.musicCurrentPage(),
            pageSize: PAGE_SIZE,
            asc: this.musicAsc(),
            searchParams: {
                keyword: this.musicKeyword || null,
                actionType: this.musicActionType,
                fromDate: this.musicFromDate,
                toDate: this.musicToDate
            }
        }).subscribe({
            next: (res: any) => {
                const data: any[] = res?.data ?? [];

                const mapped = data.map((item, index) => ({
                    ...item,
                    actionLabel: MUSIC_ACTION_LABELS[item.actionType] || item.actionType,
                    stt: ((this.musicCurrentPage() - 1) * PAGE_SIZE) + index + 1
                }));

                this.musicLogs.set(mapped);
                this.musicTotalPages.set(res?.totalPages ?? PAGINATION.DEFAULT_PAGE);
                this.loadingMusic.set(false);
            },
            error: (err) => {
                console.log(err);
                this.loadingMusic.set(false);
            }
        });
    }

    onMusicKeywordChange() {
        this.musicCurrentPage.set(1);
        this.loadMusicLogs();
    }

    onMusicActionChange(option: DropdownOption | null) {
        this.musicActionType = option?.value ?? null;
        this.musicCurrentPage.set(1);
        this.loadMusicLogs();
    }

    onMusicFromDateChange(value: string | null) {
        this.musicFromDate = value;
        this.musicCurrentPage.set(1);
        this.loadMusicLogs();
    }

    onMusicToDateChange(value: string | null) {
        this.musicToDate = value;
        this.musicCurrentPage.set(1);
        this.loadMusicLogs();
    }

    resetMusicFilter() {
        this.musicKeyword = '';
        this.musicActionType = null;
        this.musicFromDate = null;
        this.musicToDate = null;
        this.musicCurrentPage.set(1);
        this.loadMusicLogs();
    }

    onMusicPageChange(page: number) {
        this.musicCurrentPage.set(page);
        this.loadMusicLogs();
    }

    onSortMusic(_column: string) {
        this.musicAsc.set(!this.musicAsc());
        this.loadMusicLogs();
    }

    loadFoodLogs() {
        this.loadingFood.set(true);

        this.foodEmoliteService.searchActivityLogs({
            page: this.foodCurrentPage(),
            pageSize: PAGE_SIZE,
            asc: this.foodAsc(),
            searchParams: {
                keyword: this.foodKeyword || null,
                action: this.foodAction,
                fromDate: this.foodFromDate,
                toDate: this.foodToDate
            }
        }).subscribe({
            next: (res: any) => {
                const items: any[] = res?.items ?? [];

                const mapped = items.map((item, index) => ({
                    ...item,
                    actionLabel: FOOD_ACTION_LABELS[item.action] || item.action,
                    actorTypeLabel: FOOD_ACTOR_LABELS[item.actorType] || item.actorType,
                    stt: ((this.foodCurrentPage() - 1) * PAGE_SIZE) + index + 1
                }));

                this.foodLogs.set(mapped);
                this.foodTotalPages.set(res?.totalPages ?? PAGINATION.DEFAULT_PAGE);
                this.loadingFood.set(false);
            },
            error: (err) => {
                console.log(err);
                this.loadingFood.set(false);
            }
        });
    }

    onFoodKeywordChange() {
        this.foodCurrentPage.set(1);
        this.loadFoodLogs();
    }

    onFoodActionChange(option: DropdownOption | null) {
        this.foodAction = option?.value ?? null;
        this.foodCurrentPage.set(1);
        this.loadFoodLogs();
    }

    onFoodFromDateChange(value: string | null) {
        this.foodFromDate = value;
        this.foodCurrentPage.set(1);
        this.loadFoodLogs();
    }

    onFoodToDateChange(value: string | null) {
        this.foodToDate = value;
        this.foodCurrentPage.set(1);
        this.loadFoodLogs();
    }

    resetFoodFilter() {
        this.foodKeyword = '';
        this.foodAction = null;
        this.foodFromDate = null;
        this.foodToDate = null;
        this.foodCurrentPage.set(1);
        this.loadFoodLogs();
    }

    onFoodPageChange(page: number) {
        this.foodCurrentPage.set(page);
        this.loadFoodLogs();
    }

    onSortFood(_column: string) {
        this.foodAsc.set(!this.foodAsc());
        this.loadFoodLogs();
    }
}
