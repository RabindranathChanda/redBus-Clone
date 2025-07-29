using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace redBus_api.Model
{
    public class BusSchedule
    {
        [Key]
        public int ScheduleId { get; set; }
        public int BusId { get; set; }
        public int VendorId { get; set; }
        public string VendorName { get; set; } = null!;

        [Column(TypeName = "nvarchar(100)")]
        public string BusName { get; set; } = null!;

        [Column(TypeName = "nvarchar(20)")]
        public string BusVehicleNo { get; set; } = null!;

        [Column(TypeName = "nvarchar(50)")]
        public string BusType { get; set; } = "Normal";

        public bool IsAC { get; set; } = false;
        public int TotalSeats { get; set; }

        public int FromLocationId { get; set; }
        public string FromLocation { get; set; } = null!;
        public int ToLocationId { get; set; }
        public string ToLocation { get; set; } = null!;

        public DateTime DepartureDateTime { get; set; }
        public DateTime ArrivalDateTime { get; set; }

        [Column(TypeName = ("date"))]
        public DateTime ScheduleDate { get; set; }

        public int AvailableSeats { get; set; }
        public int PricePerSeat { get; set; }
        public string? ScheduleStatus { get; set; }

    }
}
