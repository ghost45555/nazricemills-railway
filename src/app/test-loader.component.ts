import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-test-loader',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background-color: rgba(10, 26, 31, 0.9); z-index: 9999; 
                display: flex; align-items: center; justify-content: center;">
      <app-loading-spinner 
        variant="grain" 
        size="large"
        text="Testing Loader...">
      </app-loading-spinner>
    </div>
  `
})
export class TestLoaderComponent {} 