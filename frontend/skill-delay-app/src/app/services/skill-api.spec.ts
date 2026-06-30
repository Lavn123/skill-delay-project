import { TestBed } from '@angular/core/testing';

import { SkillApi } from './skill-api';

describe('SkillApi', () => {
  let service: SkillApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SkillApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
