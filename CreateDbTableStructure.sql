-- Create Database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'redBus')
BEGIN
    CREATE DATABASE redBus;
END
GO

USE redBus;
GO

-- Locations Table
IF OBJECT_ID('Locations', 'U') IS NULL
BEGIN
CREATE TABLE Locations (
    locationId INT IDENTITY(1,1) PRIMARY KEY,
    locationName NVARCHAR(100) NOT NULL,
    locationCode NVARCHAR(20) NOT NULL,
    locationType NVARCHAR(50) NOT NULL
);
END
GO

-- Users Table
IF OBJECT_ID('Users', 'U') IS NULL
BEGIN
CREATE TABLE Users (
    userId INT IDENTITY(1,1) PRIMARY KEY,
    userName NVARCHAR(50) NOT NULL,
    emailId NVARCHAR(100) NOT NULL UNIQUE,
    fullName NVARCHAR(100) NOT NULL,
    role NVARCHAR(20) DEFAULT 'customer', -- admin / customer / driver
    createdDate DATETIME DEFAULT GETDATE(),
    updatedDate DATETIME DEFAULT GETDATE(),
    passwordHash NVARCHAR(255) NOT NULL,
    projectName NVARCHAR(100),
    refreshToken NVARCHAR(255),
    refreshTokenExpiryTime DATETIME,
    status NVARCHAR(20) DEFAULT 'active' -- active / inactive / banned
);
END
GO

-- Vendors Table
IF OBJECT_ID('Vendors', 'U') IS NULL
BEGIN
CREATE TABLE Vendors (
    vendorId INT IDENTITY(1,1) PRIMARY KEY,
    vendorName NVARCHAR(100) NOT NULL,
    contactNo NVARCHAR(15) NOT NULL,
    emailId NVARCHAR(100) NOT NULL UNIQUE,
    status NVARCHAR(20) DEFAULT 'active' -- active / inactive
);
END
GO

-- Buses Table
IF OBJECT_ID('Buses', 'U') IS NULL
BEGIN
CREATE TABLE Buses (
    busId INT IDENTITY(1,1) PRIMARY KEY,
    busName NVARCHAR(100) NOT NULL,
    busVehicleNo NVARCHAR(20) NOT NULL UNIQUE,
    totalSeats INT NOT NULL,
    vendorId INT NOT NULL,
    status NVARCHAR(20) DEFAULT 'active', -- active / maintenance / retired
);
END
GO

-- BusSchedules Table
IF OBJECT_ID('BusSchedules', 'U') IS NULL
BEGIN
CREATE TABLE BusSchedules (
    scheduleId INT IDENTITY(1,1) PRIMARY KEY,
    busId INT NOT NULL,
    fromLocationId INT NOT NULL,
    toLocationId INT NOT NULL,
    departureTime DATETIME NOT NULL,
    arrivalTime DATETIME NOT NULL,
    availableSeats INT NOT NULL,
    pricePerSeat DECIMAL(10,2) NOT NULL,
    scheduleDate DATE NOT NULL,
    status NVARCHAR(20) DEFAULT 'active', -- active / cancelled / completed
);
END
GO

-- BusBooking Table
IF OBJECT_ID('BusBooking', 'U') IS NULL
BEGIN
CREATE TABLE BusBooking (
    bookingId INT IDENTITY(1,1) PRIMARY KEY,
    userId INT NOT NULL,
    bookingDate DATETIME DEFAULT GETDATE(),
    scheduleId INT NOT NULL,
    totalPrice DECIMAL(10,2) NOT NULL,
    status NVARCHAR(20) DEFAULT 'pending', -- confirmed / cancelled / pending
);
END
GO

-- BusBookingPassengers Table
IF OBJECT_ID('BusBookingPassengers', 'U') IS NULL
BEGIN
CREATE TABLE BusBookingPassengers (
    passengerId INT IDENTITY(1,1) PRIMARY KEY,
    bookingId INT NOT NULL,
    passengerName NVARCHAR(100) NOT NULL,
    age INT NOT NULL,
    gender NVARCHAR(10) NOT NULL, -- male / female / other
    seatNo NVARCHAR(10) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
);
END
GO
