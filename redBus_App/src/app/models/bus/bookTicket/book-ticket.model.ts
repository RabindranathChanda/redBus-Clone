export class BookTicket {
    userId: number = 0;
    bookingDate: Date = new Date();
    scheduleId: number = 0;
    totalPrice: number = 0;
    currentPrice: number =0;
    paymentStatus: string = "";
    busBookingPassengers: BusBookingPassenger[] = [];
}

export class BusBookingPassenger {
    passengerName: string = "";
    mobileNo: string = "";
    age: number = 0;
    gender: string = "";
    seatNo: string = "";
    price: number = 0;
    bookingStatus: string = '';
}

