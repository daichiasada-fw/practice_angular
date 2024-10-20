import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditUseEditReturnAmountComponent } from './credit-use-edit-return-amount.component';

describe('CreditUseEditReturnAmountComponent', () => {
  let component: CreditUseEditReturnAmountComponent;
  let fixture: ComponentFixture<CreditUseEditReturnAmountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreditUseEditReturnAmountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditUseEditReturnAmountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
