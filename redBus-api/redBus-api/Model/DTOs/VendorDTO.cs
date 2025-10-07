using System.ComponentModel.DataAnnotations;

namespace redBus_api.Model.DTOs
{
    public class VendorDTO
    {
        public int? VendorId { get; set; }
        public string VendorName { get; set; } = string.Empty;
        public string ContactNo { get; set; } = string.Empty;
        public string EmailId { get; set; } = string.Empty;   // match entity
        public string District { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string PinCode { get; set; } = string.Empty;

        public VendorProfilePicDTO? VendorProfilePic { get; set; }
        public VendorBankDetailsDTO? VendorBankDetails { get; set; }
    }
}
