import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';

/**
 * Fires `visible` when the host element (a sentinel placed after a list)
 * scrolls into view. Uses IntersectionObserver against the real viewport
 * rather than a scroll-event listener on a specific container, since which
 * ancestor actually scrolls varies per page (some lists scroll inside their
 * own div, others rely on the shared layout's <main>) - IntersectionObserver
 * doesn't care which one it is.
 */
@Directive({
  selector: '[appInfiniteScroll]',
  standalone: true
})
export class InfiniteScrollDirective implements OnInit, OnDestroy {
  @Input() disabled = false;
  @Output() visible = new EventEmitter<void>();

  private el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    this.observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting && !this.disabled) {
          this.visible.emit();
        }
      },
      { rootMargin: '400px' }
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
