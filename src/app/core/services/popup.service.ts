import { Injectable, signal } from '@angular/core';

export interface PopupConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  /** When set, switches to a two-column layout: image on the left, icon/message/buttons on the right. */
  imageUrl?: string | null;
}

interface PopupState {
  options: PopupConfirmOptions;
  resolve: (result: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class PopupService {

  state = signal<PopupState | null>(null);

  /** Replaces the native `confirm()` dialog - resolves `true`/`false` once the user picks an option. */
  confirm(options: PopupConfirmOptions | string): Promise<boolean> {
    const resolved: PopupConfirmOptions = typeof options === 'string'
      ? { message: options }
      : options;

    return new Promise<boolean>(resolve => {
      this.state.set({ options: resolved, resolve });
    });
  }

  respond(result: boolean): void {
    const current = this.state();
    if (!current) return;

    this.state.set(null);
    current.resolve(result);
  }
}
