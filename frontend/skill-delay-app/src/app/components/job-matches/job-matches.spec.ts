import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobMatches } from './job-matches';

describe('JobMatches', () => {
  let component: JobMatches;
  let fixture: ComponentFixture<JobMatches>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobMatches]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobMatches);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
