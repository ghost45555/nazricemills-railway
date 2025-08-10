import { Component } from '@angular/core';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [],
  template: `
    <section class="coming-soon">
      <div class="container">
        <div class="content">
          <h1 class="headline">Something Amazing is Coming</h1>
          <p class="subhead">We're working hard to bring you something special. Stay tuned!</p>
          <div class="meta">
            <p class="copyright">© 2025 Naz Rice Mills • All Rights Reserved</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .coming-soon {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1B4D3E 0%, #957f36 100%);
      color: white;
      text-align: center;
      padding: 2rem;
    }

    .container {
      max-width: 800px;
      width: 100%;
    }

    .content {
      opacity: 0;
      animation: fadeIn 1.5s ease-out forwards;
    }

    .headline {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 700;
      margin-bottom: 1.5rem;
      text-shadow: 0 4px 8px rgba(0,0,0,0.3);
    }

    .subhead {
      font-size: clamp(1.1rem, 2.5vw, 1.5rem);
      margin-bottom: 3rem;
      opacity: 0.9;
      line-height: 1.6;
    }

    .meta {
      margin-top: 4rem;
    }

    .copyright {
      font-size: 0.9rem;
      opacity: 0.7;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .coming-soon {
        padding: 1rem;
      }
    }
  `]
})
export class ComingSoonComponent {}


