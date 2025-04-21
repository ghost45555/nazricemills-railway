import { Injectable, Inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import {
  PageView,
  UserInteraction,
  ErrorEvent,
  AnalyticsEvent,
  UserSession,
  AnalyticsConfig,
  AnalyticsData,
  AnalyticsProvider
} from '../shared/interfaces/analytics.interface';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService implements AnalyticsProvider {
  private currentSession!: UserSession;
  private readonly config: AnalyticsConfig = {
    enablePageViews: true,
    enableUserInteractions: true,
    enableErrorTracking: true,
    enablePerformanceTracking: true,
    sampleRate: 100,
    excludePaths: ['/private', '/admin'],
    sessionTimeout: 30
  };

  constructor(
    private router: Router,
    @Inject('ANALYTICS_CONFIG') private analyticsConfig: Partial<AnalyticsConfig>
  ) {
    this.config = { ...this.config, ...analyticsConfig };
    this.initializeSession();
    this.setupRouterTracking();
  }

  private initializeSession(): void {
    this.currentSession = {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      pageViews: [],
      interactions: [],
      errors: [],
      events: [],
      userAgent: navigator.userAgent,
      deviceInfo: {
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        platform: navigator.platform,
        language: navigator.language
      }
    };
    this.persistSession();
  }

  private setupRouterTracking(): void {
    if (this.config.enablePageViews) {
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        this.trackPageView({
          path: event.urlAfterRedirects,
          title: document.title,
          timestamp: Date.now(),
          referrer: document.referrer
        });
      });
    }
  }

  trackPageView(pageView: PageView): void {
    if (this.shouldTrack(pageView.path)) {
      this.currentSession.pageViews.push(pageView);
      this.persistSession();
      this.sendToAnalytics('pageview', pageView);
    }
  }

  trackEvent(event: AnalyticsEvent): void {
    this.currentSession.events.push(event);
    this.persistSession();
    this.sendToAnalytics('event', event);
  }

  trackError(error: ErrorEvent): void {
    if (this.config.enableErrorTracking) {
      this.currentSession.errors.push(error);
      this.persistSession();
      this.sendToAnalytics('error', error);
    }
  }

  trackInteraction(interaction: UserInteraction): void {
    if (this.config.enableUserInteractions) {
      this.currentSession.interactions.push(interaction);
      this.persistSession();
      this.sendToAnalytics('interaction', interaction);
    }
  }

  startSession(): void {
    this.initializeSession();
  }

  endSession(): void {
    this.currentSession.endTime = Date.now();
    this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;
    this.persistSession();
    this.sendToAnalytics('session_end', this.currentSession);
  }

  async getAnalyticsData(): Promise<AnalyticsData> {
    const sessions = this.getAllSessions();
    return {
      sessions,
      totalUsers: this.calculateTotalUsers(sessions),
      totalSessions: sessions.length,
      averageSessionDuration: this.calculateAverageSessionDuration(sessions),
      bounceRate: this.calculateBounceRate(sessions),
      topPages: this.calculateTopPages(sessions),
      userEngagement: this.calculateUserEngagement(sessions),
      errors: this.calculateErrorStats(sessions),
      performance: await this.getPerformanceStats()
    };
  }

  private shouldTrack(path: string): boolean {
    if (!this.config.enablePageViews) return false;
    if (this.config.sampleRate < 100 && Math.random() * 100 > this.config.sampleRate) return false;
    return !this.config.excludePaths.some(excludePath => path.startsWith(excludePath));
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private persistSession(): void {
    try {
      const sessions = this.getAllSessions();
      const sessionIndex = sessions.findIndex(s => s.sessionId === this.currentSession.sessionId);
      
      if (sessionIndex >= 0) {
        sessions[sessionIndex] = this.currentSession;
      } else {
        sessions.push(this.currentSession);
      }

      localStorage.setItem('analytics_sessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Error persisting analytics session:', error);
    }
  }

  private getAllSessions(): UserSession[] {
    try {
      const sessionsJson = localStorage.getItem('analytics_sessions');
      return sessionsJson ? JSON.parse(sessionsJson) : [];
    } catch (error) {
      console.error('Error reading analytics sessions:', error);
      return [];
    }
  }

  private sendToAnalytics(eventType: string, data: any): void {
    // Send to Google Analytics if configured
    if (window.gtag) {
      window.gtag('event', eventType, data);
    }

    // Send to Microsoft Clarity if configured
    if (window.clarity) {
      window.clarity('track', eventType, data);
    }

    // Send to Facebook Pixel if configured
    if (window.fbq) {
      window.fbq('track', eventType, data);
    }
  }

  private calculateTotalUsers(sessions: UserSession[]): number {
    const uniqueUserAgents = new Set(sessions.map(s => s.userAgent));
    return uniqueUserAgents.size;
  }

  private calculateAverageSessionDuration(sessions: UserSession[]): number {
    const completedSessions = sessions.filter(s => s.duration);
    if (completedSessions.length === 0) return 0;
    const totalDuration = completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    return totalDuration / completedSessions.length;
  }

  private calculateBounceRate(sessions: UserSession[]): number {
    const bouncedSessions = sessions.filter(s => s.pageViews.length === 1);
    return (bouncedSessions.length / sessions.length) * 100;
  }

  private calculateTopPages(sessions: UserSession[]): Array<{ path: string; views: number; averageTime: number }> {
    const pageStats = new Map<string, { views: number; totalTime: number }>();

    sessions.forEach(session => {
      session.pageViews.forEach((pageView, index) => {
        const stats = pageStats.get(pageView.path) || { views: 0, totalTime: 0 };
        stats.views++;

        const nextPageView = session.pageViews[index + 1];
        if (nextPageView) {
          stats.totalTime += nextPageView.timestamp - pageView.timestamp;
        }

        pageStats.set(pageView.path, stats);
      });
    });

    return Array.from(pageStats.entries())
      .map(([path, stats]) => ({
        path,
        views: stats.views,
        averageTime: stats.totalTime / stats.views
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }

  private calculateUserEngagement(sessions: UserSession[]): {
    totalInteractions: number;
    interactionsPerSession: number;
    averageTimeOnPage: number;
  } {
    const totalInteractions = sessions.reduce((sum, s) => sum + s.interactions.length, 0);
    const interactionsPerSession = totalInteractions / sessions.length;

    let totalTimeOnPage = 0;
    let pageViewCount = 0;

    sessions.forEach(session => {
      session.pageViews.forEach((pageView, index) => {
        if (index < session.pageViews.length - 1) {
          totalTimeOnPage += session.pageViews[index + 1].timestamp - pageView.timestamp;
          pageViewCount++;
        }
      });
    });

    return {
      totalInteractions,
      interactionsPerSession,
      averageTimeOnPage: pageViewCount > 0 ? totalTimeOnPage / pageViewCount : 0
    };
  }

  private calculateErrorStats(sessions: UserSession[]): {
    total: number;
    uniqueErrors: number;
    topErrors: Array<{ message: string; count: number; lastOccurred: number }>;
  } {
    const errorMap = new Map<string, { count: number; lastOccurred: number }>();
    let total = 0;

    sessions.forEach(session => {
      session.errors.forEach(error => {
        total++;
        const stats = errorMap.get(error.message) || { count: 0, lastOccurred: 0 };
        stats.count++;
        stats.lastOccurred = Math.max(stats.lastOccurred, error.timestamp);
        errorMap.set(error.message, stats);
      });
    });

    const topErrors = Array.from(errorMap.entries())
      .map(([message, stats]) => ({
        message,
        count: stats.count,
        lastOccurred: stats.lastOccurred
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      total,
      uniqueErrors: errorMap.size,
      topErrors
    };
  }

  private async getPerformanceStats(): Promise<{
    averageLoadTime: number;
    averageFCP: number;
    averageLCP: number;
    averageCLS: number;
    averageFID: number;
  }> {
    if (!this.config.enablePerformanceTracking) {
      return {
        averageLoadTime: 0,
        averageFCP: 0,
        averageLCP: 0,
        averageCLS: 0,
        averageFID: 0
      };
    }

    return {
      averageLoadTime: performance.now(),
      averageFCP: 0,
      averageLCP: 0,
      averageCLS: 0,
      averageFID: 0
    };
  }
}
