import { Component, OnInit, HostListener, NgZone, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd, NavigationStart, NavigationCancel, NavigationError } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { ThemeToggleComponent } from './theme-toggle/theme-toggle.component';
import { filter } from 'rxjs/operators';
import { LoadingService } from './services/loading.service';
import { LoadingContainerComponent } from './shared/components/loading-container/loading-container.component';
import { ComingSoonComponent } from './pages/coming-soon/coming-soon.component';


@Component({
    selector: 'app-root',
    imports: [
        CommonModule,
        RouterModule,
        NavbarComponent,
        FooterComponent,
        ThemeToggleComponent,
        LoadingContainerComponent,
        ComingSoonComponent
    ],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Naz Rice Mills';
  assetsLoaded = false;
  navigationInProgress = false;
  initialLoadTimerComplete = false;
  isInitialLoad = true;

  constructor(
    private router: Router,
    private loadingService: LoadingService,
    private ngZone: NgZone,
    private renderer: Renderer2
  ) {

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      gtag('config', 'G-BX5XYN8S6T', {
        page_path: event.urlAfterRedirects
      });
    });
    
  }


  @HostListener('window:load')
  onLoad() {
    this.assetsLoaded = true;
    this.checkLoading();
  }

  ngOnInit() {
    // Add loading class to body when component initializes
    this.renderer.addClass(document.body, 'page-loading');

    // Start the loader immediately
    this.loadingService.startGlobal('Loading...', 'grain');

    // Set a minimum display time for the loader (reduced to 1s for production initial paint)
    setTimeout(() => {
      this.initialLoadTimerComplete = true;
      this.checkLoading();
    }, 1000);

    // Track only above-the-fold images during Coming Soon phase for faster ready signal
    this.trackImageLoading(true);

    // Check if document is already loaded (for cached pages)
    if (document.readyState === 'complete') {
      setTimeout(() => {
        this.assetsLoaded = true;
        this.checkLoading();
      }, 1000);
    }

    // Show loader during navigation
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.navigationInProgress = true;
        this.assetsLoaded = false;
        
        if (!this.isInitialLoad) {
          this.loadingService.startGlobal('Loading...', 'grain');
        }
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.navigationInProgress = false;
        this.isInitialLoad = false;
        
        // After navigation completes, track images again
        this.trackImageLoading();
        
        // Only consider assets loaded if document is complete AND navigation is done
        if (document.readyState === 'complete') {
          setTimeout(() => {
            this.assetsLoaded = true;
            this.checkLoading();
          }, 500);
        }
      }
    });

    // Subscribe to router events and scroll to top on navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    });

    // Safety timeout to prevent loader from getting stuck (reduced)
    setTimeout(() => {
      this.loadingService.stopGlobal();
    }, 8000);

    // Subscribe to loading state changes
    this.loadingService.isLoadingById('global').subscribe(isLoading => {
      if (isLoading) {
        this.renderer.addClass(document.body, 'page-loading');
      } else {
        // When loading stops, remove the class and trigger animations
        this.renderer.removeClass(document.body, 'page-loading');
      }
    });
  }

  private trackImageLoading(onlyAboveTheFold: boolean = false) {
    setTimeout(() => {
      const selector = onlyAboveTheFold ? 'img[fetchpriority="high"], img[loading="eager"]' : 'img';
      const nodeList = document.querySelectorAll(selector);
      const images: HTMLImageElement[] = Array.from(nodeList).filter((el): el is HTMLImageElement => el instanceof HTMLImageElement);
      let loadedImages = 0;
      const totalImages = images.length;
      
      if (totalImages === 0) {
        this.ngZone.run(() => {
          this.assetsLoaded = true;
          this.checkLoading();
        });
        return;
      }
      
      images.forEach(img => {
        if (img.complete) {
          loadedImages++;
        } else {
          const loadHandler = () => {
            loadedImages++;
            
            if (loadedImages === totalImages) {
              this.ngZone.run(() => {
                this.assetsLoaded = true;
                this.checkLoading();
              });
            }
            
            img.removeEventListener('load', loadHandler);
            img.removeEventListener('error', errorHandler);
          };
          
          const errorHandler = () => {
            loadedImages++;
            
            if (loadedImages === totalImages) {
              this.ngZone.run(() => {
                this.assetsLoaded = true;
                this.checkLoading();
              });
            }
            
            img.removeEventListener('load', loadHandler);
            img.removeEventListener('error', errorHandler);
          };
          
          img.addEventListener('load', loadHandler);
          img.addEventListener('error', errorHandler);
        }
      });
      
      if (loadedImages === totalImages) {
        this.ngZone.run(() => {
          this.assetsLoaded = true;
          this.checkLoading();
        });
      }
    }, 100);
  }

  private checkLoading() {
    const shouldHideLoader = this.assetsLoaded && 
                            !this.navigationInProgress && 
                            (this.initialLoadTimerComplete || !this.isInitialLoad);
    
    if (shouldHideLoader) {
      // First prepare the page for animations by adding a transitioning class
      this.renderer.addClass(document.body, 'page-transitioning');
      
      // First stop the loader
      this.loadingService.stopGlobal();
      
      // Then wait before removing classes
      setTimeout(() => {
        this.renderer.removeClass(document.body, 'page-loading');
        
        // Wait longer before removing the transitioning class
        setTimeout(() => {
          this.renderer.removeClass(document.body, 'page-transitioning');
        }, 500);
      }, 300);
    }
  }
}
