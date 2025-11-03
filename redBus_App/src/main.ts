import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Interceptor } from './app/services/auth/interceptor/interceptor';

fetch('/assets/runtime-config.json')
    .then(response => response.json())
    .then(config => {
        (window as any).__env = config;

        bootstrapApplication(AppComponent, appConfig)
            .catch(err => console.error(err));
    })
    .catch(err => {
        console.error('Failed to load runtime config', err);
        bootstrapApplication(AppComponent, appConfig)
            .catch(err => console.error(err));
    });
