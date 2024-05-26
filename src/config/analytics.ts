declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

class AnalyticsService {
  private trackingId: string;

  constructor(trackingId: string) {
    this.trackingId = trackingId;
  }

  pageView(url: string) {
    if (window.gtag) {
      window.gtag('config', this.trackingId, {
        page_path: url,
      });
    }
  }

  event(action: string, parameters: Record<string, unknown>) {
    if (window.gtag) {
      window.gtag('event', action, parameters);
    }
  }
}

export const analytics = new AnalyticsService(import.meta.env.VITE_GOOGLE_MEASUREMENT_ID);