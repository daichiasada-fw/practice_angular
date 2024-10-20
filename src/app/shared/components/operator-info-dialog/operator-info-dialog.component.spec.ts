import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorInfoDialogComponent } from './operator-info-dialog.component';

describe('OperatorInfoDialogComponent', () => {
  let component: OperatorInfoDialogComponent;
  let fixture: ComponentFixture<OperatorInfoDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperatorInfoDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatorInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
