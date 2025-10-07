import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MyBookings } from '../../../models/bus/myBookings/my-bookings.model';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class MyBookingsService {
  http = inject(HttpClient);
  router = inject(Router);

  getUserBookings(userId: number): Observable<MyBookings[]> {
    return this.http.get<MyBookings[]>(`${environment.apiUrl}/BusBooking/${userId}`, {
      withCredentials: true
    });
  }

  cancelTickets(passengerIds: number[]): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/CancelBusBooking`, passengerIds, {
      withCredentials: true
    });
  }

}
