import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditUseDeleteComponent } from './credit-use-delete.component';

describe('CreditUseDeleteComponent', () => {
  let component: CreditUseDeleteComponent;
  let fixture: ComponentFixture<CreditUseDeleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreditUseDeleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditUseDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
