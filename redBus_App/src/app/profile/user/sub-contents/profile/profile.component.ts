import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../../../models/auth/user.model';
import { UserAuthService } from '../../../../services/auth/User&Vendor/user-auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  userAuth = inject(UserAuthService);
  toaster = inject(ToastrService);

  user: User = new User();


  ngOnInit() {
    this.user = this.userAuth.getUser();
  }



  handleUpdateUserProfile() {
    console.log(this.user.mobileNo, this.user.gender);
    this.userAuth.updateUserProfile(this.user.userId, this.user.mobileNo, this.user.gender).subscribe({
      next: (response) => {
        this.userAuth.userDataSession(response.user);
        this.toaster.success('Successfully updated', 'Successfull', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
      }, error: (error) => {
        console.error(error);
      }
    });
  }

}
