# 🚍 redBus Clone – Full-Stack Bus Booking Web Application

A full-featured **bus booking web application** inspired by the redBus platform, built with **ASP.NET Core Web API** (backend) and **Angular 19** (frontend).  
This project replicates real-world booking functionalities with a **responsive UI**, **secure authentication**, and **role-based access** for users and vendors.

```

⚠️ Note: This project is licensed under MIT for educational and demonstration purposes.
Proper credit to the original author (Rabindra Nath Chanda) is required when reusing or 
redistributing this code.

````
---

## 🔑 Key Features

### 👥 User & Vendor Authentication
- JWT-based login with **access and refresh token system**  
- **Role-based access control** for users and vendors  
- **Prevention of multiple logins** with the same refresh token  
- Session validation for enhanced security  
- **Google reCAPTCHA v3** integration for bot protection on login and signup  

### 🚌 Booking Management
- Smart booking form with **date/time pickers** and **dynamic dropdowns** for route selection  
- **Real-time fare calculation** and seat availability tracking  
- Popup booking form with **auto-filled room/bus details** for faster booking  

### 🧩 Vendor Dashboard & Settings
- Vendors can **list buses**, manage schedules, and view bookings  
- **Payment & finance management**: total earnings overview and **withdrawal system** (once per day)  
- **Reusable settings UI** with error handling and toast notifications  
- Includes **form validation**, feedback messages, and responsive design  

### 🗄️ Database Integration
- Entity Framework models and DbContext. 
- Support for MSSQL with migration and database import options  

### 📬 Email Notification System
- Sends **confirmation emails** upon successful bookings  
- Auto-generated **tickets with detailed booking info**

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | Angular 19, TypeScript, HTML, CSS |
| **Backend** | ASP.NET Core Web API, C# |
| **Database** | Microsoft SQL Server (MSSQL) |
| **Security** | JWT Authentication, Google reCAPTCHA v3 |
| **Email Service** | Google SMTP |
| **Containerization** | Docker |

---

## ⚙️ Local Setup Guide

### 🖥️ Frontend Setup
```bash
cd ./redBus_App
npm install
ng serve
````

> **Note:**
>
> * Update the `apiURL` in `src/environments/environment.ts` & `src/environments/environment.development.ts` with your backend API endpoint.
> * Add your **Google reCAPTCHA v3 site key** in both environment files as:
>
>   ```typescript
>   export const environment = {
>     production: false,
>     apiUrl: 'https://localhost:7042/api',
>     reCaptchaSettings: {
>       SiteKey: 'YOUR_SITE_KEY'
>     }
>   };
>   ```

---

### 🧱 Backend Setup

```bash
cd ./redBus-api
```

Open `redBus-api.sln` in **Visual Studio 2022** and build the project.

> **Note:**
>
> * Add your **Mail ID and App Password** inside `appsettings.json`:
>
>   ```json
>   "Email": {
>     "Username": "yourmail@gmail.com",
>     "Password": "yourapppassword"
>   }
>   ```
>
> * Add your **SQL Server instance address**:
>
>   ```json
>   "AllowedHosts": "*",
>   "ConnectionStrings": {
>     "DBConnection": "Server=YOUR_SQL_SERVER\\SQLEXPRESS;Database=redBus;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
>   }
>   ```
>
> * Add **Jwt Configuration** as you want:
>
>   ```json
>   "Jwt": {
>     "Key": "redBus-Api-Super-Secret-Key-rabindra",
>     "Issuer": "redBus_Api",
>     "Audience": "redBus_Client"
>   }
>   ```
> * Add your **Google reCAPTCHA site key and secret key**:
>
>   ```json
>   "reCaptchaSettings": {
>     "SiteKey": "YOUR_SITE_KEY",
>     "SecretKey": "YOUR_SECRET_KEY"
>   }
>   ```
>
> * The backend validates reCAPTCHA tokens on login and signup endpoints for bot prevention.
>
> * The backend supports **Docker-based containerization**; ensure environment variables like `DB_PASSWORD` and `EMAIL_USERNAME` are set in your Docker setup.

---

### 🗃️ Database Setup

**Option 1: Import from Backup**

```bash
cd './DB Backup'
```

Import `redBus.bacpac` (not `redBus.old.bacpac`) into **SQL Server Management Studio (SSMS)**.
📖 [Reference Guide – Importing .bacpac Files](https://www.sqlshack.com/importing-a-bacpac-file-for-a-sql-database-using-ssms/)

**Option 2: Using Entity Framework**

```bash
Update-Database
```

---

## 🐳 Docker Setup
#### Database setup is not required for the docker setup. the Docker-Compose will take care of all things.
>   ```json
>       cd redBus-Clone
>   ```
> *   On Windows run build.ps1 script, it will handle everything.
>   ```json
>       .\build.ps1
>   ```
> *   On Linux/MacOS run build.sh script, it will handle everything.
>   ```json
>       chmod +x ./build.sh
>       .\build.sh
>   ```
> *   Stop running containers
>   ```json
>       docker compose down -v
>   ```
---

## 🧩 Project Highlights

* ✅ Clean architecture with separation of concerns
* 🔒 Secure JWT & refresh token flow with **single-session enforcement**
* 🧠 Google reCAPTCHA v3 integration for advanced bot protection
* 🌗 Responsive Angular UI with dark mode support
* 💰 Vendor payment management and **withdrawal system**
* 📧 SMTP-based email system for booking confirmations
* 💬 Real-time feedback, reusable components, and toast notifications
* 🐳 Backend ready for Docker containerization

---

## 🧑‍💻 Author

**Rabindra Nath Chanda**
.NET & Angular Developer
📍 Kolkata, India
