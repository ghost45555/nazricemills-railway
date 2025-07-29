import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSectionComponent } from '../../hero-section/hero-section.component';
import { AboutSectionComponent } from '../../about-section/about-section.component';
import { ProductsSectionComponent } from '../../products-section/products-section.component';
import { WhyChooseUsComponent } from '../../why-choose-us/why-choose-us.component';
import { TestimonialsComponent } from '../../testimonials/testimonials.component';
import { ContactComponent } from '../../contact/contact.component';
import { CertificationSectionComponent } from '../../certification-section/certification-section.component';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        CommonModule,
        HeroSectionComponent,
        AboutSectionComponent,
        CertificationSectionComponent,
        ProductsSectionComponent,
        WhyChooseUsComponent,
        TestimonialsComponent,
        ContactComponent
    ],
    template: `
    <main class="home-container">
      <section class="section hero-section">
        <app-hero-section></app-hero-section>
      </section>
      
      <section class="section about-section" id="about">
        <app-about-section></app-about-section>
      </section>
      
      
      <section class="section products-section" id="products">
        <app-products-section></app-products-section>
      </section>
      
      <section class="section why-choose-section" id="why-choose-us">
        <app-why-choose-us></app-why-choose-us>
      </section>

      <section class="section certification-section" id="certifications">
        <app-certification-section></app-certification-section>
      </section>
      
      <section class="section testimonials-section" id="testimonials">
        <app-testimonials></app-testimonials>
      </section>
      
      <section class="section contact-section" id="contact">
        <app-contact></app-contact>
      </section>
    </main>
  `,
    styles: [`
    .home-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      overflow-x: hidden;
      background-color: var(--color-background);
    }

    .section {
      width: 100%;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      z-index: 1;
    }

    .hero-section {
      padding: 0;
      /* Smart adaptive height for home page hero */
      min-height: max(100vh, 750px); /* Ensures minimum comfortable space */
      height: auto; /* Allow growth when needed */
    }

    .about-section {
      background: linear-gradient(to bottom, var(--color-background), var(--color-cream-dark));
    }

    .products-section {
      background: var(--color-cream);
    }

    .why-choose-section {
      background: linear-gradient(to bottom, var(--color-cream), var(--color-background));
    }

    .testimonials-section {
      background: var(--color-background);
    }

    .contact-section {
      background: linear-gradient(to bottom, var(--color-background), var(--color-cream-dark));
    }

    @media (max-width: 768px) {
      .section {
        min-height: auto;
        padding: 0rem 0;
      }

      .hero-section {
        min-height: 100vh;
        padding: 0;
      }
    }
  `]
})
export class HomeComponent {}
