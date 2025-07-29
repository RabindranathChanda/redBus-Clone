namespace redBus_api.Model.DTOs
{
    public class VendorWithCaptchaDTO
    {
        public Vendor Vendor { get; set; } = null!;
        public string CaptchaToken { get; set; } = null!;
    }
}
