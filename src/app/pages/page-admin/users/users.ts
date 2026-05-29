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


@Component({
    selector: 'app-users',
    standalone: true,

    imports: [
        CommonModule,
        AppTableComponent,
        FilterComponent
    ],

    templateUrl: './users.html'
})
export class UsersComponent {

    private userService = inject(UserService);

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
                PAGINATION.DEFAULT_PAGE_SIZE,

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
                                    * PAGINATION.DEFAULT_PAGE_SIZE)
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
}