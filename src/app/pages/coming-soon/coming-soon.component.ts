import { Component } from '@angular/core';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [],
  template: `
    <section class="coming-soon" aria-labelledby="coming-soon-title">
      <div class="bg-texture" aria-hidden="true"></div>
      <div class="accent accent-top" aria-hidden="true"></div>
      <div class="accent accent-bottom" aria-hidden="true"></div>

      <div class="container">
        <div class="brand">
          <img src="assets/img/light-logo.svg" alt="Naz Rice Mills" class="logo light" fetchpriority="high" />
          <img src="assets/img/dark-logo.svg" alt="Naz Rice Mills" class="logo dark" fetchpriority="high" />
        </div>

        <div class="copy">
          <span class="eyebrow">Crafting Excellence</span>
          <h1 id="coming-soon-title" class="headline">
            A refined digital experience is <span class="gradient">coming soon</span>
          </h1>
          <p class="subhead">
            We are elevating our presence to mirror the heritage, precision, and premium quality behind every grain.
          </p>

          <div class="cta">
            <a href="/contact" class="btn btn-primary">Contact us</a>
            <a href="/home" class="btn btn-secondary">Explore site</a>
          </div>
        </div>

        <div class="meta" role="contentinfo">
          <div class="divider" aria-hidden="true"></div>
          <p class="small">© 2025 Naz Rice Mills • All Rights Reserved</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .coming-soon {
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-background);
      color: var(--color-text);
      isolation: isolate;
      padding: var(--spacing-16) var(--spacing-4);
    }

    /* Subtle brand accents using CSS-only radial gradients */
    .accent {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: -2;
    }
    .accent-top {
      background: radial-gradient(800px 400px at 15% 10%, rgba(212,175,55,0.10), transparent 60%);
    }
    .accent-bottom {
      background: radial-gradient(900px 500px at 85% 90%, rgba(27,77,62,0.10), transparent 60%);
    }

    /* Texture overlay (very light) */
    .bg-texture {
      position: absolute;
      inset: 0;
      background-image: url('/assets/img/patterns/luxury-pattern.png');
      background-repeat: repeat;
      opacity: 0.035;
      z-index: -1;
    }

    .container {
      width: 100%;
      max-width: 980px;
      margin: 0 auto;
      text-align: center;
    }

    .brand { margin-bottom: var(--spacing-12); }

    .logo { height: 64px; filter: drop-shadow(0 10px 20px var(--color-shadow)); }
    .logo.dark { display: none; }
    :host-context(.dark-theme) .logo.light { display: none; }
    :host-context(.dark-theme) .logo.dark { display: inline-block; }

    .copy { 
      display: grid;
      gap: var(--spacing-4);
      place-items: center;
      animation: fadeUp 700ms cubic-bezier(0.4,0,0.2,1) both;
    }

    .eyebrow {
      display: inline-block;
      font-family: var(--font-body);
      font-size: var(--font-size-sm);
      letter-spacing: 0.35em;
      text-transform: uppercase;
      color: var(--color-gold);
      opacity: 0.9;
    }

    .headline {
      font-family: var(--font-heading);
      font-size: clamp(2.5rem, 4.5vw, 4rem);
      font-weight: 600;
      line-height: 1.2;
      letter-spacing: -0.02em;
      margin: 0;
      max-width: 20ch;
    }
    .headline .gradient {
      background: linear-gradient(135deg, var(--color-green) 0%, var(--color-gold) 70%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      text-shadow: none;
    }

    .subhead {
      font-family: var(--font-body);
      font-size: var(--font-size-lg);
      color: var(--color-text-light);
      max-width: 60ch;
    }

    .cta {
      display: flex;
      gap: var(--spacing-3);
      margin-top: var(--spacing-2);
      flex-wrap: wrap;
      justify-content: center;
    }

    .meta { margin-top: var(--spacing-16); }
    .divider {
      height: 1px;
      width: min(460px, 80%);
      margin: 0 auto var(--spacing-4);
      background: linear-gradient(90deg, transparent, var(--color-border), transparent);
    }
    .small { color: var(--color-text-light); font-size: var(--font-size-sm); }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Dark theme adjustments */
    :host-context(.dark-theme) .accent-top { background: radial-gradient(800px 400px at 15% 10%, rgba(255,215,0,0.09), transparent 60%); }
    :host-context(.dark-theme) .accent-bottom { background: radial-gradient(900px 500px at 85% 90%, rgba(59,158,128,0.10), transparent 60%); }

    /* Respect reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .copy { animation: none; }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .brand { margin-bottom: var(--spacing-8); }
      .logo { height: 56px; }
      .cta { gap: var(--spacing-2); }
    }
  `]
})
export class ComingSoonComponent {}


