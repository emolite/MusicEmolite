import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../../../core/services/player.service';


@Component({
  selector: 'app-player-bar-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-bar-detail.html',
  styleUrl: './player-bar-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerBarDetailComponent {
  player = inject(PlayerService);

  loading = signal(true);
  song = computed(() => {
    const track = this.player.currentTrack();
    if (!track) return null;
    return track;
  });
  progress = computed(() => this.player.progressPercent());
}