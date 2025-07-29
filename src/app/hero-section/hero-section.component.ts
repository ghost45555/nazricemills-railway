import { Component, OnInit, PLATFORM_ID, Inject, OnDestroy, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { ThemeService } from '../services/theme.service';
import { map } from 'rxjs';
import { HeroComponent } from "../shared/components/hero/hero.component";

@Component({
    selector: 'app-hero-section',
    standalone: true,
    imports: [CommonModule, HeroComponent],
    templateUrl: './hero-section.component.html',
    styleUrls: ['./hero-section.component.css']
})
export class HeroSectionComponent {
 
}
