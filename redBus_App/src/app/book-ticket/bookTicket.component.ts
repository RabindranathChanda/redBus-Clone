import { CommonModule } from '@angular/common';
import { Component, Inject, inject, ViewChild } from '@angular/core';
import { IScheduleData } from '../models/bus/searchBus/search-bus.model';
import { FormsModule, NgForm } from '@angular/forms';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { BookTicketsService } from '../services/bus/bookTickets/book-tickets.service';
import { BookTicket, BusBookingPassenger } from '../models/bus/bookTicket/book-ticket.model';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../models/auth/user.model';
import { ToastrService } from 'ngx-toastr';
import { UserAuthService } from '../services/auth/User&Vendor/user-auth.service';


@Component({
  selector: 'app-book-ticket',
  imports: [CommonModule, FormsModule, MatTooltipModule],
  templateUrl: './bookTicket.component.html',
  styleUrls: ['./bookTicket.component.css',]
})
export class BookTicketComponent {

  scheduleIdReceived: number = 0;
  bookTicketService = inject(BookTicketsService);
  scheduleDataReceived!: IScheduleData;
  totalPrice = 0;
  totalSelectedSeats: number = 0;
  pricePerSeat = 0;
  seats: string[][] = [];
  totalSeats: number = 0;
  bookedSeats: string[] = [];
  selectedSeats: string[] = [];
  passengerForms: BusBookingPassenger[] = [];
  cols = 4;
  rows = 10;
  steeringWheel = '';
  bookTicketobj: BookTicket = new BookTicket();

  loaded: boolean = false;



  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: number) {
    this.scheduleIdReceived = data;
  }

  getScheduleData(data: number) {
    this.bookTicketService.getSchedule(data).subscribe((res: IScheduleData) => {
      this.scheduleDataReceived = res;
      this.totalSeats = res.totalSeats;
      this.pricePerSeat = res.pricePerSeat;
    });
  }

  getBookedSeats(scheduleId: number) {
    this.bookTicketService.getBookedSeats(scheduleId).subscribe({
      next: (res: string[]) => {
        this.bookedSeats = res;

      },
      error: (err) => {
        console.error('Error loading booked seats', err);
      }
    });
  }


  ngOnInit() {
    // Dynamic Images ------------>
    this.steeringWheel = '../assets/images/steering-wheel.png';
    forkJoin({
      schedule: this.bookTicketService.getSchedule(this.scheduleIdReceived),
      booked: this.bookTicketService.getBookedSeats(this.scheduleIdReceived)
    }).subscribe({
      next: ({ schedule, booked }) => {
        this.scheduleDataReceived = schedule;
        this.totalSeats = schedule.totalSeats;
        this.pricePerSeat = schedule.pricePerSeat;
        this.bookedSeats = booked;

        this.generateSeats(); // Now safely generate seats
        this.loaded = true;
      },
      error: (err) => {
        console.error('Error loading schedule or booked seats:', err);
      }
    });
  }



  generateSeats() {
    this.seats = [];

    if (this.totalSeats <= 20) {
      this.cols = 2;
    } else if (this.totalSeats <= 30) {
      this.cols = 3;
    } else {
      this.cols = 4;
    }

    this.rows = Math.ceil(this.totalSeats / this.cols);

    for (let col = 0; col < this.cols; col++) {
      const column: string[] = [];

      for (let row = 0; row < this.rows; row++) {
        const seatLabel = this.getSeatLabel(col, row);
        if (col * this.rows + row >= this.totalSeats) break;

        // Check if this seat is booked
        if (this.bookedSeats.includes(seatLabel)) {
          column.push('booked');
        } else {
          column.push('available');
        }
      }

      this.seats.push(column);
    }
  }

  getSeatLabel(colIndex: number, rowIndex: number): string {
    const colLetter = String.fromCharCode(65 + colIndex); // A, B, C, ...
    const rowNumber = rowIndex + 1;
    return `${colLetter}${rowNumber}`;
  }


  toggleSeat(i: number, j: number) {
    const seatStatus = this.seats[i][j];
    const seatLabel = this.getSeatLabel(i, j);

    if (seatStatus === 'booked') return;

    if (seatStatus === 'selected') {
      this.seats[i][j] = 'available';
      this.selectedSeats = this.selectedSeats.filter(seat => seat !== seatLabel);
      this.passengerForms = this.passengerForms.filter(p => p.seatNo !== seatLabel);
      this.totalPrice -= this.pricePerSeat;
      this.totalSelectedSeats -= 1;
    } else {
      this.seats[i][j] = 'selected';
      this.totalPrice += this.pricePerSeat;
      this.totalSelectedSeats += 1;
      this.selectedSeats.push(seatLabel);
      this.passengerForms.push({
        passengerName: '',
        mobileNo: '',
        age: 0,
        gender: '',
        seatNo: seatLabel,
        price: this.pricePerSeat,
        bookingStatus: 'booked'
      });
    }
  }

  isFormInvalid(): boolean {
    return (
      !this.selectedSeats.length ||
      this.passengerForms.some(p =>
        !p.passengerName || p.passengerName.length < 2 ||
        !p.mobileNo || !/^\d{10}$/.test(p.mobileNo) ||
        !p.age || p.age < 1 || p.age > 120 ||
        !p.gender
      )
    );
  }

  getTooltipMessage(): string {
    if (!this.selectedSeats.length) return 'No seats selected.';
    if (this.passengerForms.some(p =>
      !p.passengerName || p.passengerName.length < 2 ||
      !p.mobileNo || !/^\d{10}$/.test(p.mobileNo) ||
      !p.age || p.age < 1 || p.age > 120 ||
      !p.gender
    )) return 'Please fill all passenger details correctly.';
    return '';
  }

  // userDataFromSession = new User();
  toaster = inject(ToastrService);
  router = inject(Router);
  userAuthService = inject(UserAuthService);
  userDataFromSession: User | null = null;

  submitForm() {
    if (this.isFormInvalid()) return;

    const userStr = sessionStorage.getItem('user');
    this.userDataFromSession = userStr ? JSON.parse(userStr) as User : null;

    if (this.userDataFromSession?.userId !== undefined) {
      this.bookTicketobj = {
        ...this.bookTicketobj,
        userId: this.userDataFromSession.userId,
        scheduleId: this.scheduleIdReceived,
        paymentStatus: "Confirmed",
        totalPrice: this.totalPrice,
        currentPrice: this.totalPrice,
        busBookingPassengers: this.passengerForms
      };

      this.userAuthService.refreshTokenRequest().subscribe({
        next: () => {
          this.bookTicketService.newBooking(this.bookTicketobj, { withCredentials: true })
            .subscribe({
              next: () => {
                this.toaster.success("Tickets Booked Successfully", "Booked", {
                  closeButton: true,
                  timeOut: 3000,
                  newestOnTop: true,
                  positionClass: 'toast-bottom-right',
                  progressBar: true,
                });
                this.dismiss();
              },
              error: (err) => {
                if (err.status === 401) {
                  this.toaster.error("Please login to book tickets", "Unauthorized");
                  this.dismiss();
                  this.router.navigate(['/user-login'], {
                    queryParams: { returnUrl: this.router.url }
                  });
                } else {
                  this.toaster.error("An error occurred while booking. Please try again.", "Error", {
                    closeButton: true,
                    timeOut: 3000,
                    newestOnTop: true,
                    positionClass: 'toast-bottom-right',
                    progressBar: true,
                  });
                  console.error(err);
                }
              }
            });
        },
        error: () => {
          this.toaster.error("Error Refreshing Token");
        }
      });

    } else {
      this.toaster.error("Please login to book tickets", "Unauthorized", {
        closeButton: true,
        timeOut: 3000,
        newestOnTop: true,
        positionClass: 'toast-bottom-right',
        progressBar: true,
      });
      this.dismiss();
      this.router.navigate(['/user-login'], {
        queryParams: { returnUrl: this.router.url }
      });
    }
  }

  private bottomSheetRefService = inject(MatBottomSheetRef<BookTicketComponent>);
  dismiss() {
    this.bottomSheetRefService.dismiss();
  }


}
