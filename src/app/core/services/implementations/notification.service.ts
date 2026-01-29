import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration: number;        // ✅ Always defined internally
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = signal<Notification[]>([]);

  // Track timeouts to avoid memory leaks
  private timeouts = new Map<string, number>();

  getNotifications() {
    return this.notifications.asReadonly();
  }

  show(notification: Omit<Notification, 'id' | 'timestamp' | 'duration'> & { duration?: number }): string {
    const id = crypto.randomUUID();

    const fullNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      duration: notification.duration ?? 5000
    };

    this.notifications.update(list => [...list, fullNotification]);

    // Auto-remove if duration > 0
    if (fullNotification.duration > 0) {
      const timeoutId = window.setTimeout(() => {
        this.remove(id);
      }, fullNotification.duration);

      this.timeouts.set(id, timeoutId);
    }

    return id;
  }

  success(title: string, message: string, duration?: number): string {
    return this.show({ type: 'success', title, message, duration });
  }

  error(title: string, message: string, duration?: number): string {
    return this.show({ type: 'error', title, message, duration });
  }

  warning(title: string, message: string, duration?: number): string {
    return this.show({ type: 'warning', title, message, duration });
  }

  info(title: string, message: string, duration?: number): string {
    return this.show({ type: 'info', title, message, duration });
  }

  remove(id: string): void {
    // Clear timeout if exists
    const timeoutId = this.timeouts.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeouts.delete(id);
    }

    this.notifications.update(list =>
      list.filter(n => n.id !== id)
    );
  }

  clearAll(): void {
    // Clear all timeouts
    this.timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.timeouts.clear();

    this.notifications.set([]);
  }
}
