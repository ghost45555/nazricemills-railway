import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremiumCardComponent } from './premium-card.component';

describe('PremiumCardComponent', () => {
  let component: PremiumCardComponent;
  let fixture: ComponentFixture<PremiumCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremiumCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PremiumCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
