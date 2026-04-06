import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareCars } from './compare-cars';

describe('CompareCars', () => {
  let component: CompareCars;
  let fixture: ComponentFixture<CompareCars>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompareCars]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompareCars);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
