import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchBusResultComponent } from './searchBus-result.component';

describe('SearchBusResultComponent', () => {
  let component: SearchBusResultComponent;
  let fixture: ComponentFixture<SearchBusResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBusResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchBusResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
