import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from './admin-sidebar/admin-sidebar';
import { AdminTopbarComponent } from './admin-topbar/admin-topbar';

@Component({
  selector: 'app-layout-admin',
  standalone: true,
  imports: [RouterOutlet, AdminSidebarComponent, AdminTopbarComponent],
  templateUrl: './layout-admin.html'
})
export class AdminLayoutComponent {}