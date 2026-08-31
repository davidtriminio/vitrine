import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { toAppError } from '../errors/app-error';

/**
 * Normalizes HTTP failures into a typed AppError (from ProblemDetails), so stores and
 * components consume a stable error contract instead of raw HttpErrorResponse.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        return throwError(() => toAppError(error.status, error.error));
      }
      return throwError(() => error);
    }),
  );
