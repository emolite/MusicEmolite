import { Directive, ElementRef, HostListener, Input, OnDestroy, Renderer2, inject } from '@angular/core';

/**
 * Shows a small floating tooltip with the full text, but only when the host
 * element is actually truncated (scrollWidth > clientWidth - i.e. it's showing
 * an ellipsis). Attach directly to the truncated span/div, e.g.
 * <span class="truncate" [appTooltip]="song.title">{{ song.title }}</span>
 * If [appTooltip] is left empty, falls back to the host's own text content.
 */
@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') text = '';

  private el = inject(ElementRef<HTMLElement>);
  private renderer = inject(Renderer2);
  private tooltipEl: HTMLElement | null = null;

  @HostListener('mouseenter')
  onMouseEnter(): void {
    const host = this.el.nativeElement;

    if (host.scrollWidth <= host.clientWidth) {
      return;
    }

    const content = (this.text || host.textContent || '').trim();
    if (!content) {
      return;
    }

    this.show(content);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.hide();
  }

  private show(content: string): void {
    this.hide();

    const tooltip = this.renderer.createElement('div');
    this.renderer.appendChild(tooltip, this.renderer.createText(content));
    this.renderer.setAttribute(
      tooltip,
      'class',
      'fixed z-100000 max-w-xs rounded-lg bg-gray-900 px-3 py-1.5 text-xs leading-4 text-white shadow-lg pointer-events-none break-words'
    );
    this.renderer.appendChild(document.body, tooltip);

    const hostRect = this.el.nativeElement.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    let top = hostRect.top - tooltipRect.height - 8;
    if (top < 4) {
      top = hostRect.bottom + 8;
    }

    let left = hostRect.left + hostRect.width / 2 - tooltipRect.width / 2;
    left = Math.max(4, Math.min(left, window.innerWidth - tooltipRect.width - 4));

    this.renderer.setStyle(tooltip, 'top', `${top}px`);
    this.renderer.setStyle(tooltip, 'left', `${left}px`);

    this.tooltipEl = tooltip;
  }

  private hide(): void {
    if (this.tooltipEl) {
      this.renderer.removeChild(document.body, this.tooltipEl);
      this.tooltipEl = null;
    }
  }

  ngOnDestroy(): void {
    this.hide();
  }
}
