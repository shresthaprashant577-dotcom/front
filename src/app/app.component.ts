import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastNotificationComponent } from './shared/components/toast-notifications/toast-notification.component';
import { GlobalLoadingComponent } from './shared/components/global-loading/global-loading.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastNotificationComponent, GlobalLoadingComponent],
  template: `
    <!-- Global Notifications -->
    <app-toast-notification />
    
    <!-- Global Loading Indicator -->
    <app-global-loading />
    
    <!-- Main Router Outlet -->
    <router-outlet />
  `,
})
export class AppComponent {
  title = 'SecureBank - Banking Management System';
}