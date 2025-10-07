import { TestBed } from '@angular/core/testing';

import { BookTicketsService } from './book-tickets.service';

describe('BookTicketsService', () => {
  let service: BookTicketsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookTicketsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
