using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace redBus_api.Model.DTOs
{
    public class VendorProfilePicDTO
    {
        public int Id { get; set; }
        public int VendorId { get; set; }
        public byte[] ImageData { get; set; } = null!;

    }
}
