// import { Injectable } from '@angular/core';
// import { NavigationEnd, Router } from '@angular/router';

// @Injectable({
//   providedIn: 'root'
// })
// export class LanguageServiceService {

//   constructor(private router: Router) {
//     // Re-apply saved language after page navigation
//     this.router.events.subscribe(event => {
//       if (event instanceof NavigationEnd) {
//         this.applySavedLanguage();
//       }
//     });
//   }

//   setLanguage(langCode: string, langName: string) {
//     localStorage.setItem('selectedLanguage', langCode);
//     localStorage.setItem('selectedLanguageName', langName);
//     this.applyLanguage(langCode);
//   }

//   private applyLanguage(langCode: string) {
//     let attempts = 0;
//     const tryApply = () => {
//       const selectField: HTMLSelectElement | null = document.querySelector('.goog-te-combo');
//       if (selectField) {
//         selectField.value = langCode;
//         selectField.dispatchEvent(new Event('change'));
//         console.log(`✅ Language changed to: ${langCode}`);
//       } else if (attempts < 20) { // Retry for ~10 seconds
//         attempts++;
//         setTimeout(tryApply, 500);
//       } else {
//         console.warn('⚠️ Google Translate dropdown not found.');
//       }
//     };
//     tryApply();
//   }

//   applySavedLanguage() {
//     const savedLang = localStorage.getItem('selectedLanguage');
//     if (savedLang) {
//       setTimeout(() => {
//         this.applyLanguage(savedLang);
//       }, 500);
//     }
//   }

//   getSavedLanguageName(): string {
//     return localStorage.getItem('selectedLanguageName') || 'English';
//   }

// }

import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LanguageServiceService {

  constructor(private router: Router) {
    // Apply saved language after navigation
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.applySavedLanguage();
      }
    });
  }

  setLanguage(langCode: string, langName: string) {
    localStorage.setItem('selectedLanguage', langCode);
    localStorage.setItem('selectedLanguageName', langName);
    this.waitForGoogleTranslate(langCode);
  }

  private waitForGoogleTranslate(langCode: string) {
    if ((window as any).googleTranslateReady) {
      this.applyLanguage(langCode);
    } else {
      console.log('⏳ Waiting for Google Translate to load...');
      setTimeout(() => this.waitForGoogleTranslate(langCode), 300);
    }
  }

  private applyLanguage(langCode: string) {
    let attempts = 0;
    const tryApply = () => {
      const selectField: HTMLSelectElement | null = document.querySelector('.goog-te-combo');
      if (selectField) {
        selectField.value = langCode;
        selectField.dispatchEvent(new Event('change'));
        console.log(`✅ Language changed to: ${langCode}`);
      } else if (attempts < 40) { // Retry for ~12 seconds
        attempts++;
        setTimeout(tryApply, 300);
      } else {
        console.warn('⚠️ Google Translate dropdown not found.');
      }
    };
    tryApply();
  }

  private applySavedLanguage() {
    const savedLang = localStorage.getItem('selectedLanguage');
    if (savedLang) {
      this.waitForGoogleTranslate(savedLang);
    }
  }

  getSavedLanguageName(): string {
    return localStorage.getItem('selectedLanguageName') || 'English';
  }
}
