import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparisonDashboard } from './comparison-dashboard';

describe('ComparisonDashboard', () => {
  let component: ComparisonDashboard;
  let fixture: ComponentFixture<ComparisonDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComparisonDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComparisonDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
