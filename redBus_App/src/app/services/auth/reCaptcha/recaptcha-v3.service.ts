import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecaptchaV3Service {
  private siteKey = `${environment.reCaptchaSettings.SiteKey}`;
  private scriptLoaded = false;
  private loadPromise: Promise<void> | null = null;

  constructor() { }

  private loadScript(): Promise<void> {
    if (this.scriptLoaded) {
      return Promise.resolve();
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise<void>((resolve, reject) => {
      if (document.getElementById('recaptcha-v3-script')) {
        this.scriptLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'recaptcha-v3-script';
      script.src = `https://www.google.com/recaptcha/api.js?render=${this.siteKey}`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };

      script.onerror = () => {
        reject('Failed to load reCAPTCHA');
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  execute(action: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.loadScript();

        (window as any).grecaptcha.ready(() => {
          (window as any).grecaptcha
            .execute(this.siteKey, { action })
            .then((token: string) => {
              resolve(token);
            })
            .catch((error: any) => {
              reject(error);
            });
        })
      } catch (err) {
        reject(err);
      }
    });
  }
}
