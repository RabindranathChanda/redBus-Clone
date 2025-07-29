namespace redBus_api.Model.DTOs
{
    public class BusBookingPassengerDTO
    {
        public int PassengerId { get; set; }
        public int BookingId { get; set; }
        public string? PassengerName { get; set; }
        public string? MobileNo { get; set; }
        public int Age { get; set; }
        public string? Gender { get; set; }
        public string? SeatNo { get; set; }
        public int Price { get; set; }
        public string? BookingStatus { get; set; }
        public string? RefundStatus { get; set; }
        public int? RefundableAmount { get; set; }
        public int? GstAmount { get; set; }
        public int? CancellationFee { get; set; }
        public DateTime? RefundDate { get; set; }
    }
}
