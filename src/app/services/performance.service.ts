import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import {
  PerformanceMetrics,
  NavigationTiming,
  ResourceTiming,
  DEFAULT_METRIC_THRESHOLDS
} from '../shared/interfaces/performance-metrics.interface';

interface PerformanceEntryWithStart extends PerformanceEntry {
  processingStart?: number;
  startTime: number;
}

interface LayoutShiftEntry extends PerformanceEntry {
  hadRecentInput: boolean;
  value: number;
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private metricsSubject = new BehaviorSubject<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    navigationTiming: null,
    resourceTiming: []
  });

  constructor() {
    this.initPerformanceObserver();
    this.initNavigationTiming();
    this.initResourceTiming();
  }

  getMetrics(): Observable<PerformanceMetrics> {
    return this.metricsSubject.asObservable();
  }

  private initPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      // Observe LCP
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntryWithStart;
          this.updateMetric('lcp', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP observation not supported', e);
      }

      // Observe FID
      try {
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const firstEntry = entries[0] as PerformanceEntryWithStart;
          if (firstEntry.processingStart) {
            this.updateMetric('fid', firstEntry.processingStart - firstEntry.startTime);
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID observation not supported', e);
      }

      // Observe CLS
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            const layoutShift = entry as LayoutShiftEntry;
            if (!layoutShift.hadRecentInput) {
              clsValue += layoutShift.value;
              this.updateMetric('cls', clsValue);
            }
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS observation not supported', e);
      }

      // Observe FCP
      try {
        const fcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const firstEntry = entries[0] as PerformanceEntryWithStart;
          this.updateMetric('fcp', firstEntry.startTime);
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
      } catch (e) {
        console.warn('FCP observation not supported', e);
      }
    }
  }

  private initNavigationTiming(): void {
    if ('performance' in window) {
      const entries = performance.getEntriesByType('navigation');
      if (entries.length > 0) {
        const navigation = entries[0] as PerformanceNavigationTiming;
        const timing: NavigationTiming = {
          dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcpConnection: navigation.connectEnd - navigation.connectStart,
          tlsNegotiation: navigation.secureConnectionStart > 0 ? 
            navigation.connectEnd - navigation.secureConnectionStart : 0,
          serverResponse: navigation.responseStart - navigation.requestStart,
          domLoad: navigation.domContentLoadedEventEnd - navigation.responseEnd,
          windowLoad: navigation.loadEventEnd - navigation.responseEnd
        };
        this.updateNavigationTiming(timing);
      }
    }
  }

  private initResourceTiming(): void {
    if ('performance' in window) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const resourceTimings: ResourceTiming[] = resources.map(entry => ({
        name: entry.name,
        duration: entry.duration,
        transferSize: entry.transferSize,
        initiatorType: entry.initiatorType
      }));
      this.updateResourceTiming(resourceTimings);
    }
  }

  private updateMetric(name: keyof PerformanceMetrics, value: number): void {
    const currentMetrics = this.metricsSubject.value;
    this.metricsSubject.next({
      ...currentMetrics,
      [name]: value
    });
  }

  private updateNavigationTiming(timing: NavigationTiming): void {
    const currentMetrics = this.metricsSubject.value;
    this.metricsSubject.next({
      ...currentMetrics,
      navigationTiming: timing
    });
  }

  private updateResourceTiming(timings: ResourceTiming[]): void {
    const currentMetrics = this.metricsSubject.value;
    this.metricsSubject.next({
      ...currentMetrics,
      resourceTiming: timings
    });
  }
}
