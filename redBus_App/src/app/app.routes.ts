import { Routes } from '@angular/router';
import { SearchBusComponent } from './search-bus/search-bus.component';
import { SearchBusCompactComponent } from './search-bus-compact/search-bus-compact.component';
import { UserLoginComponent } from './login/user-login/user-login.component';
import { UserRegisterComponent } from './register/user-register/user-register.component';
import { VendorLoginComponent } from './login/vendor-login/vendor-login.component';
import { VendorRegisterComponent } from './register/vendor-register/vendor-register.component';
import { UserDashboardComponent } from './profile/user/user-dashboard/user-dashboard.component';
import { VendorDashboardComponent } from './profile/vendor/vendor-dashboard/vendor-dashboard.component';

export const routes: Routes = [

    {
        path: '',
        component: SearchBusComponent,
        data: { showFooter: true, showHeader: true }
    },
    {
        path: 'searchBus',
        component: SearchBusCompactComponent,
        data: { showHeader: true }
    },
    {
        path: "user-login",
        component: UserLoginComponent,
        data: { showHeader: true, showFooter: true }
    },
    {
        path: "registerUser",
        component: UserRegisterComponent,
        data: { showHeader: true, showFooter: true }
    }, {
        path: "vendor-login",
        component: VendorLoginComponent,
        // data: { showHeader: true, showFooter: true }
    },
    {
        path: "registerVendor",
        component: VendorRegisterComponent,
        data: { showHeader: true, showFooter: true }
    },
    {
        path: "userAccount",
        component: UserDashboardComponent,
        data: { showHeader: true }
    },
    {
        path: "vendorAccount",
        component: VendorDashboardComponent,
        data: { showHeader: true }
    },
    // {
    //     path: "book-ticket",
    //     component: BookTicketComponent
    // }
    // ,
    // {
    //     path: "my-bookings",
    //     component: MyBookingComponent
    // }


];
