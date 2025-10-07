import { Component, inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ISearchBusResult, SearchBus } from '../models/bus/searchBus/search-bus.model';
import { SearchBusService } from '../services/bus/searchBus/search-bus.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { BookTicketComponent } from "../book-ticket/bookTicket.component";
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';


@Component({
  selector: 'app-search-bus-result',
  standalone: true,
  imports: [FormsModule, CommonModule, DatePipe, MatBottomSheetModule],
  templateUrl: './searchBus-result.component.html',
  styleUrl: './searchBus-result.component.css'
})
export class SearchBusResultComponent implements OnInit {
  @Input() dataFromParent!: SearchBus;

  activatedRoute = inject(ActivatedRoute);
  searchService = inject(SearchBusService)
  searchData: ISearchBusResult[] = [];
  errorMsg:string='';
  private bottomSheetService = inject(MatBottomSheet);

  filters = [
    { label: 'Departure time from source' },
    { label: 'Arrival time at destination' },
    { label: 'Bus type' },
    { label: 'Single window seater/ sleeper' },
    { label: 'Bus features' },
    { label: 'Bus operator' },
    { label: 'Boarding points' },
    { label: 'Dropping points' }
  ];


  getTimeDifference(startTime: string, endTime: string): string {
    const start = new Date(startTime);
    const end = new Date(endTime);
  
    const diffInMs = end.getTime() - start.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const days = Math.floor(diffInHours / 24);
    const hours = diffInHours % 24;
  
    let result = '';
    if (days > 0) {
      result += `${days}d `;
    }
    result += `${hours}h`;
  
    return result.trim();
  }
  
  ngOnInit() {
    this.getSearchResult();
  }


  getSearchResult() {
    this.searchService.searchBus(this.dataFromParent.fromLocationId, this.dataFromParent.toLocationId, this.dataFromParent.travelDate).subscribe({
      next:(data) =>{
        this.searchData= data;
        // this.errorMsg = '';
        if(data.length === 0){
          this.errorMsg = 'No buses available for the selected route and date';
        }else{
          this.errorMsg = '';
        }
      }
    })
  }



  isBottomSheetOpen: boolean = false;
  openBookBusComponent_BottmSheet(scheduleId: number): void {
    this.isBottomSheetOpen = true;
    const ref = this.bottomSheetService.open(BookTicketComponent, {
      panelClass: 'full-width-bottom-sheet',
      data: scheduleId,
    });
    ref.afterDismissed().subscribe(() => {
      this.isBottomSheetOpen = false;
    });

  }


  // Dnamic Images--
  busNotFound = '../assets/images/Oops.png';
}
