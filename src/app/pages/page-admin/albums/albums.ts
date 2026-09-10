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
import { DetailPanelComponent } from '../../../shared/components/detail-panel/detail-panel';

@Component({
    selector: 'app-albums',
    standalone: true,
    imports: [
        CommonModule,
        AppTableComponent,
        FilterComponent,
        DetailPanelComponent
    ],
    templateUrl: './albums.html'
})
export class AlbumsComponent {

    private albumService = inject(AlbumService);

    selectedAlbum = signal<any | null>(null);

    loading = signal(false);

    sortBy = signal('createdAt');

    asc = signal(false);

    rows = signal<any[]>([]);

    currentPage = signal(PAGINATION.DEFAULT_PAGE);

    totalPages = signal(PAGINATION.DEFAULT_PAGE);

    totalRecords = signal(0);

    pageSize = signal(20);

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

        this.albumService.searchAlbumsAdmin({
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

                    const data: AlbumResponse[] = res?.data ?? [];

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

        this.loadAlbums();
    }

    onPageChange(page: number) {

        this.currentPage.set(page);

        this.loadAlbums();
    }

    onPageSizeChange(size: number) {

        this.pageSize.set(size);

        this.currentPage.set(1);

        this.loadAlbums();
    }

    onRowClick(row: any) {

        console.log(row);
    }

    onRowDblClick(row: any) {

        this.selectedAlbum.set(row);
    }

    closeDetail() {

        this.selectedAlbum.set(null);
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