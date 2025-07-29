export class MyBookings {
    bookingId: number = 0;
    userId: number = 0;
    bookingDate: string = '';
    scheduleId: number = 0;
    totalPrice: number = 0;
    currentPrice: number = 0;
    paymentStatus: string = '';
    busSchedule: BusSchedule = new BusSchedule();
    busBookingPassengers: BusBookingPassenger[] = [];
}

export class BusSchedule {
    scheduleId: number = 0;
    busId: number = 0;
    vendorId: number = 0;
    vendorName: string = '';
    busName: string = '';
    busVehicleNo: string = '';
    busType: string = '';
    isAC: boolean = false;
    totalSeats: number = 0;
    fromLocationId: number = 0;
    fromLocation: string = '';
    toLocationId: number = 0;
    toLocation: string = '';
    departureDateTime: string = '';
    arrivalDateTime: string = '';
    scheduleDate: string = '';
    availableSeats: number = 0;
    pricePerSeat: number = 0;
    scheduleStatus: string | null = null;
}

export class BusBookingPassenger {
    passengerId: number = 0;
    bookingId: number = 0;
    passengerName: string = '';
    mobileNo: string = '';
    age: number = 0;
    gender: string = '';
    seatNo: string = '';
    price: number = 0;
    bookingStatus: string = '';
    refundStatus: string = '';
    RefundableAmount: number = 0;
    GstAmount: number = 0;
    CancellationFee: number = 0;
    RefundDate: string = '';
    selected: boolean = false;
}
