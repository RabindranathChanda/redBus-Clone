using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace redBus_api.Model
{
    public class BusBookingPassenger
    {
        [Key]
        public int PassengerId { get; set; }

        [Required]
        [ForeignKey("BookingId")]
        public int BookingId { get; set; }
        public BusBooking? Booking { get; set; }

        [Required, MaxLength(100)]
        public string PassengerName { get; set; } = null!;

        [Required, MaxLength(10)]
        public string MobileNo { get; set; } = null!;

        [Required]
        public int Age { get; set; }

        [Required, MaxLength(10)]
        public string Gender { get; set; } = null!;

        [Required, MaxLength(10)]
        public string? SeatNo { get; set; }

        [Required]
        public int Price { get; set; }

        [Required, MaxLength(20)]
        public string BookingStatus { get; set; } = null!;

        [MaxLength(20)]
        public string RefundStatus { get; set; } = string.Empty;

        public int? RefundableAmount { get; set; }
        public int? GstAmount { get; set; }
        public int? CancellationFee { get; set; }
        public DateTime? RefundDate { get; set; }
    }
}
