import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import { AppTableComponent } from '../../../shared/components/table/table';
import { TableColumn } from '../../../core/models/front-end/table/table-column.model';
import { FilterComponent } from '../../../shared/components/filter/filter';

import { PAGINATION } from '../../../core/constants/pagination.constants';

import { ArtistService } from '../../../core/services/artist.service';
import { ArtistResponse } from '../../../core/models/artist/res-artist.model';
import { ArtistRequest } from '../../../core/models/artist/req-artist.model';
import { FilterField } from '../../../core/models/front-end/filter/filter-field.model';
import { DetailPanelComponent } from '../../../shared/components/detail-panel/detail-panel';
import { SongService } from '../../../core/services/song.service';

@Component({
    selector: 'app-artists',
    standalone: true,
    imports: [
        CommonModule,
        AppTableComponent,
        FilterComponent,
        DetailPanelComponent
    ],
    templateUrl: './artists.html'
})
export class ArtistsComponent {

    private artistService = inject(ArtistService);
    private songService = inject(SongService);

    selectedArtist = signal<any | null>(null);
    artistSongs = signal<any[]>([]);
    loadingArtistSongs = signal(false);

    loading = signal(false);

    sortBy = signal('createdAt');

    asc = signal(false);

    rows = signal<any[]>([]);

    currentPage = signal(PAGINATION.DEFAULT_PAGE);

    totalPages = signal(PAGINATION.DEFAULT_PAGE);

    totalRecords = signal(0);

    pageSize = signal(20);

    filter = signal<ArtistRequest>({
        keyword: ''
    });

    filterFields: FilterField[] = [
        {
            key: 'keyword',
            label: 'Từ khóa',
            type: 'text',
            placeholder: 'Nhập tên nghệ sĩ...'
        },
        {
            key: 'country',
            label: 'Quốc gia',
            type: 'text',
            placeholder: 'Nhập quốc gia...'
        },
        {
            key: 'isActived',
            label: 'Trạng thái',
            type: 'select',
            options: [
                {
                    label: 'Hoạt động',
                    value: 'true'
                },
                {
                    label: 'Không hoạt động',
                    value: 'false'
                }
            ]
        }
    ];

    columns: TableColumn[] = [
        {
            key: 'stt',
            label: 'STT',
            width: '80px',
            align: 'center'
        },
        {
            key: 'url',
            label: 'Ảnh',
            type: 'image',
            width: '100px',
            align: 'left'
        },
        {
            key: 'name',
            label: 'Tên nghệ sĩ'
        },
        {
            key: 'stageName',
            label: 'Nghệ danh'
        },
        {
            key: 'country',
            label: 'Quốc gia',
            align: 'center'
        },
        {
            key: 'isActived',
            label: 'Trạng thái',
            type: 'status',
            align: 'center'
        },
        {
            key: 'createdAt',
            label: 'Ngày tạo',
            type: 'date',
            sortable: true
        }
    ];

    ngOnInit(): void {
        this.loadArtists();
    }

    loadArtists() {

        this.loading.set(true);

        this.artistService.searchArtistsAdmin({
            page: this.currentPage(),
            pageSize: this.pageSize(),
            asc: this.asc(),
            searchParams: {
                ...this.filter(),
                sortBy: this.sortBy()
            }
        })
            .subscribe({
                next: (res: any) => {

                    const data: ArtistResponse[] = res?.data ?? [];

                    const mapped = data.map((item, index) => ({
                        ...item,
                        stt:
                            ((this.currentPage() - 1)
                                * this.pageSize())
                            + index
                            + 1
                    }));

                    this.rows.set(mapped);

                    this.totalPages.set(
                        res?.totalPages ?? PAGINATION.DEFAULT_PAGE
                    );

                    this.totalRecords.set(res?.totalRecords ?? 0);

                    this.loading.set(false);
                },

                error: (err) => {
                    console.log(err);
                    this.loading.set(false);
                }
            });
    }

    onFilterChange(data: any) {

        this.currentPage.set(1);

        this.filter.set({
            ...data,

            isActived:
                data.isActived === ''
                    ? undefined
                    : data.isActived === 'true'
        });

        this.loadArtists();
    }

    onPageChange(page: number) {

        this.currentPage.set(page);

        this.loadArtists();
    }

    onPageSizeChange(size: number) {

        this.pageSize.set(size);

        this.currentPage.set(1);

        this.loadArtists();
    }

    onRowClick(row: any) {

        console.log(row);
    }

    onRowDblClick(row: any) {

        this.selectedArtist.set(row);
        this.loadArtistSongs(row.id);
    }

    closeDetail() {

        this.selectedArtist.set(null);
        this.artistSongs.set([]);
    }

    private loadArtistSongs(artistId: number) {

        this.loadingArtistSongs.set(true);

        this.songService.searchSongsAdmin({
            page: 1,
            pageSize: 50,
            asc: false,
            searchParams: { artistId }
        }).subscribe({
            next: (res) => {
                this.artistSongs.set(res?.data ?? []);
                this.loadingArtistSongs.set(false);
            },
            error: () => {
                this.loadingArtistSongs.set(false);
            }
        });
    }

    onSort(column: string) {

        if (this.sortBy() === column) {

            this.asc.set(!this.asc());
        }
        else {

            this.sortBy.set(column);

            this.asc.set(false);
        }

        this.loadArtists();
    }
}
