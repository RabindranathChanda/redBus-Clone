namespace redBus_api.Model.DTOs
{
    public class UserProfilePicUploadDTO
    {
        public int UserId { get; set; }
        public IFormFile? ImageFile { get; set; } 
    }
}
