import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideAngularModule, User, Settings, ArrowLeft, Music } from 'lucide-angular';

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.html',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideAngularModule
  ]
})
export class SettingsComponent {
  readonly UserIcon = User;
  readonly Setting = Settings;
  readonly ArrowLeftIcon = ArrowLeft;
  readonly MusicIcon = Music
}