import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detail-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-panel.html',
  styleUrl: './detail-panel.css'
})
export class DetailPanelComponent {
  @Input() open = false;
  @Input() title = '';

  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }
}
