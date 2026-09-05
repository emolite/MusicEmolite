import { Routes } from '@angular/router';
import { AdminLayoutComponent } from '../../layout/layout-admin/layout-admin';
import { AdminProfileComponent } from './admin-profile/admin-profile';
import { AdminAddMusicComponent } from './add-music/add-music';
import { Songs } from './songs/song';
import { PublishLyricsComponent } from './publish-lyrics/publish-lyrics';
import { UsersComponent } from './users/users';
import { AlbumsComponent } from './albums/albums';
import { ArtistsComponent } from './artists/artists';
import { DashboardComponent } from './dashboard/dashboard';
import { RevenueReportComponent } from './reports/revenue-report/revenue-report';
import { StatisticsComponent } from './reports/statistics/statistics';
import { FrequencyComponent } from './reports/frequency/frequency';
import { ActivityLogComponent } from './activity-log/activity-log';
import { FoodAgentsComponent } from './food-agents/food-agents';
import { FoodStoresComponent } from './food-stores/food-stores';
import { FoodDishesComponent } from './food-dishes/food-dishes';
import { FoodCategoriesComponent } from './food-categories/food-categories';
import { FoodCustomersComponent } from './food-customers/food-customers';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Tổng quan'}
      },
      {
        path: 'songs',
        component: Songs,
        data: { title: 'Bài hát'}
      },
      {
        path: 'profile',
        component: AdminProfileComponent,
        data: { title: 'Thông tin' }
      },
      {
        path: 'users',
        component: UsersComponent,
        data: { title: 'Người dùng' }
      },
      {
        path: 'albums',
        component: AlbumsComponent,
        data: { title: 'Albums' }
      },
      {
        path: 'artists',
        component: ArtistsComponent,
        data: { title: 'Nghệ sĩ' }
      },
      {
        path: 'reports/revenue',
        component: RevenueReportComponent,
        data: { title: 'Báo cáo doanh thu' }
      },
      {
        path: 'reports/statistics',
        component: StatisticsComponent,
        data: { title: 'Thống kê' }
      },
      {
        path: 'reports/frequency',
        component: FrequencyComponent,
        data: { title: 'Tần Suất' }
      },
      {
        path: 'privacy/activity-log',
        component: ActivityLogComponent,
        data: { title: 'Lịch Sử Hoạt Động' }
      },
      {
        path: 'food/agents',
        component: FoodAgentsComponent,
        data: { title: 'Đại lý (FoodEmolite)' }
      },
      {
        path: 'food/stores',
        component: FoodStoresComponent,
        data: { title: 'Cửa hàng (FoodEmolite)' }
      },
      {
        path: 'food/dishes',
        component: FoodDishesComponent,
        data: { title: 'Món ăn (FoodEmolite)' }
      },
      {
        path: 'food/categories',
        component: FoodCategoriesComponent,
        data: { title: 'Danh mục (FoodEmolite)' }
      },
      {
        path: 'food/customers',
        component: FoodCustomersComponent,
        data: { title: 'Khách hàng (FoodEmolite)' }
      },
      {
        path: 'add-music',
        component: AdminAddMusicComponent,
        data: { title: 'Sáng tác' }
      },
      {
        path: 'publish-lyrics',
        component: PublishLyricsComponent,
        data: { title: 'Publish Lyrics'}
      },
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full'
      }
    ]
  }
];