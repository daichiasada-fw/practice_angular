import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditUseMonthAddComponent } from './credit-use-month-add.component';

describe('CreditUseMonthAddComponent', () => {
  let component: CreditUseMonthAddComponent;
  let fixture: ComponentFixture<CreditUseMonthAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreditUseMonthAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditUseMonthAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
