export interface AdminMenuItem {
    label: string;
    url: string;
    icon: string;
}

export interface AdminMenuSection {
    title: string;
    items: AdminMenuItem[];
}

/**
 * Sidebar menu definition for the admin layout - route (url) + label + icon markup
 * kept out of the template so new entries don't require touching admin-sidebar.html.
 */
export const ADMIN_MENU_SECTIONS: AdminMenuSection[] = [
    {
        title: 'Hệ thống',
        items: [
            {
                label: 'Tổng Quan',
                url: 'dashboard',
                icon: `<svg class="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7">
                    <rect x="3" y="3" width="6" height="6" rx="1.5" />
                    <rect x="11" y="3" width="6" height="6" rx="1.5" />
                    <rect x="3" y="11" width="6" height="6" rx="1.5" />
                    <rect x="11" y="11" width="6" height="6" rx="1.5" />
                </svg>`
            },
            {
                label: 'Thông Tin Cá Nhân',
                url: 'profile',
                icon: `<svg class="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7">
                    <circle cx="10" cy="7" r="3" />
                    <path d="M4 17a6 6 0 0112 0" stroke-linecap="round" />
                </svg>`
            }
        ]
    },
    {
        title: 'Quản Lý Khách Hàng',
        items: [
            {
                label: 'Danh Sách Người Dùng',
                url: 'users',
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <path d="M16 3.128a4 4 0 0 1 0 7.744" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <circle cx="9" cy="7" r="4" />
                </svg>`
            },
            {
                label: 'Danh Sách Nghệ Sĩ',
                url: 'artists',
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16.051 12.616a1 1 0 0 1 1.909.024l.737 1.452a1 1 0 0 0 .737.535l1.634.256a1 1 0 0 1 .588 1.806l-1.172 1.168a1 1 0 0 0-.282.866l.259 1.613a1 1 0 0 1-1.541 1.134l-1.465-.75a1 1 0 0 0-.912 0l-1.465.75a1 1 0 0 1-1.539-1.133l.258-1.613a1 1 0 0 0-.282-.866l-1.156-1.153a1 1 0 0 1 .572-1.822l1.633-.256a1 1 0 0 0 .737-.535z" />
                    <path d="M8 15H7a4 4 0 0 0-4 4v2" />
                    <circle cx="10" cy="7" r="4" />
                </svg>`
            },
            {
                label: 'Danh Sách Đại Lý',
                url: 'food/agents',
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m16 11 2 2 4-4" />
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                </svg>`
            },
            {
                label: 'Danh Sách Cửa Hàng',
                url: 'food/stores',
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5" />
                    <path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244" />
                    <path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05" />
                </svg>`
            },
            {
                label: 'Danh Sách Khách Hàng',
                url: 'food/customers',
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" x2="19" y1="8" y2="14" />
                    <line x1="22" x2="16" y1="11" y2="11" />
                </svg>`
            }
        ]
    },
    {
        title: 'Sản Phẩm & Dịch Vụ',
        items: [
            {
                label: 'Danh Sách Món Ăn',
                url: 'food/dishes',
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 16H4a2 2 0 1 1 0-4h16a2 2 0 1 1 0 4h-4.25" />
                    <path d="M5 12a2 2 0 0 1-2-2 9 7 0 0 1 18 0 2 2 0 0 1-2 2" />
                    <path d="M5 16a2 2 0 0 0-2 2 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 2 2 0 0 0-2-2q0 0 0 0" />
                    <path d="m6.67 12 6.13 4.6a2 2 0 0 0 2.8-.4l3.15-4.2" />
                </svg>`
            },
            {
                label: 'Danh Sách Danh Mục',
                url: 'food/categories',
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 5H2v7l6.29 6.29a2.43 2.43 0 0 0 3.42 0l3.58-3.58a2.43 2.43 0 0 0 0-3.42Z" />
                    <path d="M6 9.01V9" />
                    <path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19" />
                </svg>`
            },
            {
                label: 'Danh Sách Bài Hát',
                url: 'songs',
                icon: `<svg class="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7">
                    <path d="M8 4v9.09A3 3 0 1010 16V7h4V4H8z" stroke-linecap="round" stroke-linejoin="round" />
                </svg>`
            },
            {
                label: 'Danh Sách Album',
                url: 'albums',
                icon: `<svg class="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7">
                    <circle cx="10" cy="10" r="7" />
                    <circle cx="10" cy="10" r="2.5" />
                </svg>`
            }
        ]
    },
    {
        title: 'Thống kê & Báo cáo',
        items: [
            {
                label: 'Báo Cáo Doanh Thu',
                url: 'reports/revenue',
                icon: `<svg class="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7">
                    <path d="M4 16.5V8m5.5 8.5V4M15 16.5v-5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>`
            },
            {
                label: 'Thống Kê',
                url: 'reports/statistics',
                icon: `<svg class="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7">
                    <path d="M3 17h3v-6H3v6zm5.5 0h3V6h-3v11zM14 17h3v-9h-3v9z" stroke-linejoin="round" />
                </svg>`
            },
            {
                label: 'Tần Suất',
                url: 'reports/frequency',
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12h3l2-7 4 14 3-9 2 5h4" />
                </svg>`
            }
        ]
    },
    {
        title: 'Quyền Riêng Tư',
        items: [
            {
                label: 'Lịch Sử Hoạt Động',
                url: 'privacy/activity-log',
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M12 8v5" />
                    <path d="M12 16h.01" />
                </svg>`
            }
        ]
    }
];
