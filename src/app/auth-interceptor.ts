import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { environment } from '../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const platformId = inject(PLATFORM_ID);

  let token: string | null = null;
  if (isPlatformBrowser(platformId)) {
    token = localStorage.getItem('accessToken');
  }

  // Clone the request with token if exists
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If token expired (401), try refreshing it
      if (error.status === 401 && isPlatformBrowser(platformId)) {
        // Refresh token logic
        const refreshToken = localStorage.getItem('refreshToken');

        if (refreshToken) {
          // Call refresh endpoint (use fetch to avoid circular deps in interceptors)
          return from(
            fetch(`${environment.baseUrl}`, {
              method: 'POST',
              credentials: 'include', // if using httpOnly cookie
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refreshToken }),
            }).then(res => {
              if (!res.ok) throw new Error('Refresh failed');
              return res.json();
            })
          ).pipe(
            switchMap((res: any) => {
              const newAccessToken = res?.accessToken;
              if (newAccessToken) {
                localStorage.setItem('accessToken', newAccessToken);

                // Retry the original request with new token
                const retryReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newAccessToken}`,
                  },
                });

                return next(retryReq);
              } else {
                throw new Error('No access token in refresh response');
              }
            }),
            catchError(refreshErr => {
              console.error('Refresh token failed', refreshErr);
              return throwError(() => refreshErr);
            })
          );
        }
      }

      return throwError(() => error);
    })
  );
};
