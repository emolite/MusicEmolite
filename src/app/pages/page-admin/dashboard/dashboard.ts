import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
    ApexAxisChartSeries,
    ApexChart,
    ApexDataLabels,
    ApexLegend,
    ApexNonAxisChartSeries,
    ApexResponsive,
    ApexStroke,
    ApexXAxis,
    ApexYAxis,
    NgApexchartsModule
} from 'ng-apexcharts';

import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardSummaryResponse } from '../../../core/models/dashboard/dashboardsummary.model';
import { DashboardTrendResponse } from '../../../core/models/dashboard/dashboardtrend.model';

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

    loading = signal(false);

    data = signal<DashboardSummaryResponse | null>(null);

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

    pieChart: {
        series: ApexNonAxisChartSeries;
        chart: ApexChart;
        labels: string[];
        legend: ApexLegend;
        responsive: ApexResponsive[];
    } = {
        series: [],
        chart: {
            type: 'pie',
            height: 350
        },
        labels: [
            'Views',
            'Likes',
            'Users'
        ],
        legend: {
            position: 'bottom'
        },
        responsive: [
            {
                breakpoint: 768,
                options: {
                    chart: {
                        height: 300
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        ]
    };

    ngOnInit(): void {
        this.loadSummary();
        this.loadTrend();
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

                this.pieChart.series = [
                    summary.totalViews,
                    summary.totalLikes,
                    summary.totalUsers
                ];

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