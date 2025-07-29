using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace redBus_api.Model
{
    public class Bus
    {
        [Key]
        public int BusId { get; set; }

        [Column(TypeName = "nvarchar(100)")]
        public string BusName { get; set; } = null!;

        [Column(TypeName = "nvarchar(20)")]
        public string BusVehicleNo { get; set; } = null!;

        [Column(TypeName = "nvarchar(50)")]
        public string BusType { get; set; } = "Normal";

        public bool IsAC { get; set; } = false;

        public int TotalSeats { get; set; }
        public int VendorId { get; set; }
        public int Rating { get; set; }
        public int RattingCount { get; set; }
    }
}
