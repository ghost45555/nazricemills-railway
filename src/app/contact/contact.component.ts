import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SectionHeaderComponent } from '../shared/components/section-header/section-header.component';
import { PremiumButtonComponent } from '../shared/components/premium-button/premium-button.component';
import { siteConfig } from '../config/site.config';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
    selector: 'app-contact',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        SectionHeaderComponent,
        PremiumButtonComponent
    ],
    templateUrl: './contact.component.html',
    styleUrl: './contact.component.css',
    animations: [
        trigger('fadeInUp', [
            state('void', style({
                opacity: 0,
                transform: 'translateY(20px)'
            })),
            transition(':enter', [
                animate('0.6s ease-out', style({
                    opacity: 1,
                    transform: 'translateY(0)'
                }))
            ])
        ])
    ]
})
export class ContactComponent {
  contactInfo = siteConfig.contact;
}
