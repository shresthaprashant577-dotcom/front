import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';

// Mock interceptors
import { mockDelayInterceptor } from './core/interceptors/mock-delay.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { errorSimulatorInterceptor } from './core/interceptors/error-simulator.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([
        mockDelayInterceptor,
        loadingInterceptor,
        errorSimulatorInterceptor
      ])
    )
  ]
};