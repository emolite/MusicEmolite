import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
    ApexAxisChartSeries,
    ApexChart,
    ApexDataLabels,
    ApexLegend,
    ApexStroke,
    ApexXAxis,
    ApexYAxis,
    NgApexchartsModule
} from 'ng-apexcharts';

import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardSummaryResponse } from '../../../core/models/dashboard/dashboardsummary.model';
import { DashboardTrendResponse } from '../../../core/models/dashboard/dashboardtrend.model';
import { FoodEmoliteService } from '../../../core/services/food-emolite.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        NgApexchartsModule
    ],
    templateUrl: './dashboard.html'
})
export class DashboardComponent {

    private dashboardService = inject(DashboardService);
    private foodEmoliteService = inject(FoodEmoliteService);

    loading = signal(false);

    data = signal<DashboardSummaryResponse | null>(null);

    loadingFood = signal(false);
    foodData = signal<{ totalAgents: number; totalUsers: number; totalOrders: number; totalRevenue: number } | null>(null);

    lineChart: {
        series: ApexAxisChartSeries;
        chart: ApexChart;
        xaxis: ApexXAxis;
        yaxis: ApexYAxis;
        stroke: ApexStroke;
        dataLabels: ApexDataLabels;
        legend: ApexLegend;
    } = {
        series: [],
        chart: {
            type: 'line',
            height: 350,
            toolbar: { show: false }
        },
        xaxis: {
            categories: []
        },
        yaxis: {
            labels: {
                formatter: (val) => `${Math.round(val)}`
            }
        },
        stroke: {
            curve: 'smooth',
            width: 4
        },
        dataLabels: {
            enabled: false
        },
        legend: {
            position: 'bottom'
        }
    };

    foodLineChart: {
        series: ApexAxisChartSeries;
        chart: ApexChart;
        xaxis: ApexXAxis;
        yaxis: ApexYAxis;
        stroke: ApexStroke;
        dataLabels: ApexDataLabels;
    } = {
        series: [],
        chart: {
            type: 'line',
            height: 350,
            toolbar: { show: false }
        },
        xaxis: {
            categories: []
        },
        yaxis: {
            labels: {
                formatter: (val) => `${Math.round(val)}`
            }
        },
        stroke: {
            curve: 'smooth',
            width: 4,
            colors: ['#10b981']
        },
        dataLabels: {
            enabled: false
        }
    };

    ngOnInit(): void {
        this.loadSummary();
        this.loadTrend();
        this.loadFoodSummary();
    }

    loadFoodSummary() {
        this.loadingFood.set(true);

        this.foodEmoliteService.getRevenue().subscribe({
            next: (res) => {
                const data = res?.data ?? null;
                this.foodData.set(data);

                const lineChartData = data?.lineChart ?? [];

                this.foodLineChart = {
                    ...this.foodLineChart,
                    xaxis: { categories: lineChartData.map((x: any) => x.label) },
                    series: [{ name: 'Doanh thu', data: lineChartData.map((x: any) => x.revenue) }]
                };

                this.loadingFood.set(false);
            },
            error: (err) => {
                console.log(err);
                this.loadingFood.set(false);
            }
        });
    }

    loadSummary() {
        this.loading.set(true);

        this.dashboardService.getSummary().subscribe({
            next: (res) => {
                const summary = res.data;

                if (!summary) {
                    this.loading.set(false);
                    return;
                }

                this.data.set(summary);

                this.loading.set(false);
            },
            error: (err) => {
                console.log(err);
                this.loading.set(false);
            }
        });
    }

    loadTrend() {
        this.dashboardService.getTrend().subscribe({
            next: (res) => {
                const trend: DashboardTrendResponse[] = res.data ?? [];

                this.lineChart.xaxis = {
                    categories: trend.map(x =>
                        new Date(x.date).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit'
                        })
                    )
                };

                this.lineChart.series = [
                    {
                        name: 'Views',
                        data: trend.map(x => x.views)
                    },
                    {
                        name: 'Likes',
                        data: trend.map(x => x.likes)
                    },
                    {
                        name: 'Users',
                        data: trend.map(x => x.users)
                    }
                ];
            },
            error: (err) => {
                console.log(err);
            }
        });
    }
}