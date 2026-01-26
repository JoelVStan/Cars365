import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  text: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private toastSubject = new BehaviorSubject<ToastMessage | null>(null);
  toast$ = this.toastSubject.asObservable();

  show(text: string, type: ToastMessage['type'] = 'info') {
    this.toastSubject.next({ text, type });

    // auto clear after 3 seconds
    setTimeout(() => {
      this.toastSubject.next(null);
    }, 3000);
  }

  success(text: string) {
    this.show(text, 'success');
  }

  error(text: string) {
    this.show(text, 'error');
  }

  info(text: string) {
    this.show(text, 'info');
  }

  warning(text: string) {
    this.show(text, 'warning');
  }
}
