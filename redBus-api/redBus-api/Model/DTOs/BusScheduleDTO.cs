using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace redBus_api.Model.DTOs
{
    public class BusScheduleDTO
    {
        public int ScheduleId { get; set; }
        public int BusId { get; set; }
        public int VendorId { get; set; }
        public string VendorName { get; set; } = null!;

        public string BusName { get; set; } = null!;

        public string BusVehicleNo { get; set; } = null!;
        public string BusType { get; set; } = null!;
        public bool IsAC { get; set; }

        public int TotalSeats { get; set; }

        public int FromLocationId { get; set; }
        public string FromLocation { get; set; } = null!;
        public int ToLocationId { get; set; }
        public string ToLocation { get; set; } = null!;

        public DateTime DepartureDateTime { get; set; }
        public DateTime ArrivalDateTime { get; set; }
        public DateTime ScheduleDate { get; set; }
        public int AvailableSeats { get; set; }
        public int PricePerSeat { get; set; }
        public string? ScheduleStatus { get; set; }

    }
}
