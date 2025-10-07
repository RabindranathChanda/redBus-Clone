import { TestBed } from '@angular/core/testing';

import { VendorAuthService } from './vendor-auth.service';

describe('VendorAuthService', () => {
  let service: VendorAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VendorAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
