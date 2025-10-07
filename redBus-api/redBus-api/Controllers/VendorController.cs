using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Linq;
using redBus_api.Data;
using redBus_api.Model;
using redBus_api.Model.DTOs;
using redBus_api.ServiceClasses;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace redBus_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VendorController : ControllerBase
    {
        private readonly redBusDBContext _context;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;
        private readonly IGoogleCaptchaService _googleCaptchaService;

        public VendorController(redBusDBContext context, IMapper mapper, IConfiguration configuration, IGoogleCaptchaService googleCaptchaService)
        {
            _context = context;
            _mapper = mapper;
            _configuration = configuration;
            _googleCaptchaService = googleCaptchaService;
        }

        // GET: api/Vendor
        [HttpGet]
        [Authorize(Roles = "Vendor")]
        public async Task<ActionResult<IEnumerable<VendorDTO>>> GetAllVendor()
        {
            return Ok(_mapper.Map<IEnumerable<VendorDTO>>(await _context.Vendor
                .Include(vpp => vpp.VendorProfilePic)
                .Include(vbd => vbd.VendorBankDetails)
                .ToListAsync()));
        }

        // GET: api/Vendor/5
        // GET: api/Vendor/me
        //[HttpGet("{id}")]
        [HttpGet("me")]
        [Authorize(Roles = "Vendor")]
        public async Task<ActionResult<VendorDTO>> GetVendor()
        //public async Task<ActionResult<VendorDTO>> GetSpeVendor()
        {
            var id = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var vendor = await _context.Vendor
                //.Include(vpp => vpp.VendorProfilePic)    
                .Include(vbd => vbd.VendorBankDetails)
                .FirstOrDefaultAsync(v => v.VendorId == id);

            if (vendor == null)
            {
                //return NotFound();
                return Ok(new
                {
                    message = "No Vendor!",
                });
            }

            return Ok(_mapper.Map<VendorDTO>(vendor));
        }

        // PUT: api/Vendor/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Vendor")]
        public async Task<IActionResult> PutVendor(int id, Vendor vendor)
        {
            if (id != vendor.VendorId)
            {
                return BadRequest();
            }

            _context.Entry(vendor).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!VendorExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Vendor
        [HttpPost]
        public async Task<ActionResult<Vendor>> PostVendor(VendorWithCaptchaDTO vendorWithCaptchaDTOModel)
        {
            var vendor = vendorWithCaptchaDTOModel.Vendor;
            var captchaToken = vendorWithCaptchaDTOModel.CaptchaToken;

            if (string.IsNullOrEmpty(captchaToken) || !await _googleCaptchaService.VerifyCaptchaAsync(captchaToken))
            {
                return BadRequest("Captcha Validation failed");
            }

            var existingVendor = await _context.Vendor
                .Where(u => u.EmailId == vendor.EmailId || u.ContactNo == vendor.ContactNo)
                .FirstOrDefaultAsync();

            if (existingVendor != null)
            {
                if (existingVendor.EmailId == vendor.EmailId)
                    return BadRequest("Email Already Exists.");
                if (existingVendor.ContactNo == vendor.ContactNo)
                    return BadRequest("Mobile No. Already Exists.");
            }


            _context.Vendor.Add(vendor);

            // Generate JWT Access Token for the vendor
            var accessToken = GenerateJwtToken(vendor);

            // Generate Refresh Token
            var refreshToken = GenerateRefreshToken();
            vendor.RefreshToken = refreshToken;
            vendor.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

            await _context.SaveChangesAsync();

            // Store accessToken
            HttpContext.Response.Cookies.Append("AccessToken", accessToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict
            });

            // Store refreshToken
            HttpContext.Response.Cookies.Append("RefreshToken", refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(7)
            });

            return Ok(new
            {
                message = "Vendor Registered Successfull",
                VENDOR = new
                {
                    vendor.VendorId,
                    vendor.VendorName,
                    vendor.EmailId,
                    vendor.ContactNo,
                    vendor.District,
                    vendor.State,
                    vendor.PinCode,
                }
            });
        }

        // DELETE: api/Vendor/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Vendor")]
        public async Task<IActionResult> DeleteVendor(int id)
        {
            var tokenVendorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            if (tokenVendorId != id) return Unauthorized("You are not Authorized to delete this account.");

            var vendor = await _context.Vendor.FindAsync(id);
            if (vendor == null)
            {
                return NotFound();
            }

            _context.Vendor.Remove(vendor);
            await _context.SaveChangesAsync();
            await _context.Database.ExecuteSqlRawAsync("EXEC ReseedVendorIdentity");
            HttpContext.Response.Cookies.Delete("AccessToken");
            HttpContext.Response.Cookies.Delete("RefreshToken");
            return NoContent();
        }

        private bool VendorExists(int id)
        {
            return _context.Vendor.Any(e => e.VendorId == id);
        }

        private string GenerateRefreshToken()
        {
            var randomBytes = new byte[64];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomBytes);
                return Convert.ToBase64String(randomBytes);
            }
        }

        private string GenerateJwtToken(Vendor vendor)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not found in configuration.");
            var key = Encoding.ASCII.GetBytes(jwtKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, vendor.VendorId.ToString()),
                    new Claim(ClaimTypes.Name, vendor.VendorName),
                    new Claim(ClaimTypes.Email, vendor.EmailId),
                    new Claim(ClaimTypes.Role, "Vendor")
                }),
                Expires = DateTime.UtcNow.AddMinutes(15), // Access Token lifespan
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
