import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditUseRefComponent } from './credit-use-ref.component';

describe('CreditUseRefComponent', () => {
  let component: CreditUseRefComponent;
  let fixture: ComponentFixture<CreditUseRefComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreditUseRefComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditUseRefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
