import { TestBed } from '@angular/core/testing';

import { AdvSearchService } from './adv-search.service';

describe('AdvSearchService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AdvSearchService = TestBed.get(AdvSearchService);
    expect(service).toBeTruthy();
  });
});
