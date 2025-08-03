import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancingModal } from './financing-modal';

describe('FinancingModal', () => {
  let component: FinancingModal;
  let fixture: ComponentFixture<FinancingModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancingModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancingModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
