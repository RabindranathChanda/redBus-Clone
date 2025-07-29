using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace redBus_api.Model
{
    public class Vendor
    {
        [Key]
        public int VendorId { get; set; }

        [Column(TypeName = "nvarchar(100)")]
        public string VendorName { get; set; } = string.Empty;

        [Column(TypeName = "nvarchar(15)")]
        public string ContactNo { get; set; } = string.Empty;

        [Column(TypeName = "nvarchar(100)")]
        public string EmailId { get; set; } = string.Empty;

        [Column(TypeName = "nvarchar(50)")]
        public string District { get; set; } = string.Empty;

        [Column(TypeName = "nvarchar(50)")]
        public string State { get; set; } = string.Empty;

        [Column(TypeName = "nvarchar(15)")]
        public string PinCode { get; set; } = string.Empty;

        public string? RefreshToken { get; set; }
        public DateTime RefreshTokenExpiryTime { get; set; }

    }
}
