import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VendorAuthService } from '../../services/auth/User&Vendor/vendor-auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-vendor-login',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './vendor-login.component.html',
  styleUrl: './vendor-login.component.css'
})
export class VendorLoginComponent {

  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  vendorAuth = inject(VendorAuthService);
  toaster = inject(ToastrService);
  fb = inject(FormBuilder);

  inputEmail = '';
  inputOtp = '';
  returnUrl: string = '/';
  vendorLogin!: FormGroup;
  submitted = false;
  SendOTP = false;
  clickedOnSendOTP = false;

  isButtonDisabled = false;
  initialTimer = 30; // in seconds
  multiplier = 1;
  currentTimer = this.initialTimer;
  timerInterval: any;
  locating:string = '';
  redBus:string = '';
  
  ngOnInit() {
    this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || '/';

    this.vendorLogin = this.fb.group({
      emailId: ['', [Validators.required, Validators.email]],
      OTP: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
    });
    
    // Dynamic Images ----------->
    this.redBus = '../assets/images/redbus_logo.png';
    this.locating = '../assets/images/test2.svg';
  }

  get f() {
    return this.vendorLogin.controls;
  }

  loadingOTP: boolean = false;
  sendOTP() {
    this.submitted = true;
    this.clickedOnSendOTP = true;

    if (this.f['emailId'].invalid) {
      this.f['emailId'].markAsDirty();
      this.f['emailId'].markAsTouched();
      return;
    }

    this.loadingOTP = true;

    this.f['emailId'].disable();
    this.vendorAuth.LoginVendorSendOTP(this.inputEmail).subscribe({
      next: (response) => {
        this.toaster.success('OTP Send Successfully', 'OTP Send', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
        this.SendOTP = true;
      },
      error: (error) => {
        this.toaster.error(`${error.error}`, 'Error', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
        this.f['emailId'].enable();
        this.SendOTP = false;
        this.clickedOnSendOTP = false;
        this.loadingOTP = false;
      }
    });

  }

  reSendOTP() {
    this.isButtonDisabled = true;
    this.vendorAuth.LoginVendorResendOTP(this.inputEmail).subscribe({
      next: (response) => {
        this.toaster.success('OTP Send Successfully', 'OTP Send', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
        this.startTimer();
        this.multiplier++;
      },
      error: (err) => {
        this.toaster.error(`${err.error}`, 'OTP Send', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
        this.isButtonDisabled = false;
      }
    })
  }

  loginVendorVerifyOTP() {
    this.submitted = true;
    if (this.f['OTP'].invalid) {
      this.f['OTP'].markAsDirty();
      this.f['OTP'].markAsTouched();
      return;
    }

    this.f['OTP'].disable();
    this.vendorAuth.LoginVendorVerifyOTP(this.inputOtp, this.inputEmail).subscribe({
      next: (response) => {
        this.vendorAuth.vendorDataSession(response.vendor);
        this.router.navigateByUrl(this.returnUrl);
        this.toaster.success('Login Successfully', 'Login', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
      },
      error: (error) => {
        this.toaster.error(`${error.error}`, 'Error', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
        this.f['OTP'].enable();
      }
    });

  }

  startTimer() {
    this.currentTimer = this.initialTimer * this.multiplier;
    this.timerInterval = setInterval(() => {
      if (this.currentTimer > 0) {
        this.currentTimer--;
      } else {
        clearInterval(this.timerInterval);
        this.isButtonDisabled = false;
      }
    }, 1000);
  }

  redirectToRegisterNewVendor() {
    this.router.navigate(['/registerVendor'], {
      queryParams: { returnUrl: this.returnUrl }
    });
  }


}
