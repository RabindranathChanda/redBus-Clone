import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RecaptchaV3Service } from '../../services/auth/reCaptcha/recaptcha-v3.service';
import { VendorAuthService } from '../../services/auth/User&Vendor/vendor-auth.service';
import { Vendor } from '../../models/auth/vendor.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-vendor-register',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './vendor-register.component.html',
  styleUrl: './vendor-register.component.css'
})
export class VendorRegisterComponent {

  activatedRoutes = inject(ActivatedRoute);
  router = inject(Router);
  formBuilder = inject(FormBuilder);
  reCAPTCHA = inject(RecaptchaV3Service);
  vendorAuth = inject(VendorAuthService);
  toaster = inject(ToastrService);

  redBus: string = '';
  regVendor: string = '';
  googleSvg: string = '';
  metaSvg: string = '';

  returnUrl: string = '/';

  fields = [
    { id: 'vendorName', control: 'VendorName', label: 'Vendor Name', placeholder: 'Enter Vendor Name', type: 'text' },
    { id: 'contactNo', control: 'ContactNo', label: 'Contact Number', placeholder: 'Enter Contact Number', type: 'text' },
    { id: 'emailId', control: 'EmailId', label: 'Email ID', placeholder: 'Enter Email', type: 'email' },
    { id: 'district', control: 'District', label: 'District', placeholder: 'Enter District', type: 'text' },
    { id: 'state', control: 'State', label: 'State', placeholder: 'Enter State', type: 'text' },
    { id: 'pinCode', control: 'PinCode', label: 'Pin Code', placeholder: 'Enter Pin Code', type: 'text' },
  ];

  vendorForm = this.formBuilder.group({
    VendorName: ['', [Validators.required]],
    ContactNo: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    EmailId: ['', [Validators.required, Validators.email]],
    District: ['', [Validators.required]],
    State: ['', [Validators.required]],
    PinCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });


  ngOnInit() {
    this.returnUrl = this.activatedRoutes.snapshot.queryParams['returnUrl'] || '/';
    this.reCAPTCHA.execute('register_vendor_page_load').then(token => {
    }).catch(err => {
      this.toaster.error(`${err.error}`, 'Error', {
        closeButton: true,
        timeOut: 3000,
        newestOnTop: true,
        positionClass: 'toast-bottom-right',
      });
    });


    // Dynamic Images ------------->
    this.redBus = '../assets/images/redbus_logo.png';
    this.regVendor = '../assets/images/regVendor.svg';
    this.googleSvg = '../assets/images/google.svg';
    this.metaSvg = '../assets/images/meta.svg';
  }

  isInvalid(controlName: string): boolean {
    const control = this.vendorForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }


  getErrorMessage(controlName: string): string {
    const control = this.vendorForm.get(controlName);
    if (control?.hasError('required')) return 'This field is required';
    if (control?.hasError('email')) return 'Invalid email address';
    if (control?.hasError('pattern')) {
      if (controlName === 'ContactNo') return 'Enter a valid 10-digit number';
      if (controlName === 'PinCode') return 'Enter a valid 6-digit pin code';
    }
    return '';
  }

  registerVendor() {
    if (this.vendorForm.valid) {
      this.reCAPTCHA.execute('create_vendor').then(
        (token) => {
          const vendorData = this.vendorForm.value as Vendor;
          this.vendorAuth.registerNewVendor(vendorData, token).subscribe({
            next: res => {
              this.vendorAuth.vendorDataSession(res.vendor);
              this.router.navigate([this.returnUrl]);
              this.toaster.success(`${res.message}`, 'Successfull', {
                closeButton: true,
                timeOut: 3000,
                newestOnTop: true,
                positionClass: 'toast-bottom-right',
              });
            },
            error: err => {
              this.toaster.error(`${err.error}`, 'Error', {
                closeButton: true,
                timeOut: 3000,
                newestOnTop: true,
                positionClass: 'toast-bottom-right',
              });
            }
          });
        }
      ).catch(err => {
        this.toaster.error(`${err.error}`, 'Error', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
      });
    } else {
      this.toaster.warning(`Invalid details provided`, 'Invalid Details', {
        closeButton: true,
        timeOut: 3000,
        newestOnTop: true,
        positionClass: 'toast-bottom-right',
      });
    }
  }





}
