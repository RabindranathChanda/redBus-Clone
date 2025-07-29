import { CommonModule } from '@angular/common';
import { Component, inject, Injector } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageCroppedEvent, ImageCropperComponent, LoadedImage } from 'ngx-image-cropper';
import { UserAuthService } from '../../../services/auth/User&Vendor/user-auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  standalone: true,
  selector: 'app-user-dashboard',
  imports: [CommonModule, FormsModule, ImageCropperComponent],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent {
  sanitizer = inject(DomSanitizer);
  router = inject(Router);
  userAuth = inject(UserAuthService);
  toaster = inject(ToastrService);
  injector = inject(Injector);
  activatedRoute = inject(ActivatedRoute);

  userName = 'Rabindranath Chanda';
  userMobile = '9123796443';
  userId: number = 0;
  userJson = sessionStorage.getItem('user');

  userLogin(): boolean {
    return sessionStorage.getItem('isUserLoggedIn') === 'true';
  }

  getSessionData() {
    if (this.userLogin()) {
      this.userJson = sessionStorage.getItem('user');
      if (this.userJson) {
        this.userId = JSON.parse(this.userJson).userId;
        this.userName = JSON.parse(this.userJson).fullName;
        this.userMobile = JSON.parse(this.userJson).mobileNo;
      }
    }
  }


  ngOnInit() {
    if (!this.userLogin()) {
      const returnUrl = this.router.url;
      console.log('returnURL ', returnUrl);
      this.router.navigate(['/user-login'], {
        queryParams: { returnUrl: returnUrl }
      });
      return;
    }

    this.loadProfilePicture();
    this.setActive(this.activeOption);
  }

  loadProfilePicture() {
    this.getSessionData();
    this.userAuth.getProfilePicture(this.userId).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
        this.tempCroppedImage = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
      },
      error: (err) => {
        console.error('Error loading profile picture:', err);
      }
    });
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

    this.userAuth.uploadProfilePicture(this.userId, this.croppedBlob).subscribe({
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





  activeOption: string = 'Bookings';
  currentComponent: any = null;
  async setActive(option: string) {
    this.activeOption = option;

    switch (option) {
      case 'Bookings': {
        const { MyBookingsComponent } = await import('../sub-contents/my-bookings/my-bookings.component');
        this.currentComponent = MyBookingsComponent;
        break;
      }
      case 'Privacy': {
        const { PrivacySecurityComponent } = await import('../sub-contents/privacy-security/privacy-security.component');
        this.currentComponent = PrivacySecurityComponent;
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

  }



}
