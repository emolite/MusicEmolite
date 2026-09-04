import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';

import { AppTableComponent }
    from '../../../shared/components/table/table';

import { FilterComponent }
    from '../../../shared/components/filter/filter';

import { TableColumn }
    from '../../../core/models/front-end/table/table-column.model';

import { FilterField }
    from '../../../core/models/front-end/filter/filter-field.model';

import { UserService }
    from '../../../core/services/user.service';

import { PAGINATION }
    from '../../../core/constants/pagination.constants';
import { ReqUsers, ReqUsersFilter } from '../../../core/models/user/req-user-profile.model';
import { ResUsers } from '../../../core/models/user/res-user-profile.model';
import { DetailPanelComponent } from '../../../shared/components/detail-panel/detail-panel';
import { AlbumService } from '../../../core/services/album.service';
import { SongService } from '../../../core/services/song.service';

const PAGE_SIZE = 20;

@Component({
    selector: 'app-users',
    standalone: true,

    imports: [
        CommonModule,
        AppTableComponent,
        FilterComponent,
        DetailPanelComponent
    ],

    templateUrl: './users.html'
})
export class UsersComponent {

    private userService = inject(UserService);
    private albumService = inject(AlbumService);
    private songService = inject(SongService);

    selectedUser = signal<ResUsers | null>(null);
    userAlbums = signal<any[]>([]);
    userLikedSongs = signal<any[]>([]);
    loadingUserAlbums = signal(false);
    loadingUserLikedSongs = signal(false);

    loading = signal(false);

    rows = signal<ResUsers[]>([]);
    sortBy = signal('createdAt');
    asc = signal(false);
    currentPage = signal(
        PAGINATION.DEFAULT_PAGE
    );

    totalPages = signal(
        PAGINATION.DEFAULT_PAGE
    );

    filter = signal<ReqUsersFilter>({
        keyword: '',
        isActived: true
    });

    filterFields: FilterField[] = [

        { key: 'keyword', label: 'Tìm kiếm', type: 'text', placeholder: 'Tìm kiếm...' },

        {
            key: 'isActived',
            label: 'Trạng thái',
            type: 'select',

            options: [
                {
                    label: 'Hoạt động',
                    value: true
                },
                {
                    label: 'Không hoạt động',
                    value: false
                }
            ]
        },

        {
            key: 'gender',
            label: 'Giới tính',
            type: 'select',
            options: [
                {
                    label: 'Nam',
                    value: 'male'
                },
                {
                    label: 'Nữ',
                    value: 'female'
                }
            ]
        }
    ];

    columns: TableColumn[] = [

        {
            key: 'stt',
            label: 'STT',
            width: '80px',
            align: 'center',
        },

        {
            key: 'uri',
            label: 'Ảnh',
            type: 'image',
            width: '100px',
            align: 'center'
        },

        {
            key: 'username',
            label: 'Tên tài khoản'
        },

        {
            key: 'fullName',
            label: 'Họ tên'
        },

        {
            key: 'email',
            label: 'Email'
        },

        {
            key: 'phone',
            label: 'Số điện thoại'
        },

        {
            key: 'gender',
            label: 'Giới tính',
            align: 'center'
        },

        {
            key: 'roleCode',
            label: 'Vai trò',
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

        this.loadUsers();
    }

    loadUsers() {

        this.loading.set(true);

        const payload: ReqUsers = {

            page: this.currentPage(),

            pageSize:
                PAGE_SIZE,

            asc: this.asc(),

            searchParams: {
                ...this.filter(),
                sortBy: this.sortBy()
            }
        };
        this.userService
            .getUsers(payload)
            .subscribe({

                next: (res) => {

                    const data =
                        res?.data ?? [];

                    const mapped =
                        data.map((item, index) => ({

                            ...item,
                            gender: item.gender === 'male'
                                ? 'Nam'
                                : item.gender === 'female'
                                    ? 'Nữ'
                                    : item.gender,
                            stt:
                                ((this.currentPage() - 1)
                                    * PAGE_SIZE)
                                + index
                                + 1
                        }));

                    this.rows.set(mapped);

                    this.totalPages.set(
                        res?.totalPages
                        ?? PAGINATION.DEFAULT_PAGE
                    );

                    this.loading.set(false);
                },

                error: (err) => {

                    console.log(err);

                    this.loading.set(false);
                }
            });
    }

    onFilterChange(data: ReqUsersFilter) {

        this.currentPage.set(1);

        this.filter.set(data);

        this.loadUsers();
    }

    onPageChange(page: number) {

        this.currentPage.set(page);

        this.loadUsers();
    }

    onSort(column: string) {

        if (this.sortBy() === column) {

            this.asc.set(!this.asc());
        }

        else {

            this.sortBy.set(column);

            this.asc.set(false);
        }

        this.loadUsers();
    }

    onRowClick(row: ResUsers) {

        console.log(row);
    }

    onRowDblClick(row: ResUsers) {

        this.selectedUser.set(row);
        this.loadUserAlbums(row.id);
        this.loadUserLikedSongs(row.id);
    }

    closeDetail() {

        this.selectedUser.set(null);
        this.userAlbums.set([]);
        this.userLikedSongs.set([]);
    }

    private loadUserAlbums(userId: number) {

        this.loadingUserAlbums.set(true);

        this.albumService.getAlbumsByUserAdmin(userId, {
            page: 1,
            pageSize: 50,
            asc: false,
            searchParams: {}
        }).subscribe({
            next: (res) => {
                this.userAlbums.set(res?.data ?? []);
                this.loadingUserAlbums.set(false);
            },
            error: () => {
                this.loadingUserAlbums.set(false);
            }
        });
    }

    private loadUserLikedSongs(userId: number) {

        this.loadingUserLikedSongs.set(true);

        this.songService.getLikedSongsByUserAdmin(userId, {
            page: 1,
            pageSize: 50,
            asc: false,
            searchParams: {}
        }).subscribe({
            next: (res) => {
                this.userLikedSongs.set(res?.data ?? []);
                this.loadingUserLikedSongs.set(false);
            },
            error: () => {
                this.loadingUserLikedSongs.set(false);
            }
        });
    }
}