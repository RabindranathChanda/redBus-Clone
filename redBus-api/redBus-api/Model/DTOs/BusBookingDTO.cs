namespace redBus_api.Model.DTOs
{
    public class BusBookingDTO
    {
        public int BookingId { get; set; }
        public int UserId { get; set; }
        public DateTime BookingDate { get; set; }
        public int ScheduleId { get; set; }
        public int TotalPrice { get; set; }
        public int? CurrentPrice { get; set; }

        public string? PaymentStatus { get; set; }

        public BusScheduleDTO? BusSchedule { get; set; }
        public ICollection<BusBookingPassengerDTO>? BusBookingPassengers { get; set; }
    }
}
