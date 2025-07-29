import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { Vendor } from '../../../models/auth/vendor.model';
import { Bus, BusScheduleDataForVendorSchedule, IBusScheduleDataForVendorSchedule } from '../../../models/bus/searchBus/search-bus.model';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';
import { BusSchedule } from '../../../models/bus/myBookings/my-bookings.model';

@Injectable({
  providedIn: 'root'
})
export class VendorAuthService {
  router = inject(Router);
  http = inject(HttpClient);
  toaster = inject(ToastrService);


  vendorDataSession(vendor: any) {
    sessionStorage.setItem('vendor', JSON.stringify(vendor));
    sessionStorage.setItem('isVendorLoggedIn', 'true');
  }


  private clearSessionAndRedirect() {
    sessionStorage.removeItem('vendor');
    sessionStorage.removeItem('isVendorLoggedIn');
    this.toaster.success('Logout Successfull', 'Logout', {
      closeButton: true,
      timeOut: 3000,
      newestOnTop: true,
      positionClass: 'toast-bottom-right',
    });
    this.router.navigate(['/']);
  }

  isLoggedIn(): boolean {
    return sessionStorage.getItem('isVendorLoggedIn') === 'true';
  }

  getVendor() {
    const vendor = sessionStorage.getItem('vendor');
    return vendor ? JSON.parse(vendor) : null;
  }


  LoginVendorSendOTP(emailId: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/Login/Vendor`, {}, {
      params: { emailId }
    })
  }

  LoginVendorResendOTP(emailId: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/Login/Vendor/ResendOTP`, {}, {
      params: { emailId }
    })
  }

  LoginVendorVerifyOTP(otp: string, emailId: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/Login/Vendor/Verify`, {}, {
      params: { otp, emailId },
      withCredentials: true
    });
  }

  LogoutVendor(): void {
    this.refreshTokenRequest().subscribe({
      next: () => {
        this.http.post(`${environment.apiUrl}/Logout/Vendor`, {}, {
          withCredentials: true
        }).subscribe({
          next: () => this.clearSessionAndRedirect(),
          error: (err) => {
            console.log(err);
            this.toaster.error('Error Logging out', 'Error', {
              closeButton: true,
              timeOut: 3000,
              newestOnTop: true,
              positionClass: 'toast-bottom-right',
            })
          },
        });
      },
      error: (err) => {
        this.toaster.error('Error Refreshing Token', 'Error', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
      }
    });
  }

  clearCookie(id: number): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrl}/Logout/ClearCookie?id=${id}&user=false`,
      {},
      { withCredentials: true }
    );
  }

  refreshTokenRequest(): Observable<any> {
    return this.http.post(`${environment.apiUrl}/RefreshToken/vendor`, {}, {
      withCredentials: true
    });
  }

  registerNewVendor(vendor: Vendor, captchaToken: string): Observable<any> {
    const payload = { vendor, captchaToken };
    return this.http.post<any>(`${environment.apiUrl}/Vendor`, payload, {
      withCredentials: true
    });
  }





  uploadProfilePicture(vendorId: number, imageBlob: Blob): Observable<any> {
    const payload = new FormData();
    payload.append('vendorId', vendorId.toString());
    payload.append('imageFile', imageBlob, 'profile.png');

    return this.http.post<any>(`${environment.apiUrl}/VendorProfilePic`, payload, {
      withCredentials: true
    });
  }


  getProfilePicture(vendorId: number): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/VendorProfilePic/${vendorId}`, {
      responseType: 'blob',
      withCredentials: true
    });
  }

  getBusesByVendor(vendorId: number, page: number, pageSize: number): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/Bus/Vendor/${vendorId}?page=${page}&pageSize=${pageSize}`,
      { withCredentials: true }
    );
  }

  getAllBusesByVendor(vendorId: number): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/Bus/AllBusByVendor/${vendorId}`,
      { withCredentials: true }
    );
  }




  addNewBus(bus: Bus): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/Bus`, bus, {
      withCredentials: true
    })
  }


  deleteBus(busId: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/Bus/${busId}`, {
      withCredentials: true
    });
  }



  getSchedule(vendorId: number, page: number, pageSize: number): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/BusSchedule/ByVendor/${vendorId}?page=${page}&pageSize=${pageSize}`,
      { withCredentials: true }
    );
  }

  getScheduleByID(vendorId: number): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/BusSchedule/BookingScheduleForVendor/${vendorId}`,
      { withCredentials: true }
    );
  }


  deleteSchedule(scheduleId: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/BusSchedule/${scheduleId}`, {
      withCredentials: true
    });
  }

  addNewSchedule(schedule: BusScheduleDataForVendorSchedule): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/BusSchedule`, schedule, {
      withCredentials: true
    })
  }

  scheduleVisibility(id: number, status: string): Observable<any> {
    const busScheduleStatusUpdate = {
      scheduleId: id,
      scheduleStatus: status
    };
    return this.http.patch<any>(`${environment.apiUrl}/BusSchedule/`, busScheduleStatusUpdate, {
      withCredentials: true
    })
  }


  getBookingsByBusId(busId: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/BusBooking/BusForVendor/${busId}`, {
      withCredentials: true
    });
  }



}
