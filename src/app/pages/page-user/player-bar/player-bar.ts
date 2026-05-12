import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, OnChanges, inject } from '@angular/core';
import { PlayerService } from '../../../core/services/player.service';

@Component({
  selector: 'app-player-bar',
  standalone: true,
  templateUrl: './player-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerBarComponent {
  player = inject(PlayerService);
}