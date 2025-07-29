import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePaymentsComponent } from './manage-earnings.component';

describe('ManagePaymentsComponent', () => {
  let component: ManagePaymentsComponent;
  let fixture: ComponentFixture<ManagePaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagePaymentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagePaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
