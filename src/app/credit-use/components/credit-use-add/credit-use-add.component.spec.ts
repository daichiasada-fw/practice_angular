import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditUseAddComponent } from './credit-use-add.component';

describe('CreditUseAddComponent', () => {
  let component: CreditUseAddComponent;
  let fixture: ComponentFixture<CreditUseAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreditUseAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditUseAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
