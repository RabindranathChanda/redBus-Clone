import { Component, DebugElement, ElementRef, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { SearchBusResultComponent } from '../searchBus-result/searchBus-result.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '../models/bus/loadLocations/location.model';
import { ISearchBusResult, SearchBus } from '../models/bus/searchBus/search-bus.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocationsService } from '../services/bus/loadLocations/locations.service';
import { SearchBusService } from '../services/bus/searchBus/search-bus.service';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-search-bus-compact',
  standalone: true,
  imports: [SearchBusResultComponent, CommonModule, FormsModule],
  templateUrl: './search-bus-compact.component.html',
  styleUrl: './search-bus-compact.component.css'
})
export class SearchBusCompactComponent implements OnInit {
  activatedRoute = inject(ActivatedRoute);
  searchObj: SearchBus = new SearchBus();
  // scheduleObj: ISearchBusResult[] = [];

  fromLocation: string = '';
  location: Location[] = [];
  fromLocationId: number = 0;
  toLocation: string = '';
  toLocationId: number = 0;
  filteredFromLocations: any[] = [];
  filteredToLocations: any[] = [];
  showFromSuggestions: boolean = false;
  showToSuggestions: boolean = false;

  fromFocusedIndex: number = -1;
  toFocusedIndex: number = -1;
  focusedDateIndex: number = -1;

  calendarOpen = false; // Controls calendar visibility
  currentMonth: Date = new Date();
  formattedMonth: string = '';
  datesInMonth: (Date | null)[] = [];
  weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; // Starting with Sunday
  selectedDate: Date = new Date();
  initialMonth: Date = new Date();
  inputDate: string = '';
  today: Date = new Date();
  formattedDate: string = this.formatToYYYYMMDD(this.today);
  testDate: string = '';

  constructor(private locationsService: LocationsService) {
    // Fetch locations first
    this.locationsService.getLocationList().subscribe((locations: Location[]) => {
      this.location = locations;
    });
  }

  handleFromKeyDown(event: KeyboardEvent) {
    const maxIndex = this.filteredFromLocations.length - 1;

    if (event.key === 'ArrowDown') {
      this.fromFocusedIndex = this.fromFocusedIndex < maxIndex ? this.fromFocusedIndex + 1 : 0;
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      this.fromFocusedIndex = this.fromFocusedIndex > 0 ? this.fromFocusedIndex - 1 : maxIndex;
      event.preventDefault();
    } else if (event.key === 'Enter' && this.fromFocusedIndex >= 0) {
      this.selectFromLocation(this.filteredFromLocations[this.fromFocusedIndex]);
      event.preventDefault();
    }
  }

  handleToKeyDown(event: KeyboardEvent) {
    const maxIndex = this.filteredToLocations.length - 1;

    if (event.key === 'ArrowDown') {
      this.toFocusedIndex = this.toFocusedIndex < maxIndex ? this.toFocusedIndex + 1 : 0;
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      this.toFocusedIndex = this.toFocusedIndex > 0 ? this.toFocusedIndex - 1 : maxIndex;
      event.preventDefault();
    } else if (event.key === 'Enter' && this.toFocusedIndex >= 0) {
      this.selectToLocation(this.filteredToLocations[this.toFocusedIndex]);
      event.preventDefault();
    }
  }


  isSelectedDate(date: Date): boolean {
    const selected = this.selectedDate?.toDateString();
    const current = date.toDateString();
    const today = new Date().toDateString();

    return selected === current && current !== today;
  }
  router = inject(Router);
  ngOnInit() {
    // Reset to beginning of the month for accurate comparisons
    this.initialMonth.setDate(1);
    this.initialMonth.setHours(0, 0, 0, 0);
    this.currentMonth.setDate(1);
    this.currentMonth.setHours(0, 0, 0, 0);

    this.generateDatesInMonth();
    this.formattedMonth = this.getFormattedMonth();
    this.inputDate = this.formatDate(this.today);

    this.locationsService.getLocationList().subscribe(location => {
      this.location = location;
    });


    const searchData = JSON.parse(localStorage.getItem('searchData') || '{}');
    this.searchObj.fromLocationId = searchData.fromLocationId;
    this.searchObj.toLocationId = searchData.toLocationId;
    this.searchObj.travelDate = searchData.travelDate;

    if (searchData && searchData.fromLocation && searchData.toLocation) {
      // Use the data for your search results
      this.fromLocation = searchData.fromLocation;
      this.toLocation = searchData.toLocation;
      this.fromLocationId = searchData.fromLocationId;
      this.toLocationId = searchData.toLocationId;
      this.selectedDate = new Date(searchData.travelDate);

      // Now you can call your method to fetch the search results based on the searchData
    } else {
      this.router.navigateByUrl("/");
    }
  }

  // Method to filter locations based on input
  filterFromLocations() {
    if (this.fromLocation.length > 0) {
      this.filteredFromLocations = this.location.filter(location =>
        location.locationName.toLowerCase().includes(this.fromLocation.toLowerCase()) ||
        (location.locationSub && location.locationSub.toLowerCase().includes(this.fromLocation.toLowerCase()))
      );
      this.showFromSuggestions = true;

      this.fromFocusedIndex = -1; // Reset
      this.toFocusedIndex = -1;   // Reset

    } else {
      this.filteredFromLocations = [];
      this.showFromSuggestions = false;
    }
  }

  filterToLocations() {
    if (this.toLocation.length > 0) {
      this.filteredToLocations = this.location.filter(location =>
        location.locationName.toLowerCase().includes(this.toLocation.toLowerCase()) ||
        (location.locationSub && location.locationSub.toLowerCase().includes(this.toLocation.toLowerCase()))
      );
      this.showToSuggestions = true;

      this.fromFocusedIndex = -1; // Reset
      this.toFocusedIndex = -1;   // Reset

    } else {
      this.filteredToLocations = [];
      this.showToSuggestions = false;
    }
  }


  // Focus event handler (optional, if you want to perform any logic when input is focused)
  onFocusFromLocation() {
    this.showFromSuggestions = this.fromLocation.length > 0;
  }
  onFocusToLocation() {
    this.showToSuggestions = this.toLocation.length > 0;
  }

  // Blur event handler (optional, if you want to hide suggestions when input loses focus)
  onBlurFromLocation() {
    setTimeout(() => this.showFromSuggestions = false, 100);
  }
  onBlurToLocation() {
    setTimeout(() => this.showToSuggestions = false, 100);
  }
  // Method to select a location from the suggestions
  selectFromLocation(location: Location) {
    this.fromLocation = location.locationName; // Set the selected city
    this.fromLocationId = location.locationId;
    this.showFromSuggestions = false; // Hide suggestions after selection

    this.fromFocusedIndex = -1; // Reset
    this.toFocusedIndex = -1;   // Reset

  }
  selectToLocation(location: Location) {
    this.toLocation = location.locationName; // Set the selected city
    this.toLocationId = location.locationId;
    this.showToSuggestions = false; // Hide suggestions after selection

    this.fromFocusedIndex = -1; // Reset
    this.toFocusedIndex = -1;   // Reset

  }





  // Function to generate the month grid
  generateDatesInMonth() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    // Get the first and last day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Get the day of the week for the first day (Sunday = 0, Monday = 1, ..., Saturday = 6)
    const startDay = firstDay.getDay(); // Returns 0 for Sunday, 1 for Monday, etc.

    const days: (Date | null)[] = [];

    // Push empty values for padding the first week if necessary
    for (let i = 0; i < startDay; i++) {
      days.push(null); // Empty slot for the initial days of the previous month
    }

    // Push the actual days of the current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d)); // Add each date
    }

    this.datesInMonth = days;
  }

  // Get the formatted month string (e.g., "April")
  getFormattedMonth(): string {
    const options: Intl.DateTimeFormatOptions = { month: 'long' };
    return this.currentMonth.toLocaleDateString('en-US', options);
  }

  // Move to the next month
  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateDatesInMonth();
    this.formattedMonth = this.getFormattedMonth();
  }
  // Move to the previous month
  previousMonth() {
    const prev = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);

    // Prevent navigating before the initial month
    if (prev >= this.initialMonth) {
      this.currentMonth = prev;
      this.generateDatesInMonth();
      this.formattedMonth = this.getFormattedMonth();
    }
  }
  isAtInitialMonth(): boolean {
    return this.currentMonth.getMonth() === this.initialMonth.getMonth() &&
      this.currentMonth.getFullYear() === this.initialMonth.getFullYear();
  }

  isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }


  // Check if the given date is today's date
  isToday(date: Date): boolean {
    if (!date) return false;
    return date.getDate() === this.today.getDate() &&
      date.getMonth() === this.today.getMonth() &&
      date.getFullYear() === this.today.getFullYear();
  }

  // Helper function to safely extract day value from date
  getDateValue(date: Date | string): string {
    if (date instanceof Date) {
      return date.getDate().toString();
    }
    return ''; // Return an empty string for padding or non-date entries
  }

  // Function to select a date
  selectDate(date: Date) {
    if (this.isPastDate(date)) {
      return; // Don't do anything if it's a past date
    }

    this.selectedDate = date;
    this.inputDate = this.formatDate(date);
    this.formattedDate = this.formatToYYYYMMDD(this.selectedDate);
    this.calendarOpen = false; // Close calendar only if a valid date is picked
  }
  formatToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
    return date.toLocaleDateString('en-US', options);
  }

  // Add this function to your component
  getFormattedDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    return date.toLocaleDateString('en-US', options);
  }

  // Toggle the visibility of the calendar
  toggleCalendar() {
    this.calendarOpen = !this.calendarOpen;
    if (this.calendarOpen) {
      this.generateDatesInMonth();
      this.formattedMonth = this.getFormattedMonth();
    }
  }
  @ViewChild('calendarRef') calendarRef!: ElementRef;
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (
      this.calendarRef &&
      (this.calendarRef.nativeElement.contains(target) ||
        target.closest('.datePickerToggle'))
    ) {
      // Clicked inside language dropdown or toggle
    } else {
      this.calendarOpen = false;
    }
  }



  swapLocations(): void {
    const temp = this.fromLocation;
    this.fromLocation = this.toLocation;
    this.toLocation = temp;

    const tempId = this.searchObj.fromLocationId;
    this.searchObj.fromLocationId = this.searchObj.toLocationId;
    this.searchObj.toLocationId = tempId;
    console.log("searchObj: ", this.searchObj);
    console.log(this.fromLocation, this.toLocation);
  }

  // --------------------------------------------------------------
  showChild = true;
  againSearchBus() {
    // First, ensure IDs are correct based on location names
    const matchedFrom = this.location.find(loc => loc.locationName.toLowerCase() === this.fromLocation.toLowerCase())?.locationId;
    const matchedTo = this.location.find(loc => loc.locationName.toLowerCase() === this.toLocation.toLowerCase())?.locationId;

    if (!matchedFrom || !matchedTo) {
      alert('Invalid location entered.');
      return;
    }

    // If current IDs do not match the names, correct them
    if (this.fromLocationId !== matchedFrom) {
      this.fromLocationId = matchedFrom;
    }

    if (this.toLocationId !== matchedTo) {
      this.toLocationId = matchedTo;
    }

    // Now set the searchObj with updated values
    this.showChild = false;
    setTimeout(() => {
      this.searchObj = {
        fromLocation: this.fromLocation,
        fromLocationId: this.fromLocationId,
        toLocation: this.toLocation,
        toLocationId: this.toLocationId,
        travelDate: this.formatToYYYYMMDD(this.selectedDate)
      };
      localStorage.setItem('searchData', JSON.stringify(this.searchObj));
      this.showChild = true;
    }, 0);
  }






  // Dynamically Rendaring Images
  getOnBus: string = "/assets/images/get_on_bus.png";
  getOffBus: string = "/assets/images/get_off_bus.png";
  calendar: string = "/assets/images/calendar.png";
  urbanLocation: string = "/assets/images/urban.png";
  locationPin: string = "/assets/images/location.png";
}
