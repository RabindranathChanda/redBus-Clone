# 🚍 redBus Clone – Full-Stack Bus Booking Web Application

A full-featured **bus booking web application** inspired by the redBus platform, built with **ASP.NET Core Web API** (backend) and **Angular 19** (frontend).  
This project replicates real-world booking functionalities with a **responsive UI**, **secure authentication**, and **role-based access** for users and vendors.

```
    ⚠️ This project is under development.
```
---

## 🔑 Key Features

### 👥 User & Vendor Authentication
- JWT-based login with **access and refresh token system**  
- **Role-based access control** for users and vendors  
- Session validation to prevent multiple logins with the same refresh token  
- **Google reCAPTCHA v3** integration for bot protection on login and signup  

### 🚌 Booking Management
- Smart booking form with **date/time pickers** and **dynamic dropdowns** for route selection  
- **Real-time fare calculation** and seat availability tracking  

### 🧩 Vendor Dashboard
- Vendors can **list buses**, manage schedules, and view bookings  
- Includes **form validation**, error handling, and toast notifications for user feedback  

### 🗄️ Database Integration
- Entity Framework models and DbContext for **Users, Buses, Bookings, and Transactions**  
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
> * Add your **Google reCAPTCHA v3 site key** in both the environment file as:
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

## 🧩 Project Highlights

* ✅ Clean architecture with separation of concerns
* 🔒 Secure JWT & refresh token flow
* 🧠 Google reCAPTCHA v3 integration for advanced bot protection
* 🌗 Responsive UI with dark mode
* 📧 SMTP-based email system
* 💬 Real-time feedback and validation

---

## 🧑‍💻 Author

**Rabindranath Chanda**
.NET & Angular Developer
📍 Kolkata, India
