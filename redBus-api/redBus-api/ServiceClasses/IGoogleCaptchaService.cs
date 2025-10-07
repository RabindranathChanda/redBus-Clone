namespace redBus_api.ServiceClasses
{
    public interface IGoogleCaptchaService
    {
        Task<bool> VerifyCaptchaAsync(string captchaToken);
    }
}
