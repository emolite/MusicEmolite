import {
  Component, Input, Output, EventEmitter,
  OnInit, OnChanges, SimpleChanges,
  HostListener, ElementRef, forwardRef, inject, computed
} from '@angular/core';

import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../core/services/auth.service';

export interface DropdownOption {
  label: string;
  value: any;
  disabled?: boolean;
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './dropdown.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true
    }
  ]
})
export class DropdownComponent
  implements OnInit, OnChanges, ControlValueAccessor {

  @Input() options: DropdownOption[] = [];

  @Input() placeholder = 'Chọn một giá trị';

  @Input() searchable = false;

  @Input() searchPlaceholder = 'Tìm kiếm...';

  @Input() disabled = false;

  @Input() value: any = null;

  @Output() changed =
    new EventEmitter<DropdownOption | null>();

  private authService = inject(AuthService);

  private el = inject(ElementRef);

  isAdmin = computed(() => {

    const roleCode =
      this.authService.user()?.roleCode ?? '';

    return roleCode.includes('ADMIN');
  });

  isOpen = false;

  searchQuery = '';

  filteredOptions: DropdownOption[] = [];

  selectedOption: DropdownOption | null = null;

  private onChange = (_: any) => {};

  private onTouched = () => {};

  ngOnInit() {

    this.filteredOptions = [...this.options];

    this.selectedOption =
      this.options.find(o => o.value === this.value)
      ?? null;
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes['options']) {

      this.filteredOptions = [...this.options];
    }

    if (changes['value'] || changes['options']) {

      this.selectedOption =
        this.options.find(o => o.value === this.value)
        ?? null;
    }
  }

  @HostListener('document:click', ['$event'])

  onDocumentClick(e: MouseEvent) {

    if (!this.el.nativeElement.contains(e.target)) {

      this.isOpen = false;

      this.resetSearch();
    }
  }

  toggle() {

    if (this.disabled) return;

    this.isOpen = !this.isOpen;

    if (!this.isOpen) {

      this.resetSearch();
    }
  }

  select(option: DropdownOption) {

    if (option.disabled) return;

    this.value = option.value;

    this.selectedOption = option;

    this.isOpen = false;

    this.resetSearch();

    this.onChange(this.value);

    this.onTouched();

    this.changed.emit(option);
  }

  onSearch() {

    const q =
      this.searchQuery.toLowerCase().trim();

    this.filteredOptions = q
      ? this.options.filter(o =>
          o.label.toLowerCase().includes(q))
      : [...this.options];
  }

  private resetSearch() {

    this.searchQuery = '';

    this.filteredOptions = [...this.options];
  }

  writeValue(val: any) {

    this.value = val;

    this.selectedOption =
      this.options.find(o => o.value === val)
      ?? null;
  }

  registerOnChange(fn: any) {

    this.onChange = fn;
  }

  registerOnTouched(fn: any) {

    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean) {

    this.disabled = disabled;
  }
}