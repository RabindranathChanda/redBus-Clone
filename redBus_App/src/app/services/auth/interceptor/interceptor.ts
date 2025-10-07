import { HttpClient, HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { UserAuthService } from "../User&Vendor/user-auth.service";
import { VendorAuthService } from "../User&Vendor/vendor-auth.service";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, EMPTY, Observable, switchMap, throwError } from "rxjs";

export class Interceptor implements HttpInterceptor {
    userAuthService = inject(UserAuthService);
    vendorAuthService = inject(VendorAuthService);
    router = inject(Router);
    http = inject(HttpClient);

    private isRefreshing = false;


    private logoutUser(): void {
        const userId = this.userAuthService.getUser()?.userId ?? null;
        if (userId) {
            this.userAuthService.clearCookie(userId).subscribe();
        }
        sessionStorage.removeItem('isUserLoggedIn');
        sessionStorage.removeItem('user');
        this.router.navigate(['/user-login']);
    }

    private logoutVendor(): void {
        const vendorId = this.vendorAuthService.getVendor()?.vendorId ?? null;
        if (vendorId) {
            this.vendorAuthService.clearCookie(vendorId).subscribe();
        }
        sessionStorage.removeItem('isVendorLoggedIn');
        sessionStorage.removeItem('vendor');
        this.router.navigate(['/vendor-login']);
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const isUserLoggedIn = sessionStorage.getItem('isUserLoggedIn') === 'true';
        const isVendorLoggedIn = sessionStorage.getItem('isVendorLoggedIn') === 'true';

        const clonedReq = req.clone({ withCredentials: true });

        return next.handle(clonedReq).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401 && !this.isRefreshing) {
                    this.isRefreshing = true;

                    const refresh$ = isUserLoggedIn
                        ? this.userAuthService.refreshTokenRequest()
                        : isVendorLoggedIn
                            ? this.vendorAuthService.refreshTokenRequest()
                            : throwError(() => error);

                    return refresh$.pipe(
                        switchMap(() => {
                            this.isRefreshing = false;
                            return next.handle(clonedReq);
                        }),
                        catchError(() => {
                            this.isRefreshing = false;

                            if (isUserLoggedIn) {
                                this.logoutUser();
                            } else if (isVendorLoggedIn) {
                                this.logoutVendor();
                            } else {
                                this.router.navigate(['/']);
                            }

                            return throwError(() => error);
                        })
                    );
                }

                return throwError(() => error);
            })
        );

    }

}
