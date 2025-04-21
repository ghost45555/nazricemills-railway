import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceMonitorComponent } from './performance-monitor.component';

describe('PerformanceMonitorComponent', () => {
  let component: PerformanceMonitorComponent;
  let fixture: ComponentFixture<PerformanceMonitorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerformanceMonitorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerformanceMonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
