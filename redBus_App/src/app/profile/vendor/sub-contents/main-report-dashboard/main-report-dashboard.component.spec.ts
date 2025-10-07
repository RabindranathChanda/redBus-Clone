import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainReportDashboardComponent } from './main-report-dashboard.component';

describe('MainReportDashboardComponent', () => {
  let component: MainReportDashboardComponent;
  let fixture: ComponentFixture<MainReportDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainReportDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainReportDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
