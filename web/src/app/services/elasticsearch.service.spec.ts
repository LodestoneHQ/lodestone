import { TestBed } from '@angular/core/testing';

import { ElasticsearchService } from './elasticsearch.service';

describe('ElasticsearchService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ElasticsearchService = TestBed.get(ElasticsearchService);
    expect(service).toBeTruthy();
  });
});
