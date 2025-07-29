using Microsoft.AspNetCore.Authorization;
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
    public class ResetPasswordController : ControllerBase
    {
        private readonly redBusDBContext _context;
        private readonly IConfiguration _configuration;
        private readonly ResetTokenBlacklistStore _tokenBlacklist;
        private static Dictionary<string, (string OtpHash, DateTime Expiry)> otpStore = new();

        public ResetPasswordController(redBusDBContext context, IConfiguration configuration, ResetTokenBlacklistStore tokenBlacklist)
        {
            _context = context;
            _configuration = configuration;
            _tokenBlacklist = tokenBlacklist;
        }

        [HttpPatch("User/ResetPassNoEmail")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> ResetUserPassWithoutEmail(int id, [FromBody] string newPassword)
        {
            var user = await _context.User.FirstOrDefaultAsync(u => u.UserId == id);
            if (user == null) return BadRequest();

            if (string.IsNullOrEmpty(newPassword)) return BadRequest();

            var passwordHasher = new PasswordHasher<User>();
            user.Password = passwordHasher.HashPassword(user, newPassword);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Password Updated"
            });
        }


        [HttpPost("User")]
        public async Task<IActionResult> ResetUserPassword([FromQuery] string emailId)
        {
            var existingUser = await _context.User.FirstOrDefaultAsync(u => u.EmailId == emailId);
            if (existingUser == null) return BadRequest("Username Not Found");

            var otp = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
            var hashedOtp = ComputeSha256Hash(otp); // simple encoding for now

            otpStore[emailId] = (hashedOtp, DateTime.UtcNow.AddMinutes(5)); // store for 5 mins

            SendEmail(existingUser.EmailId, "OTP redBus - Password reset", $"Your OTP is {otp}.<br>It expires in 5 minutes.<strong>Do not share it.</strong>");

            return Ok(new { message = "OTP sent to email." });
        }


        [HttpPost("User/ResendOtp")]
        public async Task<IActionResult> ResendOtp([FromQuery] string emailId)
        {
            if (string.IsNullOrWhiteSpace(emailId))
                return BadRequest("Username is required.");

            otpStore.Remove(emailId); // clear old OTP if exists

            var existingUser = await _context.User.FirstOrDefaultAsync(u => u.EmailId == emailId);
            if (existingUser == null)
                return BadRequest("User doesn't exist.");

            var otp = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
            var hashedOtp = ComputeSha256Hash(otp); // simple encoding for now

            otpStore[emailId] = (hashedOtp, DateTime.UtcNow.AddMinutes(5));

            SendEmail(existingUser.EmailId, "OTP redBus - Password reset",
                $"Your OTP is {otp}.<br>It expires in 5 minutes.<br><strong>Do not share it.</strong>");

            return Ok(new { message = "OTP sent to email." });
        }


        [HttpPost("User/Verify")]
        public IActionResult VerifyUserOtp([FromQuery] string otp, [FromQuery] string emailId)
        {
            if (!otpStore.TryGetValue(emailId, out var stored) || stored.Expiry < DateTime.UtcNow)
                return BadRequest("OTP expired or not found.");

            var hashedInputOtp = ComputeSha256Hash(otp);
            if (hashedInputOtp != stored.OtpHash)
                return BadRequest("Invalid OTP.");

            // OTP is valid — remove it
            otpStore.Remove(emailId);

            // Generate short-lived reset token
            var claims = new[]
            {
                new Claim(ClaimTypes.Name, emailId),
                new Claim("ResetPassword", "true")
            };

            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(5),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var resetToken = tokenHandler.WriteToken(token);

            return Ok(new
            {
                message = "OTP verified.",
                resetToken = resetToken
            });
        }

        [HttpPost("User/UpdatePassword")]
        public async Task<IActionResult> UpdateUserPassword([FromQuery] string emailId, [FromQuery] string newPassword)
        {
            var authHeader = Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                return BadRequest("Missing or invalid token.");

            var token = authHeader.Substring("Bearer ".Length).Trim();
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);

            try
            {
                if (_tokenBlacklist.IsTokenBlacklisted(token))
                    return BadRequest("Token already used.");

                var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _configuration["Jwt:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = _configuration["Jwt:Audience"],
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                var userClaim = principal.FindFirst(ClaimTypes.Name)?.Value;
                var resetClaim = principal.FindFirst("ResetPassword")?.Value;

                if (userClaim != emailId || resetClaim != "true")
                    return BadRequest("Invalid reset token.");

                var user = await _context.User.FirstOrDefaultAsync(u => u.EmailId == emailId);
                if (user == null) return BadRequest("User not found.");

                var passwordHasher = new PasswordHasher<User>();
                user.Password = passwordHasher.HashPassword(user, newPassword);
                await _context.SaveChangesAsync();

                _tokenBlacklist.BlacklistToken(token, TimeSpan.FromMinutes(10));

                return Ok(new { message = "Password updated successfully." });
            }
            catch
            {
                return BadRequest("Invalid or expired token.");
            }
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
