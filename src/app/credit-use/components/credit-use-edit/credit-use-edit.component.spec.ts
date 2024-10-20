import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditUseEditComponent } from './credit-use-edit.component';

describe('CreditUseEditComponent', () => {
  let component: CreditUseEditComponent;
  let fixture: ComponentFixture<CreditUseEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreditUseEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditUseEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
