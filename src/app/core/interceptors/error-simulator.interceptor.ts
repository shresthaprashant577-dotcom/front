import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export const errorSimulatorInterceptor: HttpInterceptorFn = (req, next) => {
  // Only intercept mock API calls
  if (!req.url.includes('/api/') && !req.headers.has('X-Mock-API')) {
    return next(req);
  }

  // Simulate random errors (10% chance for demo purposes)
  const shouldSimulateError = environment.mock?.simulateErrors || 
                              Math.random() < 0.1;

  if (shouldSimulateError) {
    const errorTypes = [
      {
        status: 401,
        message: 'Unauthorized - Invalid or expired token'
      },
      {
        status: 403,
        message: 'Forbidden - Insufficient permissions'
      },
      {
        status: 404,
        message: 'Not Found - Resource does not exist'
      },
      {
        status: 409,
        message: 'Conflict - Resource already exists'
      },
      {
        status: 422,
        message: 'Unprocessable Entity - Validation failed'
      },
      {
        status: 429,
        message: 'Too Many Requests - Rate limit exceeded'
      },
      {
        status: 500,
        message: 'Internal Server Error - Something went wrong'
      },
      {
        status: 503,
        message: 'Service Unavailable - Server is down for maintenance'
      }
    ];

    const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
    
    // Create a mock error response
    const errorResponse = new HttpErrorResponse({
      error: {
        message: errorType.message,
        code: `ERROR_${errorType.status}`,
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substring(7)
      },
      status: errorType.status,
      statusText: errorType.message.split(' - ')[0],
      url: req.url
    });

    return throwError(() => errorResponse);
  }

  return next(req);
};