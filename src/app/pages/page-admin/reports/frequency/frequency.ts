import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexLegend, ApexNonAxisChartSeries, ApexResponsive, ApexStroke, ApexXAxis, ApexYAxis, NgApexchartsModule } from 'ng-apexcharts';

import { DashboardService } from '../../../../core/services/dashboard.service';
import { SongService } from '../../../../core/services/song.service';
import { DashboardTrendResponse } from '../../../../core/models/dashboard/dashboardtrend.model';
import { AppTableComponent } from '../../../../shared/components/table/table';
import { TableColumn } from '../../../../core/models/front-end/table/table-column.model';
import { PAGINATION } from '../../../../core/constants/pagination.constants';

const PAGE_SIZE = 10;

@Component({
    selector: 'app-frequency',
    standalone: true,
    imports: [CommonModule, NgApexchartsModule, AppTableComponent],
    templateUrl: './frequency.html'
})
export class FrequencyComponent {

    private dashboardService = inject(DashboardService);
    private songService = inject(SongService);

    /** "Xu hướng 30 ngày qua" line chart - moved here from Tổng quan. */
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
        chart: { type: 'line', height: 350, width: '100%', toolbar: { show: false } },
        xaxis: { categories: [] },
        yaxis: { labels: { formatter: (val) => `${Math.round(val)}` } },
        stroke: { curve: 'smooth', width: 4 },
        dataLabels: { enabled: false },
        legend: { position: 'bottom' }
    };

    /** "Tỷ lệ tổng quan" pie chart - moved here from Tổng quan. */
    pieChart: {
        series: ApexNonAxisChartSeries;
        chart: ApexChart;
        labels: string[];
        legend: ApexLegend;
        responsive: ApexResponsive[];
    } = {
        series: [],
        chart: { type: 'pie', height: 350, width: '100%' },
        labels: ['Views', 'Likes', 'Users'],
        legend: { position: 'bottom' },
        responsive: [
            {
                breakpoint: 768,
                options: {
                    chart: { height: 300 },
                    legend: { position: 'bottom' }
                }
            }
        ]
    };

    loadingTrend = signal(true);
    loadingSummary = signal(true);
    loadingSongList = signal(false);
    songs = signal<any[]>([]);
    songsCurrentPage = signal(PAGINATION.DEFAULT_PAGE);
    songsTotalPages = signal(PAGINATION.DEFAULT_PAGE);
    songsSortBy = signal('views');
    songsAsc = signal(false);

    songColumns: TableColumn[] = [
        { key: 'stt', label: 'STT', width: '80px', align: 'center' },
        { key: 'imgUrl', label: 'Ảnh', type: 'image', width: '100px', align: 'left' },
        { key: 'title', label: 'Tên bài hát' },
        { key: 'artistName', label: 'Nghệ sĩ' },
        { key: 'views', label: 'Lượt xem', align: 'center', sortable: true },
        { key: 'likes', label: 'Lượt thích', align: 'center', sortable: true }
    ];

    ngOnInit(): void {
        this.loadTrend();
        this.loadPieSummary();
        this.loadSongList();
    }

    loadTrend() {
        this.loadingTrend.set(true);

        this.dashboardService.getTrend().subscribe({
            next: (res) => {
                const trend: DashboardTrendResponse[] = res.data ?? [];

                this.lineChart = {
                    ...this.lineChart,
                    xaxis: {
                        categories: trend.map(x =>
                            new Date(x.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
                        )
                    },
                    series: [
                        { name: 'Views', data: trend.map(x => x.views) },
                        { name: 'Likes', data: trend.map(x => x.likes) },
                        { name: 'Users', data: trend.map(x => x.users) }
                    ]
                };

                this.loadingTrend.set(false);
            },
            error: (err) => {
                console.log(err);
                this.loadingTrend.set(false);
            }
        });
    }

    loadPieSummary() {
        this.loadingSummary.set(true);

        this.dashboardService.getSummary().subscribe({
            next: (res) => {
                const summary = res?.data;

                if (!summary) {
                    this.loadingSummary.set(false);
                    return;
                }

                this.pieChart = {
                    ...this.pieChart,
                    series: [summary.totalViews, summary.totalLikes, summary.totalUsers]
                };

                this.loadingSummary.set(false);
            },
            error: (err) => {
                console.log(err);
                this.loadingSummary.set(false);
            }
        });
    }

    loadSongList() {
        this.loadingSongList.set(true);

        this.songService.searchSongsAdmin({
            page: this.songsCurrentPage(),
            pageSize: PAGE_SIZE,
            asc: this.songsAsc(),
            searchParams: { sortBy: this.songsSortBy() }
        }).subscribe({
            next: (res: any) => {
                const data: any[] = res?.data ?? [];

                const mapped = data.map((item, index) => ({
                    ...item,
                    stt: ((this.songsCurrentPage() - 1) * PAGE_SIZE) + index + 1
                }));

                this.songs.set(mapped);
                this.songsTotalPages.set(res?.totalPages ?? PAGINATION.DEFAULT_PAGE);
                this.loadingSongList.set(false);
            },
            error: (err) => {
                console.log(err);
                this.loadingSongList.set(false);
            }
        });
    }

    onSongsPageChange(page: number) {
        this.songsCurrentPage.set(page);
        this.loadSongList();
    }

    onSortSongs(column: string) {
        if (this.songsSortBy() === column) {
            this.songsAsc.set(!this.songsAsc());
        } else {
            this.songsSortBy.set(column);
            this.songsAsc.set(false);
        }

        this.loadSongList();
    }
}
