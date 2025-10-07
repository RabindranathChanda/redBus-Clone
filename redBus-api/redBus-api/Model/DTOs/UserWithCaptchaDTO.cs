namespace redBus_api.Model.DTOs
{
    public class UserWithCaptchaDTO
    {
        public User User { get; set; } = null!;
        public string CaptchaToken { get; set; } = null!;
    }
}
