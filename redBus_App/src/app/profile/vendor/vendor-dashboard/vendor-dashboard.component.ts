import { Component, inject, InjectionToken, Injector, ViewChild, ViewContainerRef } from '@angular/core';
import { VendorAuthService } from '../../../services/auth/User&Vendor/vendor-auth.service';
import { ImageCroppedEvent, ImageCropperComponent, LoadedImage } from 'ngx-image-cropper';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
export const COMPONENT_SWITCHER = new InjectionToken<(option: string) => void>('Component Switcher');


@Component({
  selector: 'app-vendor-dashboard',
  imports: [CommonModule, FormsModule, ImageCropperComponent,],
  templateUrl: './vendor-dashboard.component.html',
  styleUrl: './vendor-dashboard.component.css'
})

export class VendorDashboardComponent {

  vendorAuth = inject(VendorAuthService);
  sanitizer = inject(DomSanitizer);
  injector = inject(Injector);
  baseInjector = inject(Injector);
  toaster = inject(ToastrService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  vendorId: number = 0;
  vendorName = '';
  activeOption: string = '';
  contactNo = '';
  vendorJson = sessionStorage.getItem('vendor');


  isVendorLoggedIn = false;
  isWholePageLoaded = false;


  ngOnInit() {
    if (!this.vendorLogin()) {
      const returnUrl = this.router.url;
      console.log('returnURL ', returnUrl);
      this.router.navigate(['/vendor-login'], {
        queryParams: { returnUrl: returnUrl }
      });
      return;
    }


    this.route.queryParamMap.subscribe(params => {
      const view = params.get('view');
      this.activeOption = view ?? 'Dashboard';
      this.setActive(this.activeOption);
    });

    this.loadProfilePicture();



  }

  vendorLogin(): boolean {
    return sessionStorage.getItem('isVendorLoggedIn') === 'true';
  }

  getSessionData() {
    if (this.vendorLogin()) {
      this.vendorJson = sessionStorage.getItem('vendor');
      if (this.vendorJson) {
        this.vendorId = JSON.parse(this.vendorJson).vendorId;
        this.vendorName = JSON.parse(this.vendorJson).vendorName;
        this.contactNo = JSON.parse(this.vendorJson).contactNo;
      }
    }
  }


  loadProfilePicture() {
    this.getSessionData();
    this.vendorAuth.getProfilePicture(this.vendorId).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
        this.tempCroppedImage = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
      },
      error: (err) => {
        console.error('Error loading profile picture:', err);
      }
    });
    this.isWholePageLoaded = true;
  }


  imageChangedEvent: Event | null = null;
  croppedImage: SafeUrl | null = null;
  tempCroppedImage: SafeUrl | null = null;
  croppedBlob: Blob | null = null;
  selectingImage = false;

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    this.selectingImage = true;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.objectUrl ? this.sanitizer.bypassSecurityTrustUrl(event.objectUrl)
      : this.croppedImage;
    this.croppedBlob = event.blob ?? null;
  }

  confirmCrop() {
    this.imageChangedEvent = null;

    if (!this.croppedBlob) return;
    this.vendorAuth.uploadProfilePicture(this.vendorId, this.croppedBlob).subscribe({
      next: (res) => {
        this.tempCroppedImage = this.croppedImage;
        this.toaster.success(`${res.message}`, 'Successfull', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
        this.selectingImage = false;
      },
      error: (err) => {
        this.toaster.error(`${err.message}`, 'Error', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        })
      }
    });
  }

  cancelCrop() {
    this.imageChangedEvent = null;
    this.croppedImage = this.tempCroppedImage;
    this.selectingImage = false;
  }


  currentComponent: any = null;
  async setActive(option: string) {
    this.activeOption = option;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view: option },
      queryParamsHandling: 'merge'
    });

    switch (option) {
      case 'Dashboard': {
        const { MainReportDashboardComponent } = await import('../sub-contents/main-report-dashboard/main-report-dashboard.component');
        this.currentComponent = MainReportDashboardComponent;
        break;
      }
      case 'AddBus': {
        const { AddBusComponent } = await import('../sub-contents/add-bus/add-bus.component');
        this.currentComponent = AddBusComponent;
        break;
      }
      case 'AddSchedule': {
        const { AddSchedulesComponent } = await import('../sub-contents/add-schedules/add-schedules.component');
        this.currentComponent = AddSchedulesComponent;
        break;
      }
      case 'Bookings': {
        const { AllBookingsComponent } = await import('../sub-contents/all-bookings/all-bookings.component');
        this.currentComponent = AllBookingsComponent;
        break;
      }
      case 'Earnings': {
        const { ManageEarningsComponent } = await import('../sub-contents/manage-payments/manage-earnings.component');
        this.currentComponent = ManageEarningsComponent;
        break;
      }
      case 'Profile': {
        const { ProfileComponent } = await import('../sub-contents/profile/profile.component');
        this.currentComponent = ProfileComponent;
        break;
      }
      case 'Settings': {
        const { SettingsComponent } = await import('../sub-contents/settings/settings.component');
        this.currentComponent = SettingsComponent;
        break;
      }
    }



    this.injector = Injector.create({
      providers: [
        {
          provide: COMPONENT_SWITCHER,
          useValue: this.setActive.bind(this)
        }
      ],
      parent: this.baseInjector
    });

  }

}
