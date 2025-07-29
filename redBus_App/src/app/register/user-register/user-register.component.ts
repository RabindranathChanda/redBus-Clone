import { Component, inject, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { regUser, User } from '../../models/auth/user.model';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserAuthService } from '../../services/auth/User&Vendor/user-auth.service';
import { ToastrService } from 'ngx-toastr';
import { RecaptchaV3Service } from '../../services/auth/reCaptcha/recaptcha-v3.service';

@Component({
  selector: 'app-user-register',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './user-register.component.html',
  styleUrl: './user-register.component.css'
})

export class UserRegisterComponent {
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private userAuth = inject(UserAuthService);
  private reCAPTCHA = inject(RecaptchaV3Service);

  user: regUser = new regUser();
  registerForm!: FormGroup;
  submitted = false;
  returnUrl: string = '/';
  toaster = inject(ToastrService);
  zone = inject(NgZone);

  ngOnInit() {
    this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || '/';
    console.log(this.returnUrl);
    this.reCAPTCHA.execute('register_user_page_load').then(token => {
    }).catch(err => {
      this.toaster.error(`${err.error}`, 'Error', {
        closeButton: true,
        timeOut: 3000,
        newestOnTop: true,
        positionClass: 'toast-bottom-right',
      });
    });
    this.registerForm = this.fb.group({
      emailId: ['', [Validators.required, Validators.email]],
      fullName: ['', Validators.required],
      gender: ['', Validators.required],
      mobileNo: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }


  get f() {
    return this.registerForm.controls;
  }

  onRegister() {
    this.submitted = true;
    if (this.registerForm.invalid) return;

    this.reCAPTCHA.execute('create_user').then(
      (token) => {
        const userData = this.registerForm.value as User;
        this.userAuth.RegisterNewUser(userData, token).subscribe({
          next: res => {
            this.userAuth.userDataSession(res.user);
            this.router.navigate([this.returnUrl]);
            this.toaster.success(`${res.message}`, 'Successfull', {
              closeButton: true,
              timeOut: 3000,
              newestOnTop: true,
              positionClass: 'toast-bottom-right',
            });
            setTimeout(() => {
              this.zone.run(() => {
                this.router.navigate([this.returnUrl]);
              });
            }, 3000);
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
  }

  registerWithGoogle() {
    console.log('Google register triggered');
  }

  registerWithFacebook() {
    console.log('Facebook register triggered');
  }

  showPassword = false;


  togglePasswordVisibility() {
    if (this.showPassword) {
      this.showPassword = false;
    } else {
      this.showPassword = true;
    }
  }


  // Dynamic Images ---------->
  redBus = '../assets/images/redbus_logo.png';
  googleSvg = '../assets/images/google.svg';
  metaSvg = '../assets/images/meta.svg';
  travelSvg = '../assets/images/travel.svg'


}
