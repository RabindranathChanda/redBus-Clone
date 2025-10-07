import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UserAuthService } from '../services/auth/User&Vendor/user-auth.service';
import { ToastrService } from 'ngx-toastr';
import { VendorAuthService } from '../services/auth/User&Vendor/vendor-auth.service';
import { LanguageServiceService } from '../services/language/language-service.service';


@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  router = inject(Router);
  languageService = inject(LanguageServiceService);
  redBusLogo: string = '';
  railLogo: string = '';

  // languages = [
  //   { name: 'English', selected: true },
  //   { name: 'हिंदी (Hindi)', selected: false },
  //   { name: 'বাংলা (Bengali)', selected: false }
  // ];

  languages = [
    { name: 'English', langName: 'English', code: 'en', selected: true },
    { name: 'हिंदी (Hindi)', langName: 'Hindi', code: 'hi', selected: false },
    { name: 'বাংলা (Bengali)', langName: 'Bengali', code: 'bn', selected: false }
  ];
  accountOptions = [
    'Show My Ticket',
    'Vendor Login',
    'Login/Sign Up'
  ];

  langName = localStorage.getItem('selectedLanguageName') || 'English';

  ngOnInit() {
    // Dynamically Rendering Images -----------
    this.redBusLogo = "/assets/images/redbus_logo.png";
    this.railLogo = "/assets/images/rail_logo.png";

    // this.langName = this.languageService.getSavedLanguageName();
    // this.languageService.applySavedLanguage();
    // this.languages.forEach(l => l.selected = (l.name.includes(this.langName)));


    this.langName = this.languageService.getSavedLanguageName();

    const savedLang = localStorage.getItem('selectedLanguage');
    if (savedLang) {
      this.languages.forEach(l => l.selected = (l.code === savedLang));
    }
  }



  // Language & Account Dropdown ----------------->
  @ViewChild('dropdownRef', { static: false }) dropdownRef!: ElementRef;
  @ViewChild('accountDropdownRef', { static: false }) accountDropdownRef!: ElementRef;

  isLanguageDropdownVisible = false;
  isAccountDropdownVisible = false;

  toggleDropdown() {
    this.isLanguageDropdownVisible = !this.isLanguageDropdownVisible;
  }

  selectLanguage(langCode: string, langName: string) {
    this.languages.forEach(l => l.selected = (l.code === langCode));
    this.langName = langName;
    this.languageService.setLanguage(langCode, langName);
    this.isLanguageDropdownVisible = false;
  }



  toggleAccountDropdown() {
    this.isAccountDropdownVisible = !this.isAccountDropdownVisible;
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent) {
    const clickedElement = event.target as HTMLElement;

    // Language dropdown logic
    if (
      this.dropdownRef &&
      (this.dropdownRef.nativeElement.contains(clickedElement) ||
        clickedElement.closest('.language-toggle'))
    ) {
      // Clicked inside language dropdown or toggle
    } else {
      this.isLanguageDropdownVisible = false;
    }

    // Account dropdown logic
    if (
      this.accountDropdownRef &&
      (this.accountDropdownRef.nativeElement.contains(clickedElement) ||
        clickedElement.closest('.account-toggle'))
    ) {
      // Clicked inside account dropdown or toggle
    } else {
      this.isAccountDropdownVisible = false;
    }
  }

  goHome() {
    this.router.navigateByUrl('/');
    localStorage.removeItem('searchData');
  }

  loggedInUser(): boolean {
    return sessionStorage.getItem('isUserLoggedIn') === 'true';
  }
  loggedInVendor(): boolean {
    return sessionStorage.getItem('isVendorLoggedIn') === 'true';
  }
  shouldHideOption(option: string): boolean {
    return option === 'Login/Sign Up' && (this.loggedInUser() || this.loggedInVendor());
  }

  getOptionLabel(option: string): string {
    if (option === 'Login/Sign Up') {
      return (this.loggedInUser() || this.loggedInVendor()) ? 'Logout' : 'Login/Sign Up';
    }
    if (option === 'Show My Ticket' && this.loggedInUser()) {
      return 'Account';
    }
    if (option === 'Show My Ticket' && this.loggedInVendor()) {
      return 'Dashboard';
    }
    if (option === 'Vendor Login' && this.loggedInUser()) {
      return 'Show My Ticket';
    }
    if (option === 'Vendor Login' && this.loggedInVendor()) {
      return 'Support';
    }
    return option;
  }

  getOptionAction(option: string): string {
    if (option === 'Login/Sign Up' && (this.loggedInUser() || this.loggedInVendor())) {
      return 'Logout';
    }
    if (option === 'Show My Ticket' && this.loggedInUser()) {
      return 'Account';
    }
    if (option === 'Show My Ticket' && this.loggedInVendor()) {
      return 'Dashboard';
    }
    if (option === 'Vendor Login' && this.loggedInUser()) {
      return 'Show My Ticket';
    }
    if (option === 'Vendor Login' && this.loggedInVendor()) {
      return 'Support';
    }
    return option;
  }



  userAuth = inject(UserAuthService);
  vendorAuth = inject(VendorAuthService);
  handleAccountOptions(option: string): void {
    this.isAccountDropdownVisible = false;

    switch (option) {
      case 'Login/Sign Up':
        this.router.navigate(['/user-login'], {
          queryParams: { returnUrl: this.router.url }
        });
        break;

      case 'Logout':
        if (this.loggedInUser()) {
          this.userAuth.userLogout();
        }
        if (this.loggedInVendor()) {
          this.vendorAuth.LogoutVendor();
        }
        break;

      case 'Account':
        this.router.navigate(['/userAccount']);
        break;

      case 'Dashboard':
        this.router.navigate(['/vendorAccount']);
        break;

      case 'Show My Ticket':
        console.log('Show My Ticket');
        break;
      case 'Vendor Login':
        this.router.navigate(['/vendor-login'], {
          queryParams: { returnUrl: this.router.url }
        });
        break;
      case 'Support':
        console.log('Support');
        break;

      default:
        console.log(`Unhandled option: ${option}`);
        break;
    }
  }



}
