using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using redBus_api.Data;
using redBus_api.ServiceClasses;

namespace redBus_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LogoutController : ControllerBase
    {
        private readonly IAuthenticationService _authenticationService;
        private readonly redBusDBContext _context;
        public LogoutController(IAuthenticationService authenticationService, redBusDBContext context)
        {
            _authenticationService = authenticationService;
            _context = context;
        }

        [HttpPost("User")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> LogoutUser()
        {
            var refreshToken = Request.Cookies["RefreshToken"];
            if (string.IsNullOrWhiteSpace(refreshToken)) return Unauthorized("Refresh token is required");

            await _authenticationService.InvalidateUserRefreshToken(refreshToken);

            Response.Cookies.Delete("AccessToken");
            Response.Cookies.Delete("RefreshToken");

            return Ok(new { message = "Logout Successfull" });

        }

        [HttpPost("Vendor")]
        [Authorize(Roles = "Vendor")]
        public async Task<IActionResult> LogoutVendor()
        {
            var refreshToken = Request.Cookies["RefreshToken"];
            if (string.IsNullOrWhiteSpace(refreshToken)) return BadRequest("Refresh token is required");

            await _authenticationService.InvalidateVendorRefreshToken(refreshToken);

            Response.Cookies.Delete("AccessToken");
            Response.Cookies.Delete("RefreshToken");

            return Ok(new { message = "Logout Successfull" });

        }

        [HttpPost("ClearCookie")]
        public async Task<IActionResult> ClearCookie([FromQuery] int id, [FromQuery] bool user)
        {
            if (user)
            {
                var existingUser = await _context.User
                    .FirstOrDefaultAsync(t => t.UserId == id);
                if (existingUser != null)
                {
                    existingUser.RefreshToken = null;
                    existingUser.RefreshTokenExpiryTime = DateTime.MinValue;
                }
            }
            else
            {
                var existingVendor = await _context.Vendor
                    .FirstOrDefaultAsync(t => t.VendorId == id);
                if (existingVendor != null)
                {
                    existingVendor.RefreshToken = null;
                    existingVendor.RefreshTokenExpiryTime = DateTime.MinValue;
                }

            }

            await _context.SaveChangesAsync();

            HttpContext.Response.Cookies.Delete("AccessToken");
            HttpContext.Response.Cookies.Delete("RefreshToken");

            return Ok(new { message = "Logout Successfull" });
        }
    }
}
