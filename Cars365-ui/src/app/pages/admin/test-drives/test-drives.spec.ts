import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestDrives } from './test-drives';

describe('TestDrives', () => {
  let component: TestDrives;
  let fixture: ComponentFixture<TestDrives>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestDrives]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestDrives);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
