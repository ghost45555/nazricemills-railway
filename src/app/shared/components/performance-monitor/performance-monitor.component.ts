import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PerformanceService } from '../../../services/performance.service';
import { PremiumCardComponent } from '../premium-card/premium-card.component';
import {
  MetricDisplay,
  NavigationTiming,
  ResourceTiming,
  MetricStatus,
  getMetricDefinition,
  getMetricStatus,
  formatMetricValue,
  formatBytes,
  DEFAULT_METRIC_THRESHOLDS
} from '../../interfaces/performance-metrics.interface';

@Component({
    selector: 'app-performance-monitor',
    imports: [CommonModule, PremiumCardComponent],
    templateUrl: './performance-monitor.component.html',
    styleUrls: ['./performance-monitor.component.css']
})
export class PerformanceMonitorComponent implements OnInit, OnDestroy {
  @Input() showDetails = false;
  @Input() position: 'fixed' | 'static' = 'fixed';
  @Input() theme: 'light' | 'dark' = 'light';

  metrics: MetricDisplay[] = [];
  navigationTiming: NavigationTiming | null = null;
  resourceTiming: ResourceTiming[] = [];
  private subscription?: Subscription;

  readonly metricKeys = ['lcp', 'fid', 'cls', 'fcp', 'ttfb'];

  constructor(private performanceService: PerformanceService) {}

  ngOnInit(): void {
    this.subscription = this.performanceService.getMetrics().subscribe(metrics => {
      this.metrics = this.metricKeys
        .map(key => ({
          ...getMetricDefinition(key),
          value: metrics[key as keyof typeof metrics] as number | null
        }));

      this.navigationTiming = metrics.navigationTiming;
      this.resourceTiming = metrics.resourceTiming;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  getMetricStatus(metric: MetricDisplay): MetricStatus {
    return getMetricStatus(metric.value, metric.threshold);
  }

  formatValue(value: number | null, unit: string): string {
    return formatMetricValue(value, unit);
  }

  getResourceTimingStats(): { totalSize: number; totalDuration: number; count: number } {
    return this.resourceTiming.reduce((acc, resource) => ({
      totalSize: acc.totalSize + (resource.transferSize || 0),
      totalDuration: acc.totalDuration + resource.duration,
      count: acc.count + 1
    }), { totalSize: 0, totalDuration: 0, count: 0 });
  }

  formatBytes(bytes: number): string {
    return formatBytes(bytes);
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  formatTimingKey(key: string): string {
    return key.replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  getThresholdPercentage(value: number | null, threshold: number): string {
    if (value === null) return '0%';
    return `${Math.min((value / threshold) * 100, 100)}%`;
  }

  getCoreWebVitals(): MetricDisplay[] {
    return this.metrics.slice(0, 3);
  }

  getOtherMetrics(): MetricDisplay[] {
    return this.metrics.slice(3);
  }

  getStatusColor(status: MetricStatus): string {
    switch (status) {
      case 'good':
        return '#34A853';
      case 'needs-improvement':
        return '#FBBC05';
      case 'poor':
        return '#EA4335';
      default:
        return '#9AA0A6';
    }
  }

  getStatusLabel(status: MetricStatus): string {
    switch (status) {
      case 'good':
        return 'Good';
      case 'needs-improvement':
        return 'Needs Improvement';
      case 'poor':
        return 'Poor';
      default:
        return 'Unknown';
    }
  }
}
