import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, timeout } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from './error-handler.service';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private http = inject(HttpClient);
  private errorHandler = inject(ErrorHandlerService);
  private loadingService = inject(LoadingService);
  
  private baseUrl = environment.apiUrl;
  private defaultTimeout = 30000; // 30 seconds
  
  get<T>(url: string, params?: any, options: {
    skipLoading?: boolean;
    timeout?: number;
    headers?: HttpHeaders;
  } = {}): Observable<T> {
    const requestOptions = this.createRequestOptions(params, options);
    const requestUrl = this.buildUrl(url);
    
    if (!options.skipLoading) {
      this.loadingService.startLoading(url);
    }
    
    return this.http.get<T>(requestUrl, requestOptions).pipe(
      timeout(options.timeout || this.defaultTimeout),
      catchError(error => {
        this.errorHandler.handleError(error, `GET ${url}`);
        return throwError(() => error);
      }),
      finalize(() => {
        if (!options.skipLoading) {
          this.loadingService.stopLoading(url);
        }
      })
    );
  }
  
  post<T>(url: string, body: any, options: {
    skipLoading?: boolean;
    timeout?: number;
    headers?: HttpHeaders;
  } = {}): Observable<T> {
    const requestOptions = this.createRequestOptions(null, options);
    const requestUrl = this.buildUrl(url);
    
    if (!options.skipLoading) {
      this.loadingService.startLoading(url);
    }
    
    return this.http.post<T>(requestUrl, body, requestOptions).pipe(
      timeout(options.timeout || this.defaultTimeout),
      catchError(error => {
        this.errorHandler.handleError(error, `POST ${url}`);
        return throwError(() => error);
      }),
      finalize(() => {
        if (!options.skipLoading) {
          this.loadingService.stopLoading(url);
        }
      })
    );
  }
  
  put<T>(url: string, body: any, options: {
    skipLoading?: boolean;
    timeout?: number;
    headers?: HttpHeaders;
  } = {}): Observable<T> {
    const requestOptions = this.createRequestOptions(null, options);
    const requestUrl = this.buildUrl(url);
    
    if (!options.skipLoading) {
      this.loadingService.startLoading(url);
    }
    
    return this.http.put<T>(requestUrl, body, requestOptions).pipe(
      timeout(options.timeout || this.defaultTimeout),
      catchError(error => {
        this.errorHandler.handleError(error, `PUT ${url}`);
        return throwError(() => error);
      }),
      finalize(() => {
        if (!options.skipLoading) {
          this.loadingService.stopLoading(url);
        }
      })
    );
  }
  
  delete<T>(url: string, options: {
    skipLoading?: boolean;
    timeout?: number;
    headers?: HttpHeaders;
  } = {}): Observable<T> {
    const requestOptions = this.createRequestOptions(null, options);
    const requestUrl = this.buildUrl(url);
    
    if (!options.skipLoading) {
      this.loadingService.startLoading(url);
    }
    
    return this.http.delete<T>(requestUrl, requestOptions).pipe(
      timeout(options.timeout || this.defaultTimeout),
      catchError(error => {
        this.errorHandler.handleError(error, `DELETE ${url}`);
        return throwError(() => error);
      }),
      finalize(() => {
        if (!options.skipLoading) {
          this.loadingService.stopLoading(url);
        }
      })
    );
  }
  
  patch<T>(url: string, body: any, options: {
    skipLoading?: boolean;
    timeout?: number;
    headers?: HttpHeaders;
  } = {}): Observable<T> {
    const requestOptions = this.createRequestOptions(null, options);
    const requestUrl = this.buildUrl(url);
    
    if (!options.skipLoading) {
      this.loadingService.startLoading(url);
    }
    
    return this.http.patch<T>(requestUrl, body, requestOptions).pipe(
      timeout(options.timeout || this.defaultTimeout),
      catchError(error => {
        this.errorHandler.handleError(error, `PATCH ${url}`);
        return throwError(() => error);
      }),
      finalize(() => {
        if (!options.skipLoading) {
          this.loadingService.stopLoading(url);
        }
      })
    );
  }
  
  private buildUrl(url: string): string {
    // If it's already a full URL, return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // For mock URLs, don't prepend baseUrl
    if (url.startsWith('/mock/')) {
      return url;
    }
    
    return `${this.baseUrl}${url.startsWith('/') ? url : '/' + url}`;
  }
  
  private createRequestOptions(params: any, options: {
    headers?: HttpHeaders;
    skipLoading?: boolean;
  }): {
    headers?: HttpHeaders;
    params?: HttpParams;
    withCredentials?: boolean;
  } {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    
    let headers = options.headers || new HttpHeaders();
    
    // Add mock header for interceptors
    if (environment.mock.enabled && !headers.has('X-Mock-API')) {
      headers = headers.set('X-Mock-API', 'true');
    }
    
    // Add skip loading header if needed
    if (options.skipLoading) {
      headers = headers.set('X-Skip-Loading', 'true');
    }
    
    // Add JSON content type if not set
    if (!headers.has('Content-Type')) {
      headers = headers.set('Content-Type', 'application/json');
    }
    
    return {
      headers,
      params: httpParams,
      withCredentials: true
    };
  }
}