import { TestBed } from '@angular/core/testing';

import { CreditUseService } from './credit-use.service';

describe('CreditUseService', () => {
  let service: CreditUseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreditUseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
