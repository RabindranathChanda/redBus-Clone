using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace redBus_api.Model
{
    public class BusBooking
    {
        [Key]
        public int BookingId { get; set; }
        [Required]
        public int UserId { get; set; }

        public DateTime BookingDate { get; set; } = DateTime.Now;
        [Required]
        public int ScheduleId { get; set; }
        [Required]
        public int TotalPrice { get; set; }
        public int? CurrentPrice { get; set; }

        [Column(TypeName = "nvarchar(20)")]
        public string PaymentStatus { get; set; } = "Confirmed";
        public BusSchedule? BusSchedule { get; set; }

        // Navigation property - One booking has many Passengers
        public ICollection<BusBookingPassenger> BusBookingPassengers { get; set; } = [];
    }
}
