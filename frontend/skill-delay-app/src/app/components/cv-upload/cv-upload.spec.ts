import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CvUpload } from './cv-upload';

describe('CvUpload', () => {
  let component: CvUpload;
  let fixture: ComponentFixture<CvUpload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CvUpload]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CvUpload);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
