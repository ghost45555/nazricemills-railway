import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremiumButtonComponent } from './premium-button.component';

describe('PremiumButtonComponent', () => {
  let component: PremiumButtonComponent;
  let fixture: ComponentFixture<PremiumButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremiumButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PremiumButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
