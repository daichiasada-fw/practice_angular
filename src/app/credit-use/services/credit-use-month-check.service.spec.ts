import { TestBed } from '@angular/core/testing';

import { CreditUseMonthCheckService } from './credit-use-month-check.service';

describe('CreditUseMonthCheckService', () => {
  let service: CreditUseMonthCheckService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreditUseMonthCheckService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
