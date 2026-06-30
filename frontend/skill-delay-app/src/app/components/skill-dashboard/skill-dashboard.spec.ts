import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillDashboard } from './skill-dashboard';

describe('SkillDashboard', () => {
  let component: SkillDashboard;
  let fixture: ComponentFixture<SkillDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
