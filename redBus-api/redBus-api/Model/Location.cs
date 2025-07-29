using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace redBus_api.Model
{
    public class Location
    {
        [Key]
        public int LocationId { get; set; }

        [Required]
        [MaxLength(100)]
        public string LocationName { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string LocationSub { get; set; } = null!;

        [Required]
        [MaxLength(20)]
        public string LocationCode { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string LocationType { get; set; } = null!;
    }
}
