import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { VendorAuthService } from '../../../../services/auth/User&Vendor/vendor-auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-all-bookings',
  imports: [FormsModule, CommonModule],
  templateUrl: './all-bookings.component.html',
  styleUrl: './all-bookings.component.css'
})
export class AllBookingsComponent {
  buses: any[] = [];
  bookings: any[] = [];
  passengers: any[] = [];
  selectedBusId = '';



  constructor(private vendorAuth: VendorAuthService) { }

  ngOnInit(): void {
    this.loadBuses();
  }

  loadBuses() {
    this.vendorAuth.getScheduleByID(this.vendorAuth.getVendor().vendorId)
      // this.vendorAuth.getScheduleByID(1)
      .subscribe((res: any) => {
        this.buses = res;
      });
  }

  exportSeatChart() {

  }

  getBookingDetails() {
    // Ensure it's a valid number
    const busId = parseInt(this.selectedBusId, 10);
    if (!isNaN(busId) && busId > 0) {
      this.vendorAuth.getBookingsByBusId(busId).subscribe((res: any) => {
        this.bookings = res || [];
        // Flatten passengers safely
        this.passengers = this.bookings.flatMap((booking: any) => booking.busBookingPassengers || []);
      });
    } else {
      this.passengers = [];
    }
  }





  selectedDate: Date = new Date();
  inputDate: string = '';
  calendarOpen = false;
  formattedMonth: string = '';
  currentMonth: Date = new Date();
  datesInMonth: (Date | null)[] = [];
  initialMonth: Date = new Date();
  weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; // Starting with Sunday
  today: Date = new Date();
  formattedDate: string = this.formatToYYYYMMDD(this.today);


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


  formatToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
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
    if (this.currentMonth.getMonth() >= this.initialMonth.getMonth() + 3)
      return;
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateDatesInMonth();
    this.formattedMonth = this.getFormattedMonth();
  }

  // Move to the previous month
  previousMonth() {
    const prev = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);

    // Compare only year & month
    const prevYear = prev.getFullYear();
    const prevMonth = prev.getMonth();
    const initialYear = this.initialMonth.getFullYear();
    const initialMonth = this.initialMonth.getMonth();

    if (prevYear > initialYear || (prevYear === initialYear && prevMonth >= initialMonth)) {
      this.currentMonth = prev;
      this.generateDatesInMonth();
      this.formattedMonth = this.getFormattedMonth();
    }
  }

  isAtInitialMonth(): boolean {
    return this.currentMonth.getMonth() === this.initialMonth.getMonth() &&
      this.currentMonth.getFullYear() === this.initialMonth.getFullYear();
  }
  isSelectedDate(date: Date): boolean {
    const selected = this.selectedDate?.toDateString();
    const current = date.toDateString();
    const today = new Date().toDateString();

    return selected === current && current !== today;
  }
  isToday(date: Date): boolean {
    if (!date) return false;
    return date.getDate() === this.today.getDate() &&
      date.getMonth() === this.today.getMonth() &&
      date.getFullYear() === this.today.getFullYear();
  }
  isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }
  selectDate(date: Date) {
    if (this.isPastDate(date)) {
      return; // Don't do anything if it's a past date
    }

    this.selectedDate = date;
    this.inputDate = this.formatDate(date);
    this.formattedDate = this.formatToYYYYMMDD(this.selectedDate);
    this.calendarOpen = false; // Close calendar only if a valid date is picked
  }

  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
    return date.toLocaleDateString('en-US', options);
  }
  getDateValue(date: Date | string): string {
    if (date instanceof Date) {
      return date.getDate().toString();
    }
    return ''; // Return an empty string for padding or non-date entries
  }


  // Dynamic Image Loading
  calendar: string = "/assets/images/calendar.png";

}
