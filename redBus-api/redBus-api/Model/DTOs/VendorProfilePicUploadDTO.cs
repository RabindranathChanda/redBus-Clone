namespace redBus_api.Model.DTOs
{
    public class VendorProfilePicUploadDTO
    {
        public int VendorId { get; set; }
        public IFormFile? ImageFile { get; set; }

    }
}
