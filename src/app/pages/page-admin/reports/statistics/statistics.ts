import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexPlotOptions, ApexXAxis, NgApexchartsModule } from 'ng-apexcharts';

import { FoodEmoliteService } from '../../../../core/services/food-emolite.service';
import { SongService } from '../../../../core/services/song.service';
import { AppTableComponent } from '../../../../shared/components/table/table';
import { TableColumn } from '../../../../core/models/front-end/table/table-column.model';
import { FilterComponent } from '../../../../shared/components/filter/filter';
import { FilterField } from '../../../../core/models/front-end/filter/filter-field.model';
import { PAGINATION } from '../../../../core/constants/pagination.constants';

type BarChart = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    plotOptions: ApexPlotOptions;
    dataLabels: ApexDataLabels;
    xaxis: ApexXAxis;
    colors: string[];
};

const barChartBase = (color: string): BarChart => ({
    series: [],
    chart: { type: 'bar', height: 400, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
    dataLabels: { enabled: false },
    xaxis: { categories: [] },
    colors: [color]
});

@Component({
    selector: 'app-statistics',
    standalone: true,
    imports: [CommonModule, NgApexchartsModule, AppTableComponent, FilterComponent],
    templateUrl: './statistics.html'
})
export class StatisticsComponent {

    private foodEmoliteService = inject(FoodEmoliteService);
    private songService = inject(SongService);

    loadingFood = signal(false);
    loadingSongs = signal(false);

    foodChart: BarChart = barChartBase('#10b981');
    songChart: BarChart = barChartBase('#3b82f6');

    /** Which table is shown under "Doanh thu theo" - product-level or order-level breakdown. */
    revenueTab = signal<'product' | 'order'>('product');

    loadingProducts = signal(false);
    products = signal<any[]>([]);
    sortBy = signal('quantitysold');
    asc = signal(false);

    productColumns: TableColumn[] = [
        { key: 'foodName', label: 'Tên sản phẩm' },
        { key: 'storeName', label: 'Cửa hàng' },
        { key: 'quantitySold', label: 'Số lượng bán', align: 'center', sortable: true },
        { key: 'revenue', label: 'Doanh thu', align: 'right', sortable: true }
    ];

    loadingOrders = signal(false);
    orders = signal<any[]>([]);
    ordersCurrentPage = signal(PAGINATION.DEFAULT_PAGE);
    ordersTotalPages = signal(PAGINATION.DEFAULT_PAGE);
    ordersTotalRecords = signal(0);
    ordersPageSize = signal(20);
    ordersSortBy = signal('createdAt');
    ordersAsc = signal(false);

    orderFilter = signal<{ keyword: string }>({ keyword: '' });

    orderFilterFields: FilterField[] = [
        {
            key: 'keyword',
            label: 'Tìm kiếm',
            type: 'text',
            placeholder: 'Mã đơn hoặc tên khách hàng...'
        }
    ];

    orderColumns: TableColumn[] = [
        { key: 'stt', label: 'STT', width: '80px', align: 'center' },
        { key: 'orderCode', label: 'Mã đơn' },
        { key: 'customerName', label: 'Khách hàng' },
        { key: 'itemCount', label: 'Số món', align: 'center' },
        { key: 'totalAmount', label: 'Doanh thu', align: 'right', sortable: true },
        { key: 'createdAt', label: 'Ngày tạo', type: 'date', sortable: true }
    ];

    ngOnInit(): void {
        this.loadTopFoodProducts();
        this.loadTopSongs();
        this.loadProductRevenue();
        this.loadOrders();
    }

    setRevenueTab(tab: 'product' | 'order') {
        this.revenueTab.set(tab);
    }

    loadTopFoodProducts() {
        this.loadingFood.set(true);

        this.foodEmoliteService.getTopProducts(10).subscribe({
            next: (res) => {
                const items: any[] = res?.data ?? [];

                this.foodChart = {
                    ...this.foodChart,
                    series: [{ name: 'Số lượng bán', data: items.map(x => x.quantitySold) }],
                    xaxis: { categories: items.map(x => x.foodName) }
                };

                this.loadingFood.set(false);
            },
            error: (err) => {
                console.log(err);
                this.loadingFood.set(false);
            }
        });
    }

    loadTopSongs() {
        this.loadingSongs.set(true);

        this.songService.searchSongsAdmin({
            page: 1,
            pageSize: 10,
            asc: false,
            searchParams: { sortBy: 'views' }
        }).subscribe({
            next: (res) => {
                const items = res?.data ?? [];

                this.songChart = {
                    ...this.songChart,
                    series: [{ name: 'Lượt xem', data: items.map(x => x.views) }],
                    xaxis: { categories: items.map(x => x.title) }
                };

                this.loadingSongs.set(false);
            },
            error: (err) => {
                console.log(err);
                this.loadingSongs.set(false);
            }
        });
    }

    loadProductRevenue() {
        this.loadingProducts.set(true);

        this.foodEmoliteService.searchProductRevenue({
            page: 1,
            pageSize: 10,
            asc: this.asc(),
            sortBy: this.sortBy(),
            searchParams: {}
        }).subscribe({
            next: (res) => {
                const items: any[] = res?.items ?? [];

                const mapped = items.map(item => ({
                    ...item,
                    revenue: `${(item.revenue ?? 0).toLocaleString('vi-VN')}₫`
                }));

                this.products.set(mapped);
                this.loadingProducts.set(false);
            },
            error: (err) => {
                console.log(err);
                this.loadingProducts.set(false);
            }
        });
    }

    onSortProducts(column: string) {
        if (this.sortBy() === column) {
            this.asc.set(!this.asc());
        } else {
            this.sortBy.set(column);
            this.asc.set(false);
        }

        this.loadProductRevenue();
    }

    loadOrders() {
        this.loadingOrders.set(true);

        this.foodEmoliteService.searchOrders({
            page: this.ordersCurrentPage(),
            pageSize: this.ordersPageSize(),
            asc: this.ordersAsc(),
            sortBy: this.ordersSortBy(),
            searchParams: {
                keyword: this.orderFilter().keyword || null
            }
        }).subscribe({
            next: (res) => {
                const items: any[] = res?.items ?? [];

                const mapped = items.map((item, index) => ({
                    ...item,
                    itemCount: item.items?.length ?? 0,
                    totalAmount: `${(item.totalAmount ?? 0).toLocaleString('vi-VN')}₫`,
                    stt: ((this.ordersCurrentPage() - 1) * this.ordersPageSize()) + index + 1
                }));

                this.orders.set(mapped);
                this.ordersTotalPages.set(res?.totalPages ?? PAGINATION.DEFAULT_PAGE);
                this.ordersTotalRecords.set(res?.totalRecords ?? 0);
                this.loadingOrders.set(false);
            },
            error: (err) => {
                console.log(err);
                this.loadingOrders.set(false);
            }
        });
    }

    onOrderFilterChange(data: any) {
        this.ordersCurrentPage.set(1);
        this.orderFilter.set({ keyword: data.keyword ?? '' });
        this.loadOrders();
    }

    onOrdersPageChange(page: number) {
        this.ordersCurrentPage.set(page);
        this.loadOrders();
    }

    onOrdersPageSizeChange(size: number) {
        this.ordersPageSize.set(size);
        this.ordersCurrentPage.set(1);
        this.loadOrders();
    }

    onSortOrders(column: string) {
        if (this.ordersSortBy() === column) {
            this.ordersAsc.set(!this.ordersAsc());
        } else {
            this.ordersSortBy.set(column);
            this.ordersAsc.set(false);
        }

        this.loadOrders();
    }
}
