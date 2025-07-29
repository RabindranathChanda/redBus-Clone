import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {



  aboutLinks = [
    { text: 'About Us', href: environment.redBusLinks.aboutRedBus.aboutUs },
    { text: 'Investor Relations', href: environment.redBusLinks.aboutRedBus.investorRelations },
    { text: 'Contact Us', href: environment.redBusLinks.aboutRedBus.contactUs },
    { text: 'Mobile Version', href: environment.redBusLinks.aboutRedBus.mobile },
    { text: 'Sitemap', href: environment.redBusLinks.aboutRedBus.sitemap },
    { text: 'Offers', href: environment.redBusLinks.aboutRedBus.offers },
    { text: 'Careers', href: environment.redBusLinks.aboutRedBus.careers },
    { text: 'Values', href: environment.redBusLinks.aboutRedBus.values },
  ];

  infoLinks = [
    { text: 'Terms & Conditions', href: environment.redBusLinks.info.termsAndConditions },
    { text: 'Privacy Policy', href: environment.redBusLinks.info.privacyPolicy },
    { text: 'FAQ', href: environment.redBusLinks.info.faq },
    { text: 'Blog', href: environment.redBusLinks.info.blog },
    { text: 'Bus Operator Registration', href: environment.redBusLinks.info.busOperatorReg },
    { text: 'Agent Registration', href: environment.redBusLinks.info.agentReg },
    { text: 'Insurance Partner', href: environment.redBusLinks.info.insurancePartner },
    { text: 'User Agreement', href: environment.redBusLinks.info.userAgreement },
    { text: 'Primo', href: environment.redBusLinks.info.primo },
    { text: 'Bus Timetable', href: environment.redBusLinks.info.busTimetable },
  ];

  partnerLinks = [
    { text: 'Goibibo Bus', href: environment.redBusLinks.ourPartners.goibiboBus },
    { text: 'Goibibo Hotels', href: environment.redBusLinks.ourPartners.goibiboHotels },
    { text: 'MakeMyTrip Hotels', href: environment.redBusLinks.ourPartners.makemytripHotels },
  ];

  globalSites = [
    { text: 'India', href: environment.redBusLinks.globalSites.india },
    { text: 'Singapore', href: environment.redBusLinks.globalSites.singapore },
    { text: 'Malaysia', href: environment.redBusLinks.globalSites.malaysia },
    { text: 'Indonesia', href: environment.redBusLinks.globalSites.indonesia },
    { text: 'Peru', href: environment.redBusLinks.globalSites.peru },
    { text: 'Colombia', href: environment.redBusLinks.globalSites.colombia },
    { text: 'Cambodia', href: environment.redBusLinks.globalSites.cambodia },
    { text: 'Vietnam', href: environment.redBusLinks.globalSites.vietnam },
  ];

  socialLinks = [
    { icon: 'fab fa-facebook-f', href: environment.redBusLinks.social.facebook },
    { icon: 'fab fa-x-twitter', href: environment.redBusLinks.social.twitter },
    { icon: 'fab fa-instagram', href: environment.redBusLinks.social.instagram },
    { icon: 'fab fa-linkedin-in', href: environment.redBusLinks.social.linkedin },
  ];


  // Dynamically Rendering Images -----------
  redBusLogo: string = "/assets/images/redbus_logo.png";
  railLogo: string = "/assets/images/rail_logo.png";
}
