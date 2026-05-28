import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';

import { AppTableComponent } from '../../../shared/components/table/table';
import { TableColumn } from '../../../core/models/front-end/table/table-column.model';
import { SongService } from '../../../core/services/song.service';
import { SongResponse } from '../../../core/models/song/res-song.model';
import { PAGINATION } from '../../../core/constants/pagination.constants';
import { FilterComponent } from '../../../shared/components/filter/filter';
import { FilterField } from '../../../core/models/front-end/filter/filter-field.model';
import { SongRequest } from '../../../core/models/song/req-song.model';

@Component({
    selector: 'app-songs',
    standalone: true,
    imports: [
        CommonModule,
        AppTableComponent,
        FilterComponent
    ],
    templateUrl: './songs.html'
})
export class Songs {

    private songService = inject(SongService);

    loading = signal(false);
    sortBy = signal('createdAt');

    asc = signal(false);
    rows = signal<any[]>([]);
    currentPage = signal(PAGINATION.DEFAULT_PAGE);
    totalPages = signal(PAGINATION.DEFAULT_PAGE);
    filter = signal<SongRequest>({
        keyword: ''
    });

    filterFields: FilterField[] = [
        {
            key: 'keyword',
            label: 'Từ khóa',
            type: 'text',
            placeholder: 'Nhập tên bài hát...'
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
            key: 'imgUrl',
            label: 'Ảnh',
            type: 'image',
            width: '100px',
            align: 'left'
        },
        {
            key: 'title',
            label: 'Tên bài hát'
        },
        {
            key: 'artistName',
            label: 'Nghệ sĩ'
        },
        {
            key: 'views',
            label: 'Lượt xem',
            align: 'center',
            sortable: true
        },
        {
            key: 'likes',
            label: 'Lượt thích',
            align: 'center',
            sortable: true
        },
        {
            key: 'typeSong',
            label: 'Loại',
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
        this.loadSongs();
    }

    loadSongs() {

        this.loading.set(true);

        this.songService.searchPublicSongs({
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
                    const data: SongResponse[] = res?.data ?? [];
                    const mapped = data.map((item, index) => ({
                        ...item,
                        stt:
                            ((this.currentPage() - 1) * PAGINATION.DEFAULT_PAGE_SIZE)
                            + index
                            + 1
                    }));
                    this.rows.set(mapped);
                    this.totalPages.set(
                        res?.totalPages ?? PAGINATION.DEFAULT_PAGE
                    );
                    console.log(this.totalPages());
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

        this.loadSongs();
    }
    onPageChange(page: number) {
        this.currentPage.set(page);
        this.loadSongs();
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

        this.loadSongs();
    }
}