import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { ISearchBusResult } from '../../../models/bus/searchBus/search-bus.model';

@Injectable({
  providedIn: 'root'
})
export class SearchBusService {

  constructor(private http: HttpClient) { }



  searchBus(fromLocationId:number, toLocationId:number,travelDate:string):Observable<ISearchBusResult[]>{
    return this.http.get<ISearchBusResult[]>(`${environment.apiUrl}/SearchBus?from=${fromLocationId}&to=${toLocationId}&travelDate=${travelDate}`)
    .pipe(catchError((error)=>{
      // console.error("search Bus",error);
      return throwError(()=>error);
    }));
  }

}
