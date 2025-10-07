import { Component, HostListener, inject, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MyBookingsService } from '../../../../services/bus/myBookings/my-bookings.service';
import { BusBookingPassenger, MyBookings } from '../../../../models/bus/myBookings/my-bookings.model';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-bookings',
  imports: [FormsModule, CommonModule],
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.css'
})
export class MyBookingsComponent {
  myBookingService = inject(MyBookingsService);
  toaster = inject(ToastrService);
  router = inject(Router);

  activeTab: 'upcoming' | 'completed' | 'cancelled' = 'upcoming';
  selectedBooking: MyBookings | null = null;
  fullTicketMenuOpen: boolean = false;
  showEditPanel: boolean = false;
  selectAllChecked: boolean = false;
  consentCheckBox: boolean = false;
  myBookings: MyBookings[] = [];
  upcomingBookings: any[] = [];
  completedBookings: any[] = [];
  canclledBooking: any[] = [];
  userJson = sessionStorage.getItem('user');
  userIdFromSession: number = 0;


  ngOnInit() {
    this.getSessionData();
    this.fetchBookingsData(this.userIdFromSession);
  }

  userLogin(): boolean {
    return sessionStorage.getItem('isUserLoggedIn') === 'true';
  }

  getSessionData() {
    if (this.userLogin()) {
      this.userJson = sessionStorage.getItem('user');
      if (this.userJson) {
        this.userIdFromSession = JSON.parse(this.userJson).userId;
      }
    }
  }

  fetchBookingsData(userId: number) {
    this.myBookingService.getUserBookings(userId).subscribe({
      next: (res) => {
        this.myBookings = res;
        // this.filteredBookingData();
        this.filterBookingsWithCancelledPassengers();
      },
      error: (err) => {

      }
    });
  }

  filterBookingsWithCancelledPassengers() {
    const today = new Date();

    // Sort myBookings by bookingDateTime in descending order
    this.myBookings.sort((a, b) => {
      const dateA = new Date(a.bookingDate).getTime();
      const dateB = new Date(b.bookingDate).getTime();
      return dateB - dateA; // Latest first
    });

    // Reset arrays
    this.upcomingBookings = [];
    this.completedBookings = [];
    this.canclledBooking = [];

    this.myBookings.forEach(booking => {
      const arrivalDate = new Date(booking.busSchedule.arrivalDateTime);
      const diffInMs = today.getTime() - arrivalDate.getTime();
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

      const passengers = booking.busBookingPassengers;
      const cancelledPassengers = passengers.filter(p => p.bookingStatus.toLowerCase() === 'cancelled');
      const activePassengers = passengers.filter(p => p.bookingStatus.toLowerCase() !== 'cancelled');

      if (diffInDays > 2) {
        this.completedBookings.push(booking);
      } else {
        if (activePassengers.length > 0) {
          this.upcomingBookings.push(booking);
        }
      }

      if (cancelledPassengers.length > 0) {
        this.canclledBooking.push({
          ...booking,
          busBookingPassengers: cancelledPassengers
        });
      }
    });
  }

  BookNewTicket() {
    this.router.navigate(['/']);
  }



  setActiveTab(tab: 'upcoming' | 'completed' | 'cancelled') {
    this.activeTab = tab;
  }

  get displayedBookings() {
    switch (this.activeTab) {
      case 'upcoming':
        return this.upcomingBookings;
      case 'completed':
        return this.completedBookings;
      case 'cancelled':
        return this.canclledBooking;
      default:
        return [];
    }
  }



  cancelBooking(bookingId: number) {
    const booking = this.myBookings.find(b => b.bookingId === bookingId);
    if (booking) {
      this.selectAllChecked = false;
      this.consentCheckBox = false;
      this.selectedBooking = booking;
      this.showEditPanel = true;
    }
  }

  downloadTicket(bookingId: number) {
    console.log('Download Ticket:', bookingId);
  }


  openedBookingMenuIndex: number | null = null;
  openedPassengerMenuIndex: string | null = null;

  toggleBookingMenu(index: number, event: Event): void {
    event.stopPropagation();
    this.openedBookingMenuIndex = this.openedBookingMenuIndex === index ? null : index;
  }

  togglePassengerMenu(bookingId: number, passengerIndex: number, event: Event): void {
    event.stopPropagation();
    const key = `${bookingId}-${passengerIndex}`;
    this.openedPassengerMenuIndex = this.openedPassengerMenuIndex === key ? null : key;
  }

  // Optional: Close all menus when clicking outside
  @HostListener('document:click')
  closeMenus(): void {
    this.openedBookingMenuIndex = null;
    this.openedPassengerMenuIndex = null;
  }













  toggleSelectAll() {
    if (this.selectedBooking) {
      this.selectedBooking.busBookingPassengers
        .filter(p => p.bookingStatus.toLowerCase() !== 'cancelled')  // Only active passengers
        .forEach((p: BusBookingPassenger) => {
          p.selected = this.selectAllChecked;
        });
    }
  }

  updateSelectAllState() {
    if (this.selectedBooking) {
      const activePassengers = this.selectedBooking.busBookingPassengers
        .filter(p => p.bookingStatus.toLowerCase() !== 'cancelled'); // Only active passengers

      this.selectAllChecked = activePassengers.length > 0 && activePassengers.every(p => p.selected);
    }
  }


  get noPassengersSelected(): boolean {
    return !(this.selectedBooking?.busBookingPassengers.some(p => p.selected) && this.consentCheckBox);
  }

  totalAmount(): number {
    if (!this.selectedBooking) return 0;
    const selectedPassengers = this.selectedBooking.busBookingPassengers.filter(p => p.selected);
    return selectedPassengers.reduce((sum, p) => sum + p.price, 0);
  }

  extraCharges(): number {
    const total = this.totalAmount();
    const gst = total * 0.18; // 18%
    const refundFee = total * 0.05; // 5%
    return +(gst + refundFee).toFixed(2); // rounded to 2 decimal places
  }

  totalRefundableAmount(): number {
    const total = this.totalAmount();
    const charges = this.extraCharges();
    return +(total - charges).toFixed(2); // rounded to 2 decimal places
  }

  closeEditPanel() {
    if (this.selectedBooking) {
      this.selectedBooking.busBookingPassengers.forEach((p: BusBookingPassenger) => {
        p.selected = false;
      });
    }

    this.selectAllChecked = false;
    this.consentCheckBox = false;
    this.selectedBooking = null;
    this.showEditPanel = false;
  }


  confirmCancel() {
    const selectedPassengerIds = this.selectedBooking!.busBookingPassengers
      .filter((p: BusBookingPassenger) => p.selected)
      .map((p: BusBookingPassenger) => p.passengerId);

    if (selectedPassengerIds.length === 0) {
      return
    }

    this.myBookingService.cancelTickets(selectedPassengerIds).subscribe({
      next: (res) => {
        this.closeEditPanel();
        window.location.reload();
        this.toaster.success(`${res.message}`, 'Successfull', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
      },
      error: (err) => {
        this.toaster.error('Cannot cancel tickets at this moment. Retry later.', 'Error', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
      },
    });

  }

}
