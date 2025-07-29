import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSchedulesComponent } from './add-schedules.component';

describe('AddSchedulesComponent', () => {
  let component: AddSchedulesComponent;
  let fixture: ComponentFixture<AddSchedulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSchedulesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSchedulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
