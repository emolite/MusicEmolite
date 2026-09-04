import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexPlotOptions, ApexXAxis, NgApexchartsModule } from 'ng-apexcharts';

import { FoodEmoliteService } from '../../../../core/services/food-emolite.service';
import { SongService } from '../../../../core/services/song.service';

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
    imports: [CommonModule, NgApexchartsModule],
    templateUrl: './statistics.html'
})
export class StatisticsComponent {

    private foodEmoliteService = inject(FoodEmoliteService);
    private songService = inject(SongService);

    loadingFood = signal(false);
    loadingSongs = signal(false);

    foodChart: BarChart = barChartBase('#10b981');
    songChart: BarChart = barChartBase('#3b82f6');

    ngOnInit(): void {
        this.loadTopFoodProducts();
        this.loadTopSongs();
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
}
