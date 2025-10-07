import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Vendor, VendorBankDetails } from '../../../../models/auth/vendor.model';
import { VendorAuthService } from '../../../../services/auth/User&Vendor/vendor-auth.service';
import { ToastrService } from 'ngx-toastr';
import { single } from 'rxjs';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  vendorDetails: Vendor = new Vendor();
  private vendorAuthService = inject(VendorAuthService);
  private toaster = inject(ToastrService);


  ngOnInit(): void {
    this.loadVendor();
  }


  loadVendor() {
    // this.vendorAuthService.get
    this.vendorAuthService.getFullDetailsOfVendor().subscribe({
      next: (res) => {
        this.vendorDetails = Vendor.fromJson(res);
      },
      error: (err) => {
        this.toaster.error(`${err.error}`, 'Error', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        })
      }
    })
  }



  verifyBank() {
  }

}
