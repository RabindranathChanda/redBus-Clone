import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserAuthService } from '../../../../services/auth/User&Vendor/user-auth.service';
import { User } from '../../../../models/auth/user.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-privacy-security',
  imports: [FormsModule, CommonModule],
  templateUrl: './privacy-security.component.html',
  styleUrl: './privacy-security.component.css'
})
export class PrivacySecurityComponent {

  userAuth = inject(UserAuthService);
  toaster = inject(ToastrService);

  user: User = new User();

  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  newPass: string = '';
  confirmPass: string = '';



  ngOnInit() {
    this.newPass = '';
    this.confirmPass = '';

    this.user = this.userAuth.getUser();
  }

  onResetPassword() {
    if (this.newPass != '' && this.confirmPass != '') {
      if (this.newPass == this.confirmPass) {
        this.userAuth.updateNewPasswordNoEmail(this.user.userId, this.newPass).subscribe({
          next: (response) => {
            this.toaster.success('Password updated successfully', 'Successfull', {
              closeButton: true,
              timeOut: 3000,
              newestOnTop: true,
              positionClass: 'toast-bottom-right',
            });
            this.newPass = this.confirmPass = '';
          }, error: (error) => {
            this.toaster.warning('Something went wrong. Try re-login', 'Warning', {
              closeButton: true,
              timeOut: 3000,
              newestOnTop: true,
              positionClass: 'toast-bottom-right',
            });
          }
        })
      } else {
        this.toaster.warning('Password Mismatch', 'Warning', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        })
      }
    } else {
      this.toaster.error('Fields are empty', 'Error', {
        closeButton: true,
        timeOut: 3000,
        newestOnTop: true,
        positionClass: 'toast-bottom-right',
      });
    }
  }

}
