import {
  Component, Input, Output, EventEmitter,
  ElementRef, ViewChildren, QueryList, forwardRef, AfterViewInit
} from '@angular/core';

import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-otp-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './otp-input.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OtpInputComponent),
      multi: true
    }
  ]
})
export class OtpInputComponent implements ControlValueAccessor, AfterViewInit {

  @Input() length = 6;

  @Input() disabled = false;

  @Input() invalid = false;

  @Input() autoFocus = false;

  @Output() completed = new EventEmitter<string>();

  @ViewChildren('digitInput') digitInputs!: QueryList<ElementRef<HTMLInputElement>>;

  digits: string[] = [];

  private onChange = (_: string) => {};

  private onTouched = () => {};

  constructor() {
    this.digits = Array(this.length).fill('');
  }

  ngAfterViewInit() {
    if (this.autoFocus) {
      this.focusInput(0);
    }
  }

  get indexes(): number[] {
    return Array.from({ length: this.length }, (_, i) => i);
  }

  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9]/g, '').slice(-1);

    this.digits[index] = value;
    input.value = value;

    if (value && index < this.length - 1) {
      this.focusInput(index + 1);
    }

    this.emitValue();
  }

  onKeydown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.digits[index] && index > 0) {
      this.focusInput(index - 1);
    }
  }

  onPaste(event: ClipboardEvent, index: number) {
    const pasted = event.clipboardData?.getData('text') ?? '';
    const numbers = pasted.replace(/[^0-9]/g, '').split('');

    if (!numbers.length) return;

    event.preventDefault();

    for (let i = 0; i < numbers.length && index + i < this.length; i++) {
      this.digits[index + i] = numbers[i];
    }

    const lastFilledIndex = Math.min(index + numbers.length, this.length) - 1;
    this.focusInput(lastFilledIndex);

    this.emitValue();
  }

  private focusInput(index: number) {
    queueMicrotask(() => {
      this.digitInputs?.get(index)?.nativeElement.focus();
    });
  }

  private emitValue() {
    const code = this.digits.join('');

    this.onChange(code);
    this.onTouched();

    if (code.length === this.length) {
      this.completed.emit(code);
    }
  }

  writeValue(value: string | null) {
    const chars = (value ?? '').split('');
    this.digits = Array.from({ length: this.length }, (_, i) => chars[i] ?? '');
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
