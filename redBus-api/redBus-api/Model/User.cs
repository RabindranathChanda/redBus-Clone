using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace redBus_api.Model
{
    public class User
    {
        [Key]
        public int UserId { get; set; }

        [Column(TypeName = "nvarchar(100)")]
        public string EmailId { get; set; } = null!;

        [Column(TypeName = "nvarchar(100)")]
        public string FullName { get; set; } = null!;

        [Column(TypeName = "nvarchar(100)")]
        public string Gender { get; set; } = null!;

        [Column(TypeName = "nvarchar(10)")]
        public string MobileNo { get; set; } = null!;

        [Column(TypeName = "nvarchar(20)")]
        public string Role { get; set; } = "User";  // Default to "User"

        [Column(TypeName = "nvarchar(255)")]
        public string Password { get; set; } = null!;
        public string? RefreshToken { get; set; }
        public DateTime RefreshTokenExpiryTime { get; set; }

    }
}
