using System.ComponentModel.DataAnnotations;

namespace redBus_api.Model.DTOs
{
    public class VendorBankDetailsDTO
    {
        public int? VendorBankDetailsId { get; set; }

        public string BankAccountNumber { get; set; } = string.Empty;
        public string IFSCCode { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;
        public string AccountHolderName { get; set; } = string.Empty;
        public string UPIID { get; set; } = string.Empty;
        public bool IsBankVerified { get; set; }
        public DateTime? VerificationDate { get; set; }
        public string PAN { get; set; } = string.Empty;

        public int VendorId { get; set; }

    }
}