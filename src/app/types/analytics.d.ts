declare function gtag(command: string, event: string, params: any): void;
declare function clarity(command: string, event: string, params: any): void;
declare function fbq(command: string, event: string, params: any): void;

interface Window {
  gtag?: typeof gtag;
  clarity?: typeof clarity;
  fbq?: typeof fbq;
}
