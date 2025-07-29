import { Component } from '@angular/core';
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
  selectedBusId: number | null = null;

  constructor(private vendorAuth: VendorAuthService) { }

  ngOnInit(): void {
    this.loadBuses();
  }

  loadBuses() {
    this.vendorAuth.getScheduleByID(this.vendorAuth.getVendor().vendorId)
      // this.vendorAuth.getScheduleByID(1)
      .subscribe((res: any) => {
        this.buses = res;
        console.log(this.buses)
      });
  }

  onBusChange(event: any) {
    if (this.selectedBusId !== null) {
      this.vendorAuth.getBookingsByBusId(this.selectedBusId).subscribe((res: any) => {
        this.bookings = res;

        // Flatten all passengers into one array
        this.passengers = this.bookings.flatMap((booking: any) => booking.busBookingPassengers);
      });
    } else {
      this.passengers = [];
    }
  }


}
