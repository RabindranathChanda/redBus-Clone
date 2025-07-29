namespace redBus_api.ServiceClasses
{
    public interface IAuthenticationService
    {
        Task InvalidateUserRefreshToken(string refreshToken);
        Task InvalidateVendorRefreshToken(string refreshToken);
    }
}
