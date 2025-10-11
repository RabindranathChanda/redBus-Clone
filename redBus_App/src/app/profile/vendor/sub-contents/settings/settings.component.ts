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





    // Track the last withdrawal date
    lastWithdrawalDate: Date | null = null;

    canWithdrawToday(): boolean {
        if (!this.lastWithdrawalDate) return true;
        const today = new Date();
        return today.toDateString() !== new Date(this.lastWithdrawalDate).toDateString();
    }

    withdrawMoney() {
        if (!this.canWithdrawToday()) return;

        // Call backend API to withdraw money
        // this.vendorAuthService.withdrawEarnings().subscribe({
        //     next: (res) => {
        //         this.toaster.success('Withdrawal successful!');
        //         this.lastWithdrawalDate = new Date();
        //         this.loadVendor(); // refresh earnings
        //     },
        //     error: (err) => {
        //         this.toaster.error(`${err.error}`, 'Error', {
        //             closeButton: true,
        //             timeOut: 3000,
        //             newestOnTop: true,
        //             positionClass: 'toast-bottom-right',
        //         });
        //     }
        // });
    }




}
