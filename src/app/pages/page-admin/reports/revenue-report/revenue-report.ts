import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexStroke, ApexXAxis, ApexYAxis, ApexLegend, NgApexchartsModule } from 'ng-apexcharts';

import { FoodEmoliteService } from '../../../../core/services/food-emolite.service';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker';
import { DropdownComponent, DropdownOption } from '../../../../shared/components/dropdown/dropdown';
import { PageTableEmptyComponent } from '../../../page-default/page-table-empty/page-table-empty';

const STATUS_LABELS: Record<string, string> = {
    PENDING: 'Chờ xử lý',
    CONFIRMED: 'Đã xác nhận',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã huỷ'
};

const STATUS_COLORS: Record<string, string> = {
    PENDING: '#f59e0b',
    CONFIRMED: '#3b82f6',
    COMPLETED: '#10b981',
    CANCELLED: '#ef4444'
};

@Component({
    selector: 'app-revenue-report',
    standalone: true,
    imports: [CommonModule, NgApexchartsModule, DatePickerComponent, DropdownComponent, PageTableEmptyComponent],
    templateUrl: './revenue-report.html'
})
export class RevenueReportComponent {

    private foodEmoliteService = inject(FoodEmoliteService);

    /** Song revenue doesn't exist yet - the tab is here so it's not forgotten, just always shows the "chưa có" state. */
    activeTab = signal<'song' | 'food'>('food');

    loading = signal(false);
    revenue = signal<{ totalOrders: number; totalRevenue: number } | null>(null);

    fromDate: string | null = null;
    toDate: string | null = null;
    groupBy: 'day' | 'month' = 'day';

    groupByOptions: DropdownOption[] = [
        { label: 'Theo ngày', value: 'day' },
        { label: 'Theo tháng', value: 'month' }
    ];

    lineChart: {
        series: ApexAxisChartSeries;
        chart: ApexChart;
        xaxis: ApexXAxis;
        yaxis: ApexYAxis;
        stroke: ApexStroke;
        dataLabels: ApexDataLabels;
    } = {
        series: [],
        chart: { type: 'line', height: 320, toolbar: { show: false } },
        xaxis: { categories: [] },
        yaxis: { labels: { formatter: (val) => `${Math.round(val)}` } },
        stroke: { curve: 'smooth', width: 3 },
        dataLabels: { enabled: false }
    };

    pieChart: {
        series: number[];
        chart: ApexChart;
        labels: string[];
        colors: string[];
        legend: ApexLegend;
    } = {
        series: [],
        chart: { type: 'donut', height: 320 },
        labels: [],
        colors: [],
        legend: { position: 'bottom' }
    };

    ngOnInit(): void {
        this.loadRevenue();
    }

    setTab(tab: 'song' | 'food') {
        this.activeTab.set(tab);
    }

    applyFilter() {
        this.loadRevenue();
    }

    onGroupByChange(option: DropdownOption | null) {
        this.groupBy = (option?.value ?? 'day') as 'day' | 'month';
    }

    resetFilter() {
        this.fromDate = null;
        this.toDate = null;
        this.groupBy = 'day';
        this.loadRevenue();
    }

    loadRevenue() {
        this.loading.set(true);

        this.foodEmoliteService.getRevenue(this.fromDate, this.toDate, this.groupBy).subscribe({
            next: (res) => {
                const data = res?.data ?? null;
                this.revenue.set(data);

                const lineChartData = data?.lineChart ?? [];

                this.lineChart = {
                    ...this.lineChart,
                    xaxis: { categories: lineChartData.map((x: any) => x.label) },
                    series: [{ name: 'Doanh thu', data: lineChartData.map((x: any) => x.revenue) }]
                };

                const pieChartData = data?.pieChart ?? [];

                this.pieChart = {
                    ...this.pieChart,
                    series: pieChartData.map((x: any) => x.value),
                    labels: pieChartData.map((x: any) => STATUS_LABELS[x.label] || x.label),
                    colors: pieChartData.map((x: any) => STATUS_COLORS[x.label] || '#94a3b8')
                };

                this.loading.set(false);
            },
            error: (err) => {
                console.log(err);
                this.loading.set(false);
            }
        });
    }
}
