import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { UserAuthService } from '../../services/auth/User&Vendor/user-auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-login.component.html',
  styleUrl: './user-login.component.css'
})

export class UserLoginComponent {
  emailId = '';
  password = '';
  otp = '';
  newPass = '';
  cnfNewPass = '';

  isValid = true;
  showPassword = false;
  showNewPassword = false;
  showCnfNewPassword = false;
  ForgotPass = false;
  otpField = false;
  SubmitOtp = false;
  loadingOTP: boolean = false;

  initialTimer = 30; // in seconds
  multiplier = 1;
  currentTimer = this.initialTimer;
  timerInterval: any;
  isButtonDisabled = false;
  returnUrl: string = '/';

  router = inject(Router);
  userAuth = inject(UserAuthService);
  activatedRoute = inject(ActivatedRoute);
  toaster = inject(ToastrService);
  resetToken: string = '';

  Login() {
    if (!this.emailId && !this.password) {
      this.toaster.warning('Email & Password is empty', 'warning', {
        closeButton: true,
        timeOut: 3000,
        newestOnTop: true,
        positionClass: 'toast-bottom-right',
      });
      return;
    }
    this.userAuth.userLogin(this.emailId, this.password).subscribe({
      next: (res) => {
        this.userAuth.userDataSession(res.user);
        this.router.navigateByUrl(this.returnUrl);
        this.toaster.success('Login Successfull', 'Login', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
      },
      error: (err) => {
        console.log(err);
        this.toaster.error(`${err.error}`, 'Login Failed', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
      }
    });
  }

  ngOnInit() {
    this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || '/';
    console.log('Login ',this.returnUrl);

  }

  redirectToRegisterNewUser() {
    this.router.navigate(['/registerUser'], {
      queryParams: { returnUrl: this.returnUrl }
    });
  }

  ForgotPassClick() {
    this.emailId = '';
    this.password = '';
    this.otp = '';
    this.ForgotPass = true;

  }

  clickedOnSendOTP = false;
  @ViewChild('EmailIdViewChild') emailIdControl!: NgModel;
  SendOTP() {
    if (this.emailIdControl.invalid) {
      this.toaster.warning('Email is Empty', 'Empty Field', {
        closeButton: true,
        timeOut: 3000,
        newestOnTop: true,
        positionClass: 'toast-bottom-right',
      });
    } else {
      this.loadingOTP = true;
      this.clickedOnSendOTP = true;
      this.userAuth.sendOTP(this.emailId).subscribe({
        next: (res) => {
          this.toaster.success(`${res.message}`, 'OTP', {
            closeButton: true,
            timeOut: 3000,
            newestOnTop: true,
            positionClass: 'toast-bottom-right',
          });
          this.otpField = true;

        },
        error: (err) => {
          if (err.status == 400) {
            this.toaster.error('New User! Create an Account', `${err.error}`, {
              closeButton: true,
              timeOut: 3000,
              newestOnTop: true,
              positionClass: 'toast-bottom-right',
            });
          }
          this.clickedOnSendOTP = false;
          this.loadingOTP = false;
        }
      });
    }
  }

  reSendOTP() {
    this.userAuth.reSendOTP(this.emailId).subscribe({
      next: (res) => {
        this.toaster.success('OTP Resent to Email', 'OTP', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
        this.startTimer();
        this.multiplier++;
      },
      error: (err) => {
        this.toaster.error('New User? Create an Account', 'Email Not Found', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
      }
    })
  }

  submitOtp() {
    this.newPass = '';
    this.cnfNewPass = '';
    this.userAuth.verifyUserOTP(this.otp, this.emailId).subscribe({
      next: (res) => {
        this.resetToken = res.resetToken;
        this.toaster.success('OTP Verified Successfully', 'OTP Verified', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
        this.SubmitOtp = true;
      }, error: (err) => {
        this.resetToken = '';
        this.toaster.error(`${err.error}`, 'Error', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        })
      }
    })
  }

  updatePassword() {
    if (this.newPass !== this.cnfNewPass) {
      this.toaster.warning('Passwords did not match', 'Password Mismatch', {
        closeButton: true,
        timeOut: 3000,
        newestOnTop: true,
        positionClass: 'toast-bottom-right',
      });
      return;
    }
    if (!this.newPass && !this.cnfNewPass) {
      this.toaster.warning('Fill the required Fields', 'Empty Field', {
        closeButton: true,
        timeOut: 3000,
        newestOnTop: true,
        positionClass: 'toast-bottom-right',
      });
      return
    }
    // Proceed with password reset logic
    this.userAuth.updateNewPassword(this.emailId, this.newPass, this.resetToken).subscribe({
      next: (res) => {
        // window.location.reload();
        this.toaster.success(`${res.message}`, 'Reset Password', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }, error: (err) => {
        this.toaster.error(`this${err.error}`, 'Error', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        })
      }
    })

  }




  startTimer() {
    this.isButtonDisabled = true;
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


  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }
  toggleCnfNewPasswordVisibility(): void {
    this.showCnfNewPassword = !this.showCnfNewPassword;
  }

  // Dynamic Images 
  redBus = '../assets/images/redbus_logo.png';
  googleSvg = '../assets/images/google.svg';
  metaSvg = '../assets/images/meta.svg';



  // Css Functions
  floatingLogos = Array.from({ length: 30 }).map(() => {
    const directions = ['up', 'down', 'left', 'right', 'diag1', 'diag2'];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    return {
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${20 + Math.random() * 40}px`,
      duration: `${2.5 + Math.random() * 2.5}s`,
      delay: `${Math.random() * 3}s`,
      direction,
    };
  });
}
