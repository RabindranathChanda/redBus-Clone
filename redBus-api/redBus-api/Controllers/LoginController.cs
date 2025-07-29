using Microsoft.AspNetCore.Components.Server.ProtectedBrowserStorage;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using redBus_api.Data;
using redBus_api.Model;
using redBus_api.ServiceClasses;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Mail;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace redBus_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly redBusDBContext _context;
        private readonly IConfiguration _configuration;
        private readonly ResetTokenBlacklistStore _tokenBlacklist;
        private static Dictionary<string, (string OtpHash, DateTime Expiry)> otpStore = new();

        public LoginController(redBusDBContext context, IConfiguration configuration, ResetTokenBlacklistStore tokenBlacklist)
        {
            _context = context;
            _configuration = configuration;
            _tokenBlacklist = tokenBlacklist;
        }

        // POST: api/Login/User
        [HttpPost("User")]
        public async Task<IActionResult> UserLogin([FromQuery] string emailId, [FromQuery] string password)
        {
            var existingUser = await _context.User
                .FirstOrDefaultAsync(u => u.EmailId == emailId);

            if (existingUser == null)
                return BadRequest("Invalid email or password.");

            //if (existingUser.RefreshToken != null && existingUser.RefreshTokenExpiryTime >= DateTime.UtcNow) return Conflict("User Already Logged In");

            var passwordHasher = new PasswordHasher<User>();
            var verifyPassword = passwordHasher.VerifyHashedPassword(existingUser, existingUser.Password, password);

            if (verifyPassword != PasswordVerificationResult.Success) return BadRequest("Invalid email or password.");


            var jwtToken = GenerateJwtToken(existingUser);
            var refreshToken = GenerateRefreshToken();
            var refreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

            existingUser.RefreshToken = refreshToken;
            existingUser.RefreshTokenExpiryTime = refreshTokenExpiryTime;
            await _context.SaveChangesAsync();

            // Store accessToken
            HttpContext.Response.Cookies.Append("AccessToken", jwtToken, new CookieOptions
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
                Token = jwtToken,
                RefreshToken = refreshToken,
                message = "User Login Successful",
                USER = new
                {
                    existingUser.UserId,
                    existingUser.EmailId,
                    existingUser.FullName,
                    existingUser.Gender,
                    existingUser.MobileNo,
                }
            });
        }

        [HttpPost("Vendor")]
        public IActionResult VendorLogin([FromQuery] string emailId)
        {
            var vendor = _context.Vendor.FirstOrDefault(v => v.EmailId == emailId);
            if (vendor == null)
                return BadRequest("Vendor not found");
            //if (vendor.RefreshTokenExpiryTime >= DateTime.UtcNow)
            //    return BadRequest("Vendor Already Logged In");

            var otp = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
            var hashedOtp = ComputeSha256Hash(otp);

            otpStore[emailId] = (hashedOtp, DateTime.UtcNow.AddMinutes(5));

            SendEmail(emailId, "2FA OTP for Vendor - Login | redBus - Vendor Portal", $"Your OTP for login is {otp}. Valid for 5 minutes <br><strong>Do Not Share OTP's with Others.</strong>");

            return Ok(new { message = "OTP sent to email" });
        }

        [HttpPost("Vendor/ResendOTP")]
        public IActionResult VendorLoginResendOTP([FromQuery] string emailId)
        {
            var vendor = _context.Vendor.FirstOrDefault(v => v.EmailId == emailId);
            if (vendor == null)
                return BadRequest("Vendor not found");

            otpStore.Remove(emailId);

            var otp = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
            var hashedOtp = ComputeSha256Hash(otp);

            otpStore[emailId] = (hashedOtp, DateTime.UtcNow.AddMinutes(5));

            SendEmail(emailId, "2FA OTP for Vendor - Login | redBus - Vendor Portal", $"Your OTP for login is {otp}. <br><strong>Do Not Share OTP's with Others.</strong>");

            return Ok(new { message = "OTP sent to email" });
        }

        [HttpPost("Vendor/Verify")]
        public async Task<IActionResult> VerifyVendorOtp([FromQuery] string otp, [FromQuery] string emailId)
        {
            if (!otpStore.TryGetValue(emailId, out var stored) || stored.Expiry < DateTime.UtcNow)
                return BadRequest("OTP Expired or Wrong");

            var hashedInputOtp = ComputeSha256Hash(otp);
            if (hashedInputOtp != stored.OtpHash)
                return BadRequest("Invalid OTP.");

            otpStore.Remove(emailId);


            // After OTP verification, retrieve the vendor from the database using the provided emailId
            var vendor = _context.Vendor.FirstOrDefault(v => v.EmailId == emailId);
            if (vendor == null)
                return BadRequest("Vendor not found");

            // Generate JWT token for the vendor after OTP verification
            var jwtToken = GenerateJwtToken(vendor);
            var refreshToken = GenerateRefreshToken();
            var refreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

            vendor.RefreshToken = refreshToken;
            vendor.RefreshTokenExpiryTime = refreshTokenExpiryTime;
            await _context.SaveChangesAsync();

            // Store accessToken
            HttpContext.Response.Cookies.Append("AccessToken", jwtToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
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
                Token = jwtToken,
                RefreshToken = refreshToken,
                message = "Vendor Login Successful",
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


        private string GenerateRefreshToken()
        {
            var randomBytes = new byte[64];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomBytes);
                return Convert.ToBase64String(randomBytes);
            }
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not found in configuration.");
            var key = Encoding.ASCII.GetBytes(jwtKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                    new Claim(ClaimTypes.Name, user.FullName),
                    new Claim(ClaimTypes.Email, user.EmailId),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddMinutes(15),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
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
                Expires = DateTime.UtcNow.AddMinutes(15),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private string ComputeSha256Hash(string rawData)
        {
            using (var sha256 = SHA256.Create())
            {
                byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(rawData));
                var builder = new StringBuilder();
                foreach (var b in bytes)
                    builder.Append(b.ToString("x2")); // hex string
                return builder.ToString();
            }
        }
        private void SendEmail(string to, string subject, string body)
        {
            using var smtpClient = new SmtpClient("smtp.gmail.com", 587)
            {
                Credentials = new NetworkCredential(_configuration["Email:Username"], _configuration["Email:Password"]),
                EnableSsl = true
            };

            var mail = new MailMessage
            {
                From = new MailAddress(_configuration["Email:Username"]),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            mail.To.Add(to);

            try
            {
                smtpClient.Send(mail);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Email send failed: " + ex.Message);
            }
        }

    }
}
