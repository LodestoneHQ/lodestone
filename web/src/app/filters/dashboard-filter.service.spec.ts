import { TestBed } from '@angular/core/testing';

import { DashboardFilterService } from './dashboard-filter.service';

describe('DashboardFilterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DashboardFilterService = TestBed.get(DashboardFilterService);
    expect(service).toBeTruthy();
  });
});
