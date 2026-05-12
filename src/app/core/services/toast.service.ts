import { Injectable, signal } from '@angular/core';

export interface ToastData {
  id: number;
  type: 'success' | 'error';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  toasts = signal<ToastData[]>([]);

  show(
    type: 'success' | 'error',
    message: string
  ) {

    const toast: ToastData = {
      id: Date.now(),
      type,
      message
    };

    this.toasts.update(x => [...x, toast]);

    setTimeout(() => {
      this.remove(toast.id);
    }, 3000);

  }

  success(message: string) {
    this.show('success', message);
  }

  error(message: string) {
    this.show('error', message);
  }

  remove(id: number) {
    this.toasts.update(x => x.filter(t => t.id !== id));
  }
}