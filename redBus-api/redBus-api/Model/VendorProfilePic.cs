using System.ComponentModel.DataAnnotations;

namespace redBus_api.Model
{
    public class VendorProfilePic
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int VendorId { get; set; }

        [Required]
        public byte[] ImageData { get; set; } = null!;
    }
}
