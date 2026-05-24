import { Component, inject } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-admin-topbar',
  standalone: true,
  templateUrl: './admin-topbar.html'
})
export class AdminTopbarComponent {

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  pageTitle = '';

  ngOnInit() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => {
        let route = this.activatedRoute;
        while (route.firstChild) route = route.firstChild;
        return route.snapshot.data['title'] || '';
      })
    ).subscribe(title => {
      this.pageTitle = title;
    });

    let route = this.activatedRoute;
    while (route.firstChild) route = route.firstChild;
    this.pageTitle = route.snapshot.data['title'] || '';
  }
}