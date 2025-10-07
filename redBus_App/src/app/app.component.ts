import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from "./footer/footer.component";
import { HttpClientModule } from '@angular/common/http';
import { filter, map } from 'rxjs';
import { UserDashboardComponent } from "./profile/user/user-dashboard/user-dashboard.component";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, HeaderComponent, FooterComponent,
    HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'redBus_App';
  showFooter = true;
  showHeader = true;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let route = this.activatedRoute;
        while (route.firstChild) route = route.firstChild;
        const routeData = route.snapshot.data;
        return {
          showFooter: routeData['showFooter'],
          showHeader: routeData['showHeader']
        }
      })
    ).subscribe(show => {
      this.showFooter = !!show.showFooter;
      this.showHeader = !!show.showHeader;
    });
  }


}

