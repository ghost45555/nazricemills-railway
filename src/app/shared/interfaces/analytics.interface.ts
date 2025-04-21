export interface PageView {
  path: string;
  title: string;
  timestamp: number;
  referrer?: string;
  duration?: number;
}

export interface UserInteraction {
  type: 'click' | 'scroll' | 'form_submit' | 'error' | 'custom';
  element?: string;
  action?: string;
  label?: string;
  value?: number;
  timestamp: number;
  path: string;
}

export interface ErrorEvent {
  message: string;
  stack?: string;
  timestamp: number;
  path: string;
  componentName?: string;
}

export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  path: string;
}

export interface UserSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  pageViews: PageView[];
  interactions: UserInteraction[];
  errors: ErrorEvent[];
  events: AnalyticsEvent[];
  userAgent: string;
  deviceInfo: {
    screenResolution: string;
    viewport: string;
    platform: string;
    language: string;
  };
}

export interface AnalyticsConfig {
  enablePageViews: boolean;
  enableUserInteractions: boolean;
  enableErrorTracking: boolean;
  enablePerformanceTracking: boolean;
  sampleRate: number;
  excludePaths: string[];
  sessionTimeout: number; // in minutes
}

export interface AnalyticsData {
  sessions: UserSession[];
  totalUsers: number;
  totalSessions: number;
  averageSessionDuration: number;
  bounceRate: number;
  topPages: Array<{
    path: string;
    views: number;
    averageTime: number;
  }>;
  userEngagement: {
    totalInteractions: number;
    interactionsPerSession: number;
    averageTimeOnPage: number;
  };
  errors: {
    total: number;
    uniqueErrors: number;
    topErrors: Array<{
      message: string;
      count: number;
      lastOccurred: number;
    }>;
  };
  performance: {
    averageLoadTime: number;
    averageFCP: number;
    averageLCP: number;
    averageCLS: number;
    averageFID: number;
  };
}

export interface AnalyticsProvider {
  trackPageView(pageView: PageView): void;
  trackEvent(event: AnalyticsEvent): void;
  trackError(error: ErrorEvent): void;
  trackInteraction(interaction: UserInteraction): void;
  startSession(): void;
  endSession(): void;
  getAnalyticsData(): Promise<AnalyticsData>;
}
