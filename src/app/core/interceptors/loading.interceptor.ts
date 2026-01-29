import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/implementations/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip loading for certain requests
  if (req.headers.has('X-Skip-Loading')) {
    return next(req);
  }

  const loadingService = inject(LoadingService);
  const requestId = Math.random().toString(36).substring(7);
  
  loadingService.startLoading(requestId);
  
  return next(req).pipe(
    finalize(() => {
      loadingService.stopLoading(requestId);
    })
  );
};