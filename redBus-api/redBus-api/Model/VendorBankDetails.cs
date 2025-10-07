using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace redBus_api.Model
{
    public class VendorBankDetails
    {
        [Key]
        public int VendorBankDetailsId { get; set; }

        [ForeignKey("Vendor"), Required]
        public int VendorId { get; set; }

        [Column(TypeName = "nvarchar(30)")]
        public string? BankAccountNumber { get; set; }

        [Column(TypeName = "nvarchar(11)")]
        public string? IFSCCode { get; set; }

        [Column(TypeName = "nvarchar(100)")]
        public string? BankName { get; set; }

        [Column(TypeName = "nvarchar(50)")]
        public string? AccountHolderName { get; set; }

        [Column(TypeName = "nvarchar(30)")]
        public string? UPIID { get; set; }

        public bool IsBankVerified { get; set; } = false;
        public DateTime? VerificationDate { get; set; }

        [Column(TypeName = "nvarchar(20)")]
        public string? PAN { get; set; }

        public Vendor Vendor { get; set; } = null!;

    }
}
