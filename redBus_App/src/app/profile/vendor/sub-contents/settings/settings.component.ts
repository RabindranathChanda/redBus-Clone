import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Vendor, VendorBankDetails } from '../../../../models/auth/vendor.model';
import { VendorAuthService } from '../../../../services/auth/User&Vendor/vendor-auth.service';
import { ToastrService } from 'ngx-toastr';
import { single } from 'rxjs';


@Component({
    selector: 'app-settings',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, FormsModule],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
    vendorDetails: Vendor = new Vendor();
    private vendorAuthService = inject(VendorAuthService);
    private toaster = inject(ToastrService);

    withdrawalHistory = [
      { date: '12 Oct 2024', amount: '₹5,000', status: 'Completed', transactionId: 'TXN123456' },
      { date: '10 Oct 2024', amount: '₹3,000', status: 'Pending', transactionId: 'TXN789012' }
    ];
    pendingPayouts = [
      { date: '15 Oct 2024', amount: '₹2,000', status: 'Processing' }
    ];
    nextWithdrawalDate = '13 Oct 2025, 10:00 AM'; // From API

    downloadCSV() { /* Implement CSV export */ }
    downloadPDF() { /* Implement PDF export */ }




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




    // In component
    notifications = {
      successWithdraw: true,
      failedTx: true,
      weeklyReport: false
    };
    twoFactorEnabled = false;
    payoutMethod = 'Bank'; // Default

    toggleNotification(key: string) {
    //   this.notifications[key] = !this.notifications[key];
      // Call API to save, e.g., this.vendorService.updateNotifications(this.notifications);
    }

    enableTwoFactor() {
      // Call API, e.g., this.vendorService.enable2FA();
    }

    savePayoutMethod() {
      // Call API, e.g., this.vendorService.updatePayoutMethod(this.payoutMethod);
    }

    downloadMonthlyInvoice() {
      // Implement download, e.g., window.open('/api/vendor/invoices/monthly');
    }

    downloadGSTReport() {
      // Similar to above
    }

    reportIssue() {
      // Open modal or navigate, e.g., this.dialog.open(ReportIssueComponent);
    }

    contactSupport() {
      // e.g., window.open('mailto:support@redbusclone.com'); or chat integration
    }

}
