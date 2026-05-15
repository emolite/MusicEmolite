import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar';
import { TopbarComponent } from './topbar/topbar';
import { PlayerBarComponent } from '../pages/page-user/player-bar/player-bar';
import { PlayerBarDetailComponent } from '../pages/page-user/player-bar/player-bar-detail/player-bar-detail';
import { PlayerService } from '../core/services/player.service';

@Component({
  selector: 'app-layout-user',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, PlayerBarComponent, PlayerBarDetailComponent],
  templateUrl: './layout-user.html',
  styleUrl: './layout-user.css'
})
export class LayoutUserComponent {
  public player = inject(PlayerService)
}