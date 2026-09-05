import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './date-picker.html'
})
export class DatePickerComponent implements OnInit, OnChanges {

  /** ISO date string 'yyyy-MM-dd', or null when empty. */
  @Input() value: string | null = null;

  @Input() label?: string;

  @Input() placeholder = 'Chọn ngày';

  @Input() disabled = false;

  @Output() changed = new EventEmitter<string | null>();

  private el = inject(ElementRef);

  readonly dayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  readonly monthLabels = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  isOpen = false;
  viewYear = new Date().getFullYear();
  viewMonth = new Date().getMonth();
  weeks: (number | null)[][] = [];

  ngOnInit(): void {
    const parsed = this.parseValue(this.value);
    if (parsed) {
      this.viewYear = parsed.getFullYear();
      this.viewMonth = parsed.getMonth();
    }
    this.buildCalendar();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      const parsed = this.parseValue(this.value);
      if (parsed) {
        this.viewYear = parsed.getFullYear();
        this.viewMonth = parsed.getMonth();
      }
      this.buildCalendar();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    if (!this.el.nativeElement.contains(e.target)) {
      this.isOpen = false;
    }
  }

  get displayLabel(): string {
    const d = this.parseValue(this.value);
    if (!d) return '';
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }

  toggle() {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
  }

  prevMonth() {
    this.viewMonth--;
    if (this.viewMonth < 0) {
      this.viewMonth = 11;
      this.viewYear--;
    }
    this.buildCalendar();
  }

  nextMonth() {
    this.viewMonth++;
    if (this.viewMonth > 11) {
      this.viewMonth = 0;
      this.viewYear++;
    }
    this.buildCalendar();
  }

  selectDay(day: number) {
    const mm = String(this.viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const iso = `${this.viewYear}-${mm}-${dd}`;

    this.value = iso;
    this.isOpen = false;
    this.changed.emit(iso);
  }

  clear() {
    this.value = null;
    this.isOpen = false;
    this.changed.emit(null);
  }

  isSelected(day: number): boolean {
    const d = this.parseValue(this.value);
    return !!d && d.getFullYear() === this.viewYear && d.getMonth() === this.viewMonth && d.getDate() === day;
  }

  isToday(day: number): boolean {
    const t = new Date();
    return t.getFullYear() === this.viewYear && t.getMonth() === this.viewMonth && t.getDate() === day;
  }

  private parseValue(v: string | null): Date | null {
    if (!v) return null;
    const parts = v.split('-').map(Number);
    const [y, m, d] = parts;
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }

  private buildCalendar() {
    const firstDay = new Date(this.viewYear, this.viewMonth, 1);
    const daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7;

    const cells: (number | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

    this.weeks = weeks;
  }
}
