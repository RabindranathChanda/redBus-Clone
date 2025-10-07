import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, Observable, of, shareReplay } from 'rxjs';
import { Location } from '../../../models/bus/loadLocations/location.model';

@Injectable({
  providedIn: 'root'
})
export class LocationsService {

  private locations$: Observable<Location[]> | null = null;
  
  constructor(private http: HttpClient) { }

  getLocationList(): Observable<Location[]> {
    if (!this.locations$) {
      this.locations$ = this.http.get<Location[]>(`${environment.apiUrl}/Location`).pipe(
        shareReplay(1),
        catchError(error => {
          this.locations$ = null;
          return of([]);
        })
      );
    }
    return this.locations$;
  }

  refreshLocationList(): void {
    this.locations$ = null;
  }
}
