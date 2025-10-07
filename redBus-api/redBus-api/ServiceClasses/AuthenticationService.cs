using Microsoft.EntityFrameworkCore;
using redBus_api.Data;

namespace redBus_api.ServiceClasses
{
    public class AuthenticationService : IAuthenticationService
    {
        private readonly redBusDBContext _context;

        public AuthenticationService(redBusDBContext context)
        {
            _context = context;
        }

        public async Task InvalidateUserRefreshToken(string refreshToken)
        {
            var tokenRecord = await _context.User
                .FirstOrDefaultAsync(t => t.RefreshToken == refreshToken);
            if (tokenRecord != null)
            {
                tokenRecord.RefreshToken = null;
                tokenRecord.RefreshTokenExpiryTime = DateTime.MinValue;
                await _context.SaveChangesAsync();

            }
        }
        public async Task InvalidateVendorRefreshToken(string refreshToken)
        {
            var tokenRecord = await _context.Vendor
                .FirstOrDefaultAsync(t => t.RefreshToken == refreshToken);
            if (tokenRecord != null)
            {
                tokenRecord.RefreshToken = null;
                tokenRecord.RefreshTokenExpiryTime = DateTime.MinValue;
                await _context.SaveChangesAsync();
            }
        }
    }
}
