import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpStatusCode
} from '@angular/common/http';
import { inject } from '@angular/core';
import { ErrorHandlerService } from '../services/error-handler.service';
import { catchError, retryWhen, mergeMap, timer, throwError } from 'rxjs';

interface ApiError {
  message: string;
  code?: string;
  details?: string;
}

const MAX_RETRIES = 2;

function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case HttpStatusCode.BadRequest:
      return 'Invalid request';
    case HttpStatusCode.Unauthorized:
      return 'Authentication required';
    case HttpStatusCode.Forbidden:
      return 'Access denied';
    case HttpStatusCode.NotFound:
      return 'Resource not found';
    case HttpStatusCode.RequestTimeout:
      return 'Request timed out';
    case HttpStatusCode.Conflict:
      return 'Request conflict';
    case HttpStatusCode.UnprocessableEntity:
      return 'Invalid data provided';
    case HttpStatusCode.TooManyRequests:
      return 'Too many requests';
    case HttpStatusCode.InternalServerError:
      return 'Server error occurred';
    case HttpStatusCode.BadGateway:
      return 'Server temporarily unavailable';
    case HttpStatusCode.ServiceUnavailable:
      return 'Service unavailable';
    case HttpStatusCode.GatewayTimeout:
      return 'Server request timeout';
    case 0:
      return 'Network error occurred';
    default:
      return 'An unexpected error occurred';
  }
}

function isRetryableError(status: number): boolean {
  return [
    HttpStatusCode.RequestTimeout,
    HttpStatusCode.BadGateway,
    HttpStatusCode.ServiceUnavailable,
    HttpStatusCode.GatewayTimeout,
    0 // Network error
  ].includes(status);
}

function getRetryDelay(retryCount: number): number {
  const baseDelay = 1000;
  const maxDelay = 5000;
  const exponentialDelay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
  const jitter = Math.random() * 1000;
  return exponentialDelay + jitter;
}

function parseApiError(error: HttpErrorResponse): ApiError {
  try {
    if (typeof error.error === 'object' && error.error !== null) {
      return {
        message: error.error.message || getDefaultErrorMessage(error.status),
        code: error.error.code,
        details: error.error.details
      };
    }
  } catch {
    // If parsing fails, return default error message
  }

  return {
    message: getDefaultErrorMessage(error.status)
  };
}

function retryRequest(url: string): void {
  window.location.reload();
}

export const errorHandlingInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandler = inject(ErrorHandlerService);

  return next(req).pipe(
    retryWhen(errors => 
      errors.pipe(
        mergeMap((error, index) => {
          const retryAttempt = index + 1;
          
          if (isRetryableError(error.status) && retryAttempt <= MAX_RETRIES) {
            return timer(getRetryDelay(retryAttempt));
          }
          
          return throwError(() => error);
        })
      )
    ),
    catchError((error: HttpErrorResponse) => {
      let errorMessage: string;
      let errorDetails: string | undefined;
      let errorCode: string | undefined;
      let retryable = false;

      if (error.error instanceof ErrorEvent) {
        errorMessage = 'A client error occurred';
        errorDetails = error.error.message;
      } else {
        const apiError = parseApiError(error);
        errorMessage = apiError.message;
        errorDetails = apiError.details;
        errorCode = apiError.code;
        retryable = isRetryableError(error.status);
      }

      errorHandler.showError({
        id: Date.now().toString(),
        message: errorMessage,
        details: errorDetails,
        code: errorCode,
        type: 'error',
        retry: retryable ? () => retryRequest(error.url!) : undefined
      });

      return throwError(() => error);
    })
  );
};
