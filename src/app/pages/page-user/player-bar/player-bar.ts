import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, OnChanges, inject, signal } from '@angular/core';
import { PlayerService } from '../../../core/services/player.service';
import { RouterLink } from '@angular/router';
import { PlayerBarDetailComponent } from "./player-bar-detail/player-bar-detail";

@Component({
  selector: 'app-player-bar',
  standalone: true,
  imports: [],
  styleUrl: './player-bar.css',
  templateUrl: './player-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerBarComponent {
  player = inject(PlayerService);
}