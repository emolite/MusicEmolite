import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexStroke, ApexXAxis, ApexYAxis, NgApexchartsModule } from 'ng-apexcharts';

import { FoodEmoliteService } from '../../../../core/services/food-emolite.service';

@Component({
    selector: 'app-revenue-report',
    standalone: true,
    imports: [CommonModule, NgApexchartsModule],
    templateUrl: './revenue-report.html'
})
export class RevenueReportComponent {

    private foodEmoliteService = inject(FoodEmoliteService);

    /** Song revenue doesn't exist yet - the tab is here so it's not forgotten, just always shows the "chưa có" state. */
    activeTab = signal<'song' | 'food'>('food');

    loading = signal(false);
    revenue = signal<{ totalAgents: number; totalUsers: number; totalOrders: number; totalRevenue: number } | null>(null);

    loadingProducts = signal(false);
    products = signal<any[]>([]);

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

    ngOnInit(): void {
        this.loadRevenue();
        this.loadTopProducts();
    }

    setTab(tab: 'song' | 'food') {
        this.activeTab.set(tab);
    }

    loadRevenue() {
        this.loading.set(true);

        this.foodEmoliteService.getRevenue().subscribe({
            next: (res) => {
                const data = res?.data ?? null;
                this.revenue.set(data);

                const lineChartData = data?.lineChart ?? [];

                this.lineChart = {
                    ...this.lineChart,
                    xaxis: { categories: lineChartData.map((x: any) => x.label) },
                    series: [{ name: 'Doanh thu', data: lineChartData.map((x: any) => x.revenue) }]
                };

                this.loading.set(false);
            },
            error: (err) => {
                console.log(err);
                this.loading.set(false);
            }
        });
    }

    loadTopProducts() {
        this.loadingProducts.set(true);

        this.foodEmoliteService.searchProductRevenue({
            page: 1,
            pageSize: 10,
            asc: false,
            searchParams: {}
        }).subscribe({
            next: (res) => {
                this.products.set(res?.items ?? []);
                this.loadingProducts.set(false);
            },
            error: (err) => {
                console.log(err);
                this.loadingProducts.set(false);
            }
        });
    }
}
