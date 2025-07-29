export class SearchBus {
    fromLocationId: number = 0;
    fromLocation: string = '';
    toLocation: string = '';
    toLocationId: number = 0;
    travelDate: string = "";
}

export class ISearchBusResult {
    scheduleId: number = 0;
    busId: number = 0;
    vendorId: number = 0;
    vendorName: string = '';
    busName: string = '';
    busVehicleNo: string = '';
    busType: string = '';
    isAC: boolean = false;
    rating: number = 0;
    rattingCount: number = 0;
    totalSeats: number = 0;
    fromLocation: string = '';
    toLocation: string = '';
    departureDateTime: string = '';
    arrivalDateTime: string = '';
    scheduleDate: string = '';
    availableSeats: number = 0;
    pricePerSeat: number = 0;
}
export interface IScheduleData {
    scheduleId: number;
    busId: number;
    vendorId: number;
    vendorName: string;
    busName: string;
    busVehicleNo: string;
    busType: string;
    isAC: boolean;
    rating: number;
    rattingCount: number;
    totalSeats: number;
    fromLocationId: number;
    fromLocation: string;
    toLocationId: number;
    toLocation: string;
    departureDateTime: string;
    arrivalDateTime: string;
    scheduleDate: string;
    availableSeats: number;
    pricePerSeat: number;
}

export interface IBusScheduleDataForVendorSchedule {
    scheduleId: number;
    busId: number;
    vendorId: number;
    vendorName: string;
    busName: string;
    busType: string;
    busVehicleNo: string;
    isAC: boolean;
    totalSeats: number;
    availableSeats: number;
    pricePerSeat: number;
    fromLocation: string;
    toLocation: string;
    departureDateTime: string;
    arrivalDateTime: string;
    scheduleDate: string;
    scheduleStatus: string | null;
}

export class BusScheduleDataForVendorSchedule {
    scheduleId: number = 0;
    busId: number = 0;
    vendorId: number = 0;
    vendorName: string = '';
    busName: string = '';
    busType: string = '';
    busVehicleNo: string = '';
    isAC: boolean = false;
    totalSeats: number = 0;
    availableSeats: number = 0;
    pricePerSeat: number = 0;
    fromLocation: string = '';
    fromLocationId: number = 0;
    toLocation: string = '';
    toLocationId: number = 0;
    departureDateTime: string ='';
    arrivalDateTime: string = '';
    scheduleDate: string = '';
    scheduleStatus: string = 'Unactive';
}



export class Bus {
    busId: number = 0;
    busName: string = '';
    busVehicleNo: string = '';
    busType: string = '';
    isAC: boolean = false;
    totalSeats: number = 0;
    vendorId: number = 0;
}