import { Component, OnInit, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { LucideAngularModule, User, Settings, ArrowLeft, Music, ShieldCheck } from 'lucide-angular';

const CHILD_LABELS: Record<string, string> = {
  profile: 'Thông tin',
  artists: 'Nghệ sĩ',
  account: 'Tài khoản & mật khẩu'
};

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
export class SettingsComponent implements OnInit {
  readonly UserIcon = User;
  readonly Setting = Settings;
  readonly ArrowLeftIcon = ArrowLeft;
  readonly MusicIcon = Music;
  readonly ShieldIcon = ShieldCheck;

  private router = inject(Router);
  private route = inject(ActivatedRoute);

  activeChild = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.computeActiveChild())
    ),
    { initialValue: this.computeActiveChild() }
  );

  private computeActiveChild(): string | null {
    const path = this.router.url.split('?')[0].split('#')[0];
    const segments = path.split('/').filter(Boolean);
    const idx = segments.indexOf('setting');

    if (idx === -1) return null;

    return segments[idx + 1] ?? null;
  }

  activeChildLabel(): string {
    const child = this.activeChild();
    return child ? CHILD_LABELS[child] ?? '' : '';
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.innerWidth >= 768 && !this.computeActiveChild()) {
      this.router.navigate(['profile'], { relativeTo: this.route });
    }
  }
}
