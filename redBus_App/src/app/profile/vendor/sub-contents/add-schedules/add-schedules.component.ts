import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, HostListener, inject, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { VendorAuthService } from '../../../../services/auth/User&Vendor/vendor-auth.service';
import { Bus, IBusScheduleDataForVendorSchedule, BusScheduleDataForVendorSchedule } from '../../../../models/bus/searchBus/search-bus.model';
import { Location } from '../../../../models/bus/loadLocations/location.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LocationsService } from '../../../../services/bus/loadLocations/locations.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-add-schedules',
  imports: [FormsModule, CommonModule],
  templateUrl: './add-schedules.component.html',
  styleUrl: './add-schedules.component.css'
})
export class AddSchedulesComponent {
  vendorAuth = inject(VendorAuthService);
  locationService = inject(LocationsService)
  route = inject(ActivatedRoute);
  router = inject(Router);
  toaster = inject(ToastrService);
  cdr = inject(ChangeDetectorRef);

  loaded = false;

  schedules: IBusScheduleDataForVendorSchedule[] = [];
  buses: Bus[] = [];
  paginatedSchedules: any = [];
  totalCount = 0;
  pageSize = 10;
  currentPage = 1;
  totalPages = 1;
  pages: number[] = [];

  vendorId = this.vendorAuth.getVendor().vendorId;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const page = +params['schPage'] || 1;
      this.loadSchedules(page);
    });

    this.setCurrentTime();


    forkJoin({
      buses: this.vendorAuth.getAllBusesByVendor(this.vendorId),
      locations: this.locationService.getLocationList()
    }).subscribe({
      next: ({ buses, locations }) => {
        this.buses = buses;
        this.location = locations;
        this.loaded = true;
      },
      error: (err) => {
        console.error('Error fetching buses schedule or locations', err);
      }
    });
  }


  handleBusesKeyDown(event: KeyboardEvent) {
    const maxIndex = this.buses.length - 1;

    if (event.key === 'ArrowDown') {
      this.busFocusedIndex = this.busFocusedIndex < maxIndex ? this.busFocusedIndex + 1 : 0;
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      this.busFocusedIndex = this.busFocusedIndex > 0 ? this.busFocusedIndex - 1 : maxIndex;
      event.preventDefault();
    } else if (event.key === 'Enter' && this.busFocusedIndex >= 0) {
      this.selectBus(this.buses[this.busFocusedIndex]);
      event.preventDefault();
    }
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

  handleStatusKeyDown(event: KeyboardEvent) {
    const maxIndex = this.statusSuggestions.length - 1;

    if (event.key === 'ArrowDown') {
      this.statusFocusedIndex = this.statusFocusedIndex < maxIndex ? this.statusFocusedIndex + 1 : 0;
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      this.statusFocusedIndex = this.statusFocusedIndex > 0 ? this.statusFocusedIndex - 1 : maxIndex;
      event.preventDefault();
    } else if (event.key === 'Enter' && this.statusFocusedIndex >= 0) {
      this.selectStatusSuggestion(this.statusSuggestions[this.statusFocusedIndex]);
      event.preventDefault();
    }
  }

  // Focus event handler (optional, if you want to perform any logic when input is focused)
  onFocusBuses() {
    this.showBusesSuggestions = this.buses.length > 0;
  }
  onFocusFromLocation() {
    this.showFromSuggestions = this.fromLocation.length > 0;
  }
  onFocusToLocation() {
    this.showToSuggestions = this.toLocation.length > 0;
  }
  onFocusStatus() {
    this.showStatus = true;
  }

  // Blur event handler (optional, if you want to hide suggestions when input loses focus)
  onBlurBuses() {
    setTimeout(() => this.showBusesSuggestions = false, 100);
  }
  onBlurFromLocation() {
    setTimeout(() => this.showFromSuggestions = false, 100);
  }
  onBlurToLocation() {
    setTimeout(() => this.showToSuggestions = false, 100);
  }
  onBlurStautsSuggestion() {
    setTimeout(() => this.showStatus = false, 100);
  }


  // Method to filter locations based on input
  filterBuses() {
    if (this.buses.length > 0) {
      this.filteredBuses = this.buses.filter(bus =>
        bus.busName.toLowerCase().includes(this.busName.toLowerCase()) ||
        (bus.busVehicleNo && bus.busVehicleNo.toLowerCase().includes(this.busName.toLowerCase()))
      );
      this.showBusesSuggestions = true;

      this.busFocusedIndex = -1; // Reset

    } else {
      this.filteredBuses = [];
      this.showBusesSuggestions = false;
    }
  }

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


  showStatus = false;
  selectedStatus = '';
  activateShowStatus() {
    this.showStatus = !this.showStatus;
  }




  departureDate: string = '';
  departureTime: string = '';
  arrivalDate: string = '';
  arrivalTime: string = '';

  scheduleToSubmit: BusScheduleDataForVendorSchedule = new BusScheduleDataForVendorSchedule();



  // Example conversion in component

  // Helper function
  formatForDatetimeLocal(datetime: string): string {
    const date = new Date(datetime);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }




  mergeDateAndTime(date: Date, time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = hours.toString().padStart(2, '0');
    const minute = minutes.toString().padStart(2, '0');

    return `${year}-${month}-${day}T${hour}:${minute}:00`; // Local ISO format
  }

  submitSchedule(form: NgForm) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      if (this.scheduleToSubmit.busId == null || this.scheduleToSubmit.busVehicleNo == null || this.scheduleToSubmit.pricePerSeat == 0) {
        this.toaster.warning('All fields are required and price should be greater than 0', 'Warning', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
        return;
      }
    }

    this.scheduleToSubmit.scheduleDate = new Date().toISOString().split('T')[0];
    this.scheduleToSubmit.vendorName = this.vendorAuth.getVendor().vendorName;
    this.scheduleToSubmit.departureDateTime = this.mergeDateAndTime(this.selectedDDate, this.departureTime);
    this.scheduleToSubmit.arrivalDateTime = this.mergeDateAndTime(this.selectedADate, this.arrivalTime);
    console.log('test Submitted:', this.scheduleToSubmit);



    // Call your API here to save the schedule

    this.vendorAuth.addNewSchedule(this.scheduleToSubmit).subscribe({
      next: (res) => {
        this.toaster.success(`${res.message}`, `${res.title}`, {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
        this.loadSchedules(this.currentPage);
        this.scheduleToSubmit = new BusScheduleDataForVendorSchedule();

        // Clear location, bus, and status inputs
        this.busName = this.fromLocation = this.toLocation = this.selectedStatus = this.departureTime = this.arrivalTime = this.departureDate = this.arrivalDate = '';

        // Reset date selectors
        this.selectedDDate = new Date();
        this.selectedADate = new Date();

        // Reset time pickers to current time
        this.setCurrentTime();

        // Reset dropdowns & UI controls
        this.showBusesSuggestions = false;
        this.showFromSuggestions = false;
        this.showToSuggestions = false;
        this.showStatus = false;

        this.busFocusedIndex = -1;
        this.fromFocusedIndex = -1;
        this.toFocusedIndex = -1;
        this.statusFocusedIndex = -1;

        this.deptCalendarOpen = false;
        this.arivCalendarOpen = false;

      },
      error: (err) => {
        this.toaster.warning(`${err.error.message}`, `${err.error.title}`, {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
      }
    })
  }




  loadSchedules(page: number) {
    this.vendorAuth.getSchedule(this.vendorId, page, this.pageSize).subscribe({
      next: (response) => {
        this.schedules = response.schedules;
        this.totalCount = response.totalCount;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

        // If current page is invalid (e.g., after deletion), go to previous valid page
        if (this.schedules.length === 0 && page > 1) {
          // Go to previous page and update query params
          this.goToPage(page - 1);
          return;
        }

        this.paginatedSchedules = this.schedules;
        this.currentPage = page;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  goToPage(schPage: number) {
    if (schPage < 1 || schPage > this.totalPages) return;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { schPage },
      queryParamsHandling: 'merge' // preserves other existing params
    });

    this.loadSchedules(schPage);
  }


  openDropdownId: number | null = null;

  toggleDropdown(scheduleId: number) {
    this.openDropdownId = this.openDropdownId === scheduleId ? null : scheduleId;
  }

  scheduleVisibility(schedule: any, visibility: string) {
    console.log('Inactivating schedule:', schedule);
    console.log('Visibility:', visibility);
    this.openDropdownId = null;
    this.vendorAuth.scheduleVisibility(schedule.scheduleId, visibility).subscribe({
      next: (response) => {
        this.loadSchedules(this.currentPage);
        this.toaster.success(`${response.message}`, 'Successfull', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
      },
      error: (error) => {
        this.toaster.warning(`${error.error.message}`, 'Warning', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
      }
    })
  }


  viewBookingDetails(schedule: any) {
    console.log('Viewing booking details:', schedule);
    this.openDropdownId = null;
  }


  deleteSchedule(scheduleId: number) {
    this.vendorAuth.deleteSchedule(scheduleId).subscribe({
      next: (response) => {
        this.toaster.success(`${response.message}`, `${response.title}`, {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
        this.loadSchedules(this.currentPage);
      },
      error: (error) => {
        this.toaster.warning(`${error.error.message}`, `${error.error.title}`, {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
      }
    })
  }







  @ViewChild('dCalendarRef') dCalendarRef!: ElementRef;
  @ViewChild('aCalendarRef') aCalendarRef!: ElementRef;
  @ViewChild('departureTimePickerRef') departureTimePickerRef!: ElementRef;
  @ViewChild('arrivalTimePickerRef') arrivalTimePickerRef!: ElementRef;
  @ViewChildren('dropdownWrapper') dropdownWrappers!: QueryList<ElementRef>; // for looped dropdowns
  @HostListener('document:click', ['$event'])
  handleGlobalClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    const clickInsideAny = [
      this.dCalendarRef,
      this.aCalendarRef,
      this.departureTimePickerRef,
      this.arrivalTimePickerRef,
      ...this.dropdownWrappers.toArray()
    ].some(ref => ref?.nativeElement?.contains(target));

    if (clickInsideAny) return;

    // Click was outside all tracked elements → close all
    this.deptCalendarOpen = false;
    this.arivCalendarOpen = false;
    this.showDepartureTimePicker = false;
    this.showArrivalTimePicker = false;
    this.openDropdownId = null;
  }
















  busName: string = '';
  fromLocation: string = '';
  location: Location[] = [];
  fromLocationId: number = 0;
  toLocation: string = '';
  toLocationId: number = 0;
  filteredBuses: any[] = [];
  filteredFromLocations: any[] = [];
  filteredToLocations: any[] = [];
  statusSuggestions: string[] = ['Active', 'Inactive'];
  showBusesSuggestions: boolean = false;
  showFromSuggestions: boolean = false;
  showToSuggestions: boolean = false;

  busFocusedIndex: number = -1;
  fromFocusedIndex: number = -1;
  toFocusedIndex: number = -1;
  statusFocusedIndex: number = -1;
  focusedDateIndex: number = -1;

  deptCalendarOpen = false; // Controls calendar visibility
  arivCalendarOpen = false; // Controls calendar visibility
  currentMonth: Date = new Date();
  formattedMonth: string = '';
  datesInMonth: (Date | null)[] = [];
  weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; // Starting with Sunday
  selectedDDate: Date = new Date();
  selectedADate: Date = new Date();
  initialMonth: Date = new Date();
  inputDate: string = '';
  today: Date = new Date();
  formattedDate: string = this.formatToYYYYMMDD(this.today);
  testDate: string = '';




  formatToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }


  selectBus(bus: Bus) {
    this.scheduleToSubmit.busId = bus.busId;
    this.scheduleToSubmit.busName = bus.busName;
    this.scheduleToSubmit.busType = bus.busType;
    this.scheduleToSubmit.busVehicleNo = bus.busVehicleNo;
    this.scheduleToSubmit.isAC = bus.isAC;
    this.scheduleToSubmit.totalSeats = bus.totalSeats;
    this.scheduleToSubmit.availableSeats = bus.totalSeats;
    this.scheduleToSubmit.vendorId = bus.vendorId;
    this.showBusesSuggestions = false; // Hide suggestions after selection

    this.busFocusedIndex = -1; // Reset

  }
  selectFromLocation(location: Location) {
    this.fromLocation = location.locationName; // Set the selected city
    this.fromLocationId = location.locationId;
    this.scheduleToSubmit.fromLocation = location.locationName;
    this.scheduleToSubmit.fromLocationId = location.locationId;
    this.showFromSuggestions = false; // Hide suggestions after selection

    this.fromFocusedIndex = -1; // Reset
    this.toFocusedIndex = -1;   // Reset

  }
  selectToLocation(location: Location) {
    this.toLocation = location.locationName; // Set the selected city
    this.toLocationId = location.locationId;
    this.scheduleToSubmit.toLocation = location.locationName;
    this.scheduleToSubmit.toLocationId = location.locationId;
    this.showToSuggestions = false; // Hide suggestions after selection

    this.fromFocusedIndex = -1; // Reset
    this.toFocusedIndex = -1;   // Reset

  }
  selectStatusSuggestion(status: string) {
    this.selectedStatus = status; // Set the selected city
    this.scheduleToSubmit.scheduleStatus = status;
    this.showStatus = false; // Hide suggestions after selection

    this.statusFocusedIndex = -1;   // Reset
  }

  previousMonth() {
    const prev = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);

    // Prevent navigating before the initial month
    if (prev >= this.initialMonth) {
      this.currentMonth = prev;
      this.generateDatesInMonth();
      this.formattedMonth = this.getFormattedMonth();
    }
  }

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

  // Add this function to your component
  getFormattedDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    return date.toLocaleDateString('en-US', options);
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

  isAtInitialMonth(): boolean {
    return this.currentMonth.getMonth() === this.initialMonth.getMonth() &&
      this.currentMonth.getFullYear() === this.initialMonth.getFullYear();
  }

  isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }



  isSelectedDDate(date: Date): boolean {
    const selected = this.selectedDDate?.toDateString();
    const current = date.toDateString();
    const today = new Date().toDateString();
    return selected === current && current !== today;
  }

  isSelectedADate(date: Date): boolean {
    const selected = this.selectedADate?.toDateString();
    const current = date.toDateString();
    const today = new Date().toDateString();

    return selected === current && current !== today;
  }

  // Check if the given date is today's date
  isToday(date: Date): boolean {
    if (!date) return false;
    return date.getDate() === this.today.getDate() &&
      date.getMonth() === this.today.getMonth() &&
      date.getFullYear() === this.today.getFullYear();
  }
  // Function to select a date
  selectDDate(date: Date) {
    if (this.isPastDate(date)) {
      return; // Don't do anything if it's a past date
    }

    // this.departureTime = this.selectedDDate.getHours().toString().padStart(2, '0') + ':' + this.selectedDDate.getMinutes().toString().padStart(2, '0');
    this.selectedDDate = date;
    this.inputDate = this.formatDate(date);
    this.formattedDate = this.formatToYYYYMMDD(this.selectedDDate);
    this.deptCalendarOpen = false; // Close calendar only if a valid date is picked


  }
  selectADate(date: Date) {
    if (this.isPastDate(date)) {
      return; // Don't do anything if it's a past date
    }


    // this.arrivalTime = this.selectedADate.getHours().toString().padStart(2, '0') + ':' + this.selectedADate.getMinutes().toString().padStart(2, '0');
    this.selectedADate = date;
    this.inputDate = this.formatDate(date);
    this.formattedDate = this.formatToYYYYMMDD(this.selectedADate);
    this.arivCalendarOpen = false; // Close calendar only if a valid date is picked
  }
  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
    return date.toLocaleDateString('en-US', options);
  }

  // Helper function to safely extract day value from date
  getDateValue(date: Date | string): string {
    if (date instanceof Date) {
      return date.getDate().toString();
    }
    return ''; // Return an empty string for padding or non-date entries
  }



  // Toggle the visibility of the calendar
  toggleDeptCalendar() {
    this.deptCalendarOpen = !this.deptCalendarOpen;
    if (this.deptCalendarOpen) {
      this.generateDatesInMonth();
      this.formattedMonth = this.getFormattedMonth();
    }
  }
  toggleArivCalendar() {
    this.arivCalendarOpen = !this.arivCalendarOpen;
    if (this.arivCalendarOpen) {
      this.generateDatesInMonth();
      this.formattedMonth = this.getFormattedMonth();
    }
  }


  showDepartureTimePicker = false;
  showArrivalTimePicker = false;

  dHour: number = 2;
  dMinute: number = 15;
  dMeridian: 'AM' | 'PM' = 'PM';

  hour: number = 2;
  minute: number = 15;
  meridian: 'AM' | 'PM' = 'PM';

  get displayDHour(): string {
    return this.dHour.toString().padStart(2, '0');
  }
  get displayAHour(): string {
    return this.hour.toString().padStart(2, '0');
  }

  increaseDHour() {
    this.dHour = this.dHour === 12 ? 1 : this.dHour + 1;
    this.updateDepartureTimeFromPicker();
  }

  decreaseDHour() {
    this.dHour = this.dHour === 1 ? 12 : this.dHour - 1;
    this.updateDepartureTimeFromPicker();
  }

  increaseDMinute() {
    this.dMinute = (this.dMinute + 1) % 60;
    this.updateDepartureTimeFromPicker();
  }

  decreaseDMinute() {
    this.dMinute = this.dMinute === 0 ? 59 : this.dMinute - 1;
    this.updateDepartureTimeFromPicker();
  }

  toggleDMeridian() {
    this.dMeridian = this.dMeridian === 'AM' ? 'PM' : 'AM';
    this.updateDepartureTimeFromPicker();
  }

  increaseAHour() {
    this.hour = this.hour === 12 ? 1 : this.hour + 1;
    this.updateArrivalTimeFromPicker();
  }

  decreaseAHour() {
    this.hour = this.hour === 1 ? 12 : this.hour - 1;
    this.updateArrivalTimeFromPicker();
  }

  increaseAMinute() {
    this.minute = (this.minute + 1) % 60;
    this.updateArrivalTimeFromPicker();
  }

  decreaseAMinute() {
    this.minute = this.minute === 0 ? 59 : this.minute - 1;
    this.updateArrivalTimeFromPicker();
  }

  toggleAMeridian() {
    this.meridian = this.meridian === 'AM' ? 'PM' : 'AM';
    this.updateArrivalTimeFromPicker();
  }

  setCurrentTime() {
    const now = new Date();
    this.dHour = now.getHours(); // 0 - 23
    this.hour = now.getHours(); // 0 - 23
    this.dMinute = now.getMinutes();
    this.minute = now.getMinutes();

    this.dMeridian = this.hour >= 12 ? 'PM' : 'AM';
    this.meridian = this.hour >= 12 ? 'PM' : 'AM';

    // Convert 24hr to 12hr format
    this.hour = this.hour % 12;
    if (this.hour === 0) this.hour = 12;

    this.dHour = this.dHour % 12;
    if (this.dHour === 0) this.dHour = 12;

  }

  updateDepartureTimeFromPicker() {
    let hour24 = this.dMeridian === 'PM' ? (this.dHour % 12 + 12) : this.dHour % 12;
    let paddedHour = hour24.toString().padStart(2, '0');
    let paddedMinute = this.dMinute.toString().padStart(2, '0');

    this.departureTime = `${paddedHour}:${paddedMinute}`;
  }
  updateArrivalTimeFromPicker() {
    let hour24 = this.meridian === 'PM' ? (this.hour % 12 + 12) : this.hour % 12;
    let paddedHour = hour24.toString().padStart(2, '0');
    let paddedMinute = this.minute.toString().padStart(2, '0');

    this.arrivalTime = `${paddedHour}:${paddedMinute}`;
  }

  onDepartureTimeInputChange() {
    if (!this.departureTime) return;

    // Example: departureTime = "14:30"
    const [hoursStr, minutesStr] = this.departureTime.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    let meridian: 'AM' | 'PM' = 'AM';
    if (hours >= 12) {
      meridian = 'PM';
      if (hours > 12) hours -= 12;
    } else if (hours === 0) {
      hours = 12;
    }

    this.dHour = hours;
    this.dMinute = minutes;
    this.dMeridian = meridian;

    // Optional: Update custom picker display immediately
    this.updateDepartureTimeFromPicker();
  }


  onArrivalTimeInputChange() {
    if (!this.arrivalTime) return;

    // Example: arrivalTime = "14:30"
    const [hoursStr, minutesStr] = this.arrivalTime.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    let meridian: 'AM' | 'PM' = 'AM';
    if (hours >= 12) {
      meridian = 'PM';
      if (hours > 12) hours -= 12;
    } else if (hours === 0) {
      hours = 12;
    }

    this.hour = hours;
    this.minute = minutes;
    this.meridian = meridian;

    // Optional: Update custom picker display immediately
    this.updateArrivalTimeFromPicker();
  }




  urbanLocation: string = "/assets/images/urban.png";
  locationPin: string = "/assets/images/location.png";
}
