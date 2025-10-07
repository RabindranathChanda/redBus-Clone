using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace redBus_api.Model
{
    public class VendorProfilePic
    {
        [Key]
        public int Id { get; set; }

        [Required, ForeignKey("Vendor")]
        public int VendorId { get; set; }

        [Required]
        public byte[] ImageData { get; set; } = null!;

        public Vendor? Vendor { get; set; }
    }
}
