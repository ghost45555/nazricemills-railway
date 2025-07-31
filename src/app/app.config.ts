import { ApplicationConfig, ErrorHandler, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideClientHydration, withEventReplay, withIncrementalHydration } from '@angular/platform-browser';
import { routes } from './app.routes';
import { errorHandlingInterceptor } from './interceptors/error-handling.interceptor';
import { authInterceptor } from './interceptors/auth.interceptor';
import { ErrorHandlerService } from './services/error-handler.service';
import { AnalyticsConfig } from './shared/interfaces/analytics.interface';
import { LoadingService } from './services/loading.service';

const analyticsConfig: AnalyticsConfig = {
  enablePageViews: true,
  enableUserInteractions: true,
  enableErrorTracking: true,
  enablePerformanceTracking: true,
  sampleRate: 100,
  excludePaths: ['/private', '/admin'],
  sessionTimeout: 30
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptors([errorHandlingInterceptor, authInterceptor])),
    provideClientHydration(
      withEventReplay(),
      withIncrementalHydration()
    ),
    { provide: ErrorHandler, useClass: ErrorHandlerService },
    { provide: 'ANALYTICS_CONFIG', useValue: analyticsConfig },
    { 
      provide: 'SITE_CONFIG', 
      useValue: {
        siteName: 'Naz Rice Mills',
        siteUrl: 'https://nazricemills.com',
        defaultImage: '/assets/img/farm2-slider-bg.jpg',
        socialHandles: {
          twitter: '@nazricemills',
          facebook: 'nazricemills',
          instagram: 'nazricemills',
          linkedin: 'naz-rice-mills'
        }
      }
    },
    // Temporarily disabled for Railway deployment
    // provideServiceWorker('ngsw-worker.js', {
    //   enabled: !isDevMode(),
    //   registrationStrategy: 'registerWhenStable:30000'
    // }),
    LoadingService
  ]
};
