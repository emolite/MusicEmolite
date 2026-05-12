import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar';
import { TopbarComponent } from './topbar/topbar';
import { PlayerBarComponent } from '../pages/page-user/player-bar/player-bar';
import { PlayerService } from '../core/services/player.service';

@Component({
  selector: 'app-layout-user',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, PlayerBarComponent],
  templateUrl: './layout-user.html'
})
export class LayoutUserComponent {
  public player = inject(PlayerService)
}