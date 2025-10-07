using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace redBus_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CheckAuthStatusController : ControllerBase
    {
        [HttpPost]
        [Authorize(Roles = "User, Vendor")]
        public IActionResult CheckAuthStatus()
        {
            return Ok(new
            {
                isAuthenticated = true
            });
        }

    }
}
