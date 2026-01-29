import { HttpInterceptorFn } from '@angular/common/http';
import { delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export const mockDelayInterceptor: HttpInterceptorFn = (req, next) => {
  // Only intercept mock API calls
  if (req.url.includes('/api/') || req.headers.has('X-Mock-API')) {
    const delayMs =
      environment.mock?.delay ??
      Math.floor(Math.random() * 1300) + 200;

    return next(req).pipe(
      delay(delayMs)
    );
  }

  return next(req);
};
