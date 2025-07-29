import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, EventEmitter, inject, Output, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Bus } from '../../../../models/bus/searchBus/search-bus.model';
import { FormsModule } from '@angular/forms';
import { VendorAuthService } from '../../../../services/auth/User&Vendor/vendor-auth.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { COMPONENT_SWITCHER } from '../../vendor-dashboard/vendor-dashboard.component';

@Component({
  selector: 'app-add-bus',
  imports: [FormsModule, CommonModule, MatTableModule, MatPaginatorModule, HttpClientModule],
  templateUrl: './add-bus.component.html',
  styleUrl: './add-bus.component.css'
})
export class AddBusComponent {
  vendorAuth = inject(VendorAuthService);
  toaster = inject(ToastrService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  allBuses: any[] = [];
  paginatedBuses: any[] = [];
  pageSize = 5;
  currentPage = 1;
  totalPages = 1;
  pages: number[] = [];

  isAddBusVisible = false;
  loaded = false;

  bus: Bus = new Bus();

  vendorId = this.vendorAuth.getVendor().vendorId;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const page = +params['busPage'] || 1;
      this.loadBuses(page);
    });
  }

  loadBuses(page: number) {
    this.vendorAuth.getBusesByVendor(this.vendorId, page, this.pageSize).subscribe(response => {
      const buses = response.buses;
      const totalCount = response.totalCount;

      this.totalPages = Math.ceil(totalCount / this.pageSize);
      this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

      // If current page is invalid (e.g., after deletion), go to previous valid page
      if (buses.length === 0 && page > 1) {
        // Go to previous page and update query params
        this.goToPage(page - 1);
        return;
      }

      this.paginatedBuses = buses;
      this.currentPage = page;
      this.loaded = true;
    });
  }



  goToPage(busPage: number) {
    if (busPage < 1 || busPage > this.totalPages) return;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { busPage },
      queryParamsHandling: 'merge'
    });

    this.loadBuses(busPage);
  }

  switchComponent = inject(COMPONENT_SWITCHER);

  gotoSchedule() {
    this.switchComponent('AddSchedule');
  }

  BusName: string = '';
  BusVehicleNo: string = '';
  BusTotalSeat: any = '';
  BusType: string = '';
  BusIsAC: boolean | null = null;

  hasBusNameError: boolean = false;
  hasVehicleNoError: boolean = false;
  hasSeatError: boolean = false;
  hasBusTypeError: boolean = false;
  hasBusIsACError: boolean = false;


  closeAddNewBusModel() {
    this.BusName = '';
    this.BusVehicleNo = '';
    this.BusTotalSeat = '';
    this.BusType = '';
    this.BusIsAC = null;
    this.isAddBusVisible = false;
  }


  addNewBus() {
    switch (true) {
      case this.BusName.trim() === '':
        this.hasBusNameError = true;
        this.toaster.warning('Bus name is required', 'Warning', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
        return;

      case this.BusVehicleNo.trim() === '':
        this.hasVehicleNoError = true;
        this.toaster.warning('Vehicle number is required', 'Warning', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
        return;

      case this.BusType.trim() === '':
        this.hasBusTypeError = true;
        this.toaster.warning('Select valid bus type', 'Warning', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
        return;

      case this.BusIsAC === null:
        this.hasBusIsACError = true;
        this.toaster.warning('Select AC or Non-AC', 'Warning', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
        return;

      case this.BusTotalSeat === null || this.BusTotalSeat <= 0 || isNaN(this.BusTotalSeat):
        this.hasSeatError = true;
        this.toaster.warning('Total seats must be a number and greater than 0', 'Warning', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
        return;

    }

    this.bus.busName = this.BusName;
    this.bus.busVehicleNo = this.BusVehicleNo;
    this.bus.totalSeats = this.BusTotalSeat;
    this.bus.vendorId = this.vendorAuth.getVendor().vendorId
    this.bus.busType = this.BusType;
    this.bus.isAC = this.BusIsAC;

    this.vendorAuth.addNewBus(this.bus).subscribe({
      next: () => {
        this.toaster.success('Bus added Successfully', 'Successfull', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        })
        this.closeAddNewBusModel();
        this.loadBuses(this.currentPage);
      },
      error: (err) => {
        this.toaster.warning(`${err.error.message}`, 'Warning', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
        this.BusName = this.BusVehicleNo = this.BusType = '';
        this.BusIsAC = null;
        this.BusTotalSeat = '';
        this.hasBusNameError = true;
        this.hasVehicleNoError = true;
        this.hasSeatError = true;
        this.hasBusTypeError = true;
        this.hasBusIsACError = true;
      }
    })
  }



  deleteBus(busId: number) {
    this.vendorAuth.deleteBus(busId).subscribe({
      next: (res) => {
        this.toaster.success(`${res.message}`, 'Successfull', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
        this.loadBuses(this.currentPage);
      },
      error: (err) => {
        this.toaster.warning(`${err.error.message}`, 'Warning', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
      }
    })
  }





}
