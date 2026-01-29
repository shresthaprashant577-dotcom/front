import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private notificationService = inject(NotificationService);
  
  handleError(error: any, context?: string): void {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);
    
    if (error instanceof HttpErrorResponse) {
      this.handleHttpError(error);
    } else if (error instanceof Error) {
      this.handleGenericError(error);
    } else {
      this.handleUnknownError(error);
    }
  }
  
  private handleHttpError(error: HttpErrorResponse): void {
    const status = error.status;
    let title = 'Request Failed';
    let message = 'An unexpected error occurred';
    
    switch (status) {
      case 0:
        title = 'Network Error';
        message = 'Unable to connect to the server. Please check your internet connection.';
        break;
      case 400:
        title = 'Bad Request';
        message = error.error?.message || 'The request was invalid.';
        break;
      case 401:
        title = 'Unauthorized';
        message = 'Please login again to continue.';
        break;
      case 403:
        title = 'Forbidden';
        message = 'You do not have permission to perform this action.';
        break;
      case 404:
        title = 'Not Found';
        message = 'The requested resource was not found.';
        break;
      case 409:
        title = 'Conflict';
        message = 'A conflict occurred while processing your request.';
        break;
      case 422:
        title = 'Validation Error';
        message = error.error?.message || 'Please check your input and try again.';
        break;
      case 429:
        title = 'Too Many Requests';
        message = 'You have made too many requests. Please try again later.';
        break;
      case 500:
        title = 'Server Error';
        message = 'An internal server error occurred. Please try again later.';
        break;
      case 503:
        title = 'Service Unavailable';
        message = 'The service is temporarily unavailable. Please try again later.';
        break;
    }
    
    this.notificationService.error(title, message, 8000);
  }
  
  private handleGenericError(error: Error): void {
    this.notificationService.error(
      'Application Error',
      error.message || 'An unexpected error occurred',
      5000
    );
  }
  
  private handleUnknownError(error: any): void {
    this.notificationService.error(
      'Unknown Error',
      'An unexpected error occurred. Please try again.',
      5000
    );
  }
  
  // Utility method for common error patterns
  showValidationErrors(errors: Record<string, string[]>): void {
    const errorMessages = Object.entries(errors)
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join('\n');
    
    this.notificationService.error(
      'Validation Failed',
      errorMessages,
      8000
    );
  }
}