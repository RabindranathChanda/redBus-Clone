USE redBus;
GO

-- Insert Locations
INSERT INTO Locations (LocationName, LocationSub, LocationCode, LocationType) VALUES
('Kolkata', 'Westbengal, India', 'KOL', 'City'),
('Lucknow', 'Uttar Pradesh, India', 'UP', 'Urban'),
('Hydrabad', 'Telangana, India', 'HYD', 'City'),
('Bangalore', 'Karnataka, India', 'BLR', 'Urban');

-- Insert Vendors
INSERT INTO Vendors (vendorName, contactNo, emailId) VALUES
('Royal Travels', '9876543210', 'royal@example.com'),
('Speed Tours', '9123456789', 'speed@example.com');

-- Insert Users
INSERT INTO Users (userName, emailId, fullName, role, passwordHash) VALUES
('john_doe', 'john@example.com', 'John Doe', 'customer', 'hashed_password_123'),
('admin_user', 'admin@example.com', 'Admin User', 'admin', 'hashed_password_admin');

-- Insert Buses
INSERT INTO Buses (busName, busVehicleNo, totalSeats, vendorId) VALUES
('Volvo AC', 'MH01AB1234', 40, 1),
('Sleeper Coach', 'MH02XY5678', 30, 2);

-- Insert BusSchedules
INSERT INTO BusSchedules (busId, fromLocationId, toLocationId, departureTime, arrivalTime, availableSeats, pricePerSeat, scheduleDate) VALUES
(1, 1, 2, '2025-04-27 08:00:00', '2025-04-27 12:00:00', 40, 500, '2025-04-27'),
(2, 2, 3, '2025-04-28 10:00:00', '2025-04-28 18:00:00', 30, 800, '2025-04-28');

-- Insert BusBooking
INSERT INTO BusBookings (userId, bookingDate, scheduleId, totalPrice, status) VALUES
(1, GETDATE(), 1, 1000, 'confirmed'),
(1, GETDATE(), 2, 800, 'pending');

-- Insert BusBookingPassengers
INSERT INTO BusBookingPassengers (bookingId, passengerName, age, gender, seatNo, price) VALUES
(1, 'John Doe', 30, 'Male', 'A1', 500),
(1, 'Jane Doe', 28, 'Female', 'A2', 500),
(2, 'John Doe', 30, 'Male', 'B1', 800);
