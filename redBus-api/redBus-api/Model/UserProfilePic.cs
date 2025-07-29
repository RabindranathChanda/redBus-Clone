using System.ComponentModel.DataAnnotations;

namespace redBus_api.Model
{
    public class UserProfilePic
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public byte[] ImageData { get; set; } = null!;

    }
}
