import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremiumImageComponent } from './premium-image.component';

describe('PremiumImageComponent', () => {
  let component: PremiumImageComponent;
  let fixture: ComponentFixture<PremiumImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremiumImageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PremiumImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
