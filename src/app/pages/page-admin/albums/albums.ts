import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';

import { AppTableComponent } from '../../../shared/components/table/table';
import { TableColumn } from '../../../core/models/front-end/table/table-column.model';
import { FilterComponent } from '../../../shared/components/filter/filter';

import { PAGINATION } from '../../../core/constants/pagination.constants';

import { AlbumService } from '../../../core/services/album.service';
import { AlbumResponse } from '../../../core/models/album/res-album.model';
import { AlbumRequest } from '../../../core/models/album/req-album.model';
import { FilterField } from '../../../core/models/front-end/filter/filter-field.model';

@Component({
    selector: 'app-albums',
    standalone: true,
    imports: [
        CommonModule,
        AppTableComponent,
        FilterComponent
    ],
    templateUrl: './albums.html'
})
export class AlbumsComponent {

    private albumService = inject(AlbumService);

    loading = signal(false);

    sortBy = signal('createdAt');

    asc = signal(false);

    rows = signal<any[]>([]);

    currentPage = signal(PAGINATION.DEFAULT_PAGE);

    totalPages = signal(PAGINATION.DEFAULT_PAGE);

    filter = signal<AlbumRequest>({
        keyword: ''
    });

    filterFields: FilterField[] = [
        {
            key: 'keyword',
            label: 'Từ khóa',
            type: 'text',
            placeholder: 'Nhập tên album...'
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
            key: 'title',
            label: 'Tên album'
        },
        {
            key: 'albumTypeName',
            label: 'Loại album',
            align: 'center'
        },
        {
            key: 'isActived',
            label: 'Trạng thái',
            type: 'status',
            align: 'center'
        },
        {
            key: 'releaseDate',
            label: 'Ngày phát hành',
            type: 'date',
            align: 'center',
            sortable: true
        },
        {
            key: 'createdAt',
            label: 'Ngày tạo',
            type: 'date',
            sortable: true
        }
    ];

    ngOnInit(): void {
        this.loadAlbums();
    }

    loadAlbums() {

        this.loading.set(true);

        this.albumService.searchPublicAlbums({
            page: this.currentPage(),
            pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
            asc: this.asc(),
            searchParams: {
                ...this.filter(),
                sortBy: this.sortBy()
            }
        })
            .subscribe({
                next: (res: any) => {

                    const data: AlbumResponse[] = res?.data ?? [];

                    const mapped = data.map((item, index) => ({
                        ...item,
                        stt:
                            ((this.currentPage() - 1)
                                * PAGINATION.DEFAULT_PAGE_SIZE)
                            + index
                            + 1
                    }));

                    this.rows.set(mapped);

                    this.totalPages.set(
                        res?.totalPages ?? PAGINATION.DEFAULT_PAGE
                    );

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

        this.loadAlbums();
    }

    onPageChange(page: number) {

        this.currentPage.set(page);

        this.loadAlbums();
    }

    onRowClick(row: any) {

        console.log(row);
    }

    onSort(column: string) {

        if (this.sortBy() === column) {

            this.asc.set(!this.asc());
        }
        else {

            this.sortBy.set(column);

            this.asc.set(false);
        }

        this.loadAlbums();
    }
}