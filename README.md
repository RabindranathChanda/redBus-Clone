# redBus Clone – Bus Booking Web Application

I developed a fully functional redBus clone, a bus booking web application, using ASP.NET Core Web API for the backend and Angular 19 for the frontend. The project simulates the core features of the redBus platform with a responsive UI and secure booking process.

🔧 Key Features Implemented:

    User and Vendor Authentication:

        JWT-based login and refresh token system.

        Separate login panels and role-based access control for users and vendors.

        Session validation to prevent multiple logins with the same refresh token.

    Booking Form with Smart UI:

        Date picker, time picker, and dropdowns for source/destination selection.

        Real-time fare calculation and seat availability display.

        Fully responsive design with dark mode support.

    Database Integration:

        Models and DbContext generated for managing users, buses, bookings, and transactions.

    Email Notification System:

        Confirmation emails sent on successful booking using SMTP.

        Auto-generated ticket with booking details.

    Vendor Panel:

        Vendors can list buses, manage schedules, and view bookings.

        Form validation and feedback mechanisms in place for error handling.

    Responsive UI:

        Designed using Angular with CSS for responsiveness.

        Dynamic form behavior with loading indicators and toast notifications.

⚙️ Tech Stack:

    Frontend: Angular 19, TypeScript, HTML, CSS

    Backend: ASP.NET Core Web API, C#

    Database: MSSQL

    Tools: Visual Studio, Postman, VS Code