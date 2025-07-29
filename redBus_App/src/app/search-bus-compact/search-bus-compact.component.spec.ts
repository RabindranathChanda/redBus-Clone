import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchBusCompactComponent } from './search-bus-compact.component';

describe('SearchBusCompactComponent', () => {
  let component: SearchBusCompactComponent;
  let fixture: ComponentFixture<SearchBusCompactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBusCompactComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchBusCompactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
