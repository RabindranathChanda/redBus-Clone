import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { User } from '../../../models/auth/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserAuthService {

  constructor(private http: HttpClient, private router: Router) { }
  toaster = inject(ToastrService);

  userLogin(emailId: string, password: string) {
    return this.http.post<any>(`${environment.apiUrl}/Login/User?emailId=${emailId}&password=${password}`, {}, {
      withCredentials: true
    });
  }

  userDataSession(user: any) {
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('isUserLoggedIn', 'true');
  }


  private clearSessionAndRedirect() {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('isUserLoggedIn');
    this.toaster.success('Logout Successfull', 'Logout', {
      closeButton: true,
      timeOut: 3000,
      newestOnTop: true,
      positionClass: 'toast-bottom-right',
    });
    this.router.navigate(['/']);
  }

  isLoggedIn(): boolean {
    return sessionStorage.getItem('isUserLoggedIn') === 'true';
  }

  getUser() {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }


  sendOTP(emailId: string) {
    return this.http.post<any>(`${environment.apiUrl}/ResetPassword/User`, {}, {
      params: { emailId }
    });
  }

  reSendOTP(emailId: string) {
    return this.http.post<any>(`${environment.apiUrl}/ResetPassword/User/ResendOtp`, {}, {
      params: { emailId }
    })
  }

  verifyUserOTP(OTP: string, emailId: string) {
    return this.http.post<any>(`${environment.apiUrl}/ResetPassword/User/Verify`, {}, {
      params: { OTP, emailId }
    })
  }

  updateNewPassword(emailId: string, newPass: string, resetToken: string) {
    return this.http.post<any>(`${environment.apiUrl}/ResetPassword/User/UpdatePassword?emailId=${emailId}&newPassword=${newPass}`, null, {
      headers: { Authorization: `Bearer ${resetToken}` }
    });
  }

  updateNewPasswordNoEmail(userId: number, newPassword: string): Observable<any> {
    return this.http.patch<any>(`${environment.apiUrl}/ResetPassword/User/ResetPassNoEmail?id=${userId}`, `"${newPassword}"`, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    })
  }

  userLogout(): void {
    this.refreshTokenRequest().subscribe({
      next: () => {
        this.http.post(`${environment.apiUrl}/Logout/User`, {}, {
          withCredentials: true
        }).subscribe({
          next: () => this.clearSessionAndRedirect(),
          error: () => this.toaster.error('Error Logging out'),
        });
      },
      error: (err) => {
        this.toaster.error('Error Refreshing Token', 'Error', {
          closeButton: true,
          timeOut: 3000,
          newestOnTop: true,
          positionClass: 'toast-bottom-right',
        });
      }
    });
  }


  clearCookie(id: number): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrl}/Logout/ClearCookie?id=${id}&user=true`,
      {},
      { withCredentials: true }
    );
  }

  refreshTokenRequest(): Observable<any> {
    return this.http.post(`${environment.apiUrl}/RefreshToken/user`, {}, {
      withCredentials: true
    });
  }

  RegisterNewUser(user: User, captchaToken: string): Observable<any> {
    const payload = { user, captchaToken };
    return this.http.post(`${environment.apiUrl}/User`, payload, {
      withCredentials: true
    });
  }

  DeleteUser(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/User/${id}`, {
      withCredentials: true
    });
  }

  // const user = sessionStorage.getItem('user');
  // if(user) {
  //   const userObj = JSON.parse(user);
  //   const userId = userObj.userId;

  //   console.log('Deleting User');
  //   this.userAuth.DeleteUser(userId).subscribe({
  //     next: (response) => {
  //       console.log(response);
  //     },
  //     error: (error) => {
  //       console.error(error);
  //     }
  //   });
  // }


  updateUserProfile(userId: number, mobileNo: number, gender: string): Observable<any> {
    const payload = { mobileNo, gender };
    return this.http.patch<any>(`${environment.apiUrl}/User/${userId}`, payload, {
      withCredentials: true
    });
  }




  uploadProfilePicture(userId: number, imageBlob: Blob): Observable<any> {
    const payload = new FormData();
    payload.append('userId', userId.toString());
    payload.append('imageFile', imageBlob, 'profile.png');

    return this.http.post<any>(`${environment.apiUrl}/UserProfilePic`, payload);
  }


  getProfilePicture(userId: number): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/UserProfilePic/${userId}`, {
      responseType: 'blob',
    });
  }








}

