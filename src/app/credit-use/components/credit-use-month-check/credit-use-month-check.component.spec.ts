import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditUseMonthCheckComponent } from './credit-use-month-check.component';

describe('CreditUseMonthCheckComponent', () => {
  let component: CreditUseMonthCheckComponent;
  let fixture: ComponentFixture<CreditUseMonthCheckComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreditUseMonthCheckComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditUseMonthCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
