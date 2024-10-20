import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditUseSearchComponent } from './credit-use-search.component';

describe('CreditUseSearchComponent', () => {
  let component: CreditUseSearchComponent;
  let fixture: ComponentFixture<CreditUseSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreditUseSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditUseSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
