import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Get the token from local storage
  const token = localStorage.getItem('token');
  
  // If token exists and the request is to our API, add the token to the headers
  if (token && req.url.includes('/api/')) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }
  
  // Otherwise, proceed with the original request
  return next(req);
}; 