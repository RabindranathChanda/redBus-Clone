import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { IScheduleData } from '../../../models/bus/searchBus/search-bus.model';
import { BookTicket } from '../../../models/bus/bookTicket/book-ticket.model';

@Injectable({
  providedIn: 'root'
})
export class BookTicketsService {


  constructor(private http: HttpClient) { }

  getSchedule(scheduleId:number):Observable<IScheduleData>{
    return this.http.get<IScheduleData>(`${environment.apiUrl}/BusSchedule/${scheduleId}`);
  }

  getBookedSeats(scheduleId:number){
    return this.http.get<string[]>(`${environment.apiUrl}/GetBookedSeats?scheduleId=${scheduleId}`);
  }

  // Book Ticket - POST
  newBooking(records: BookTicket, options:any){
    return this.http.post(`${environment.apiUrl}/BusBooking`,records,options)
  }

}
