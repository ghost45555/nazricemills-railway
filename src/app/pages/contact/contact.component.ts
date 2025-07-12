import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header.component';
import { PremiumCardComponent } from '../../shared/components/premium-card/premium-card.component';
import { PremiumButtonComponent } from '../../shared/components/premium-button/premium-button.component';
import { ScrollAnimationDirective } from '../../shared/directives/scroll-animation.directive';
import { HeroComponent } from "../../shared/components/hero/hero.component";
import { finalize } from 'rxjs/operators';
import { ContactService } from '../../services/contact.service';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { AnimatedIconComponent } from "../../shared/components/animated-icon/animated-icon.component";
import { siteConfig } from '../../config/site.config';

@Component({
    selector: 'app-contact',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        SectionHeaderComponent,
        PremiumCardComponent,
        PremiumButtonComponent,
        ScrollAnimationDirective,
        HeroComponent,
        ToastComponent,
        AnimatedIconComponent
    ],
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  contactInfo = siteConfig.contact;
  contactForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private toastService: ToastService
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.initializeAnimations();
  }

  private initForm() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern('^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$')]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  private initializeAnimations() {
    // Add any additional animation initialization if needed
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      
      this.contactService.submitContactForm(this.contactForm.value)
        .pipe(finalize(() => this.isSubmitting = false))
        .subscribe({
          next: () => {
            this.toastService.show('Message sent successfully!', 'success');
            this.contactForm.reset();
          },
          error: (error: unknown) => {
            let errorMessage = 'Failed to send message. Please try again.';
            if (error instanceof Error) {
              errorMessage = error.message;
            }
            this.toastService.show(errorMessage, 'error');
            console.error('Form submission error:', error);
          }
        });
    }
  }

  // Form getters
  get name() { return this.contactForm.get('name'); }
  get email() { return this.contactForm.get('email'); }
  get phone() { return this.contactForm.get('phone'); }
  get message() { return this.contactForm.get('message'); }
}
