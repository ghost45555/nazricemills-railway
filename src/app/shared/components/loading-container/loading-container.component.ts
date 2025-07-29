import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { LoadingService } from '../../../services/loading.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
    selector: 'app-loading-container',
    standalone: true,
    imports: [CommonModule, LoadingSpinnerComponent],
    templateUrl: './loading-container.component.html',
    styleUrls: ['./loading-container.component.css']
})
export class LoadingContainerComponent implements OnInit, OnDestroy {
  @Input() loadingId!: string;
  @Input() spinnerVariant: 'circle' | 'dots' | 'pulse' | 'wave' | 'grain' = 'circle';
  @Input() spinnerSize: 'small' | 'medium' | 'large' = 'medium';
  @Input() spinnerColor?: string;
  @Input() overlay = false;
  @Input() blur = false;
  @Input() fullscreen = false;
  @Input() message?: string;
  @Input() textPosition: 'top' | 'bottom' | 'none' = 'bottom';
  @Input() minHeight?: string;
  @Input() backgroundColor?: string;
  
  isLoading = false;
  private subscription?: Subscription;

  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {
    if (!this.loadingId) {
      throw new Error('LoadingContainer requires a loadingId input');
    }

    this.subscription = this.loadingService
      .isLoadingById(this.loadingId)
      .subscribe(loading => {
        this.isLoading = loading;
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  get containerClasses(): string[] {
    return [
      'loading-container',
      this.isLoading ? 'loading-container--loading' : '',
      this.overlay ? 'loading-container--overlay' : '',
      this.blur ? 'loading-container--blur' : '',
      this.fullscreen ? 'loading-container--fullscreen' : ''
    ].filter(Boolean);
  }

  get containerStyles(): { [key: string]: string } {
    const styles: { [key: string]: string } = {};
    
    if (this.minHeight) {
      styles['min-height'] = this.minHeight;
    }
    
    if (this.backgroundColor && (this.overlay || this.fullscreen)) {
      styles['--container-background'] = this.backgroundColor;
    }

    return styles;
  }
}
