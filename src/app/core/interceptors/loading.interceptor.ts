import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/implementations/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (request, next) => {
  const loadingService = inject(LoadingService);
  
  // Skip loading for requests with X-Skip-Loading header
  if (request.headers.has('X-Skip-Loading')) {
    return next(request);
  }
  
  const requestId = crypto.randomUUID();
  loadingService.startLoading(requestId);
  
  return next(request).pipe(
    finalize(() => {
      loadingService.stopLoading(requestId);
    })
  );
};
