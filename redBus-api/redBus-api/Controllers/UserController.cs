using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NuGet.Packaging.Signing;
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
    public class UserController : ControllerBase
    {
        private readonly redBusDBContext _context;
        private readonly IConfiguration _configuration;
        private readonly IGoogleCaptchaService _googleCaptchaService;
        public UserController(redBusDBContext context, IConfiguration configuration, IGoogleCaptchaService googleCaptchaService)
        {
            _context = context;
            _configuration = configuration;
            _googleCaptchaService = googleCaptchaService;
        }

        // GET: api/User
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUser()
        {
            return await _context.User.ToListAsync();
        }

        // GET: api/User/5
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.User.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        // PUT: api/User/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(int id, User user)
        {
            if (id != user.UserId)
            {
                return BadRequest();
            }

            _context.Entry(user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
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

        // Patch: api/User/5
        [HttpPatch("{id}")]
        public async Task<ActionResult<User>> PatchUser(int id, [FromBody] PartialUpdateUserDTO partialUpdateUserDTO)
        {
            var user = await _context.User.FirstOrDefaultAsync(u => u.UserId == id);
            if (user == null) return BadRequest();

            if (partialUpdateUserDTO.MobileNo != null)
                user.MobileNo = partialUpdateUserDTO.MobileNo;

            if (partialUpdateUserDTO.Gender != null)
                user.Gender = partialUpdateUserDTO.Gender;



            // Generate JWT Access Token
            var accessToken = GenerateJwtToken(user);

            // Generate Refresh Token
            var refreshToken = GenerateRefreshToken();
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

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
                message = "Successfull",
                user = new
                {
                    user.UserId,
                    user.EmailId,
                    user.FullName,
                    user.Gender,
                    user.MobileNo,
                }
            });
        }

        // POST: api/User
        [HttpPost]
        public async Task<ActionResult<User>> PostUser(UserWithCaptchaDTO UserWithCaptchaDTOModel)
        {
            var user = UserWithCaptchaDTOModel.User;
            var captchaToken = UserWithCaptchaDTOModel.CaptchaToken;

            var captchaVerificationTask = _googleCaptchaService.VerifyCaptchaAsync(captchaToken);
            var existingUserTask = _context.User
                .Where(u => u.EmailId == user.EmailId || u.MobileNo == user.MobileNo)
                .FirstOrDefaultAsync();

            await Task.WhenAll(captchaVerificationTask, existingUserTask);

            if (!captchaVerificationTask.Result)
                return BadRequest("Captcha Validation failed");

            var existingUser = existingUserTask.Result;

            if (existingUser != null)
            {
                if (existingUser.EmailId == user.EmailId)
                    return BadRequest("Email Already Exists.");
                if (existingUser.MobileNo == user.MobileNo)
                    return BadRequest("Mobile No. Already Exists.");
            }

            var passwordHasher = new PasswordHasher<User>();
            user.Password = passwordHasher.HashPassword(user, user.Password);

            user.Role ??= "User"; // Set default role as "User"


            _context.User.Add(user);

            // Generate JWT Access Token
            var accessToken = GenerateJwtToken(user);

            // Generate Refresh Token
            var refreshToken = GenerateRefreshToken();
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

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
                message = "User Registered",
                USER = new
                {
                    user.UserId,
                    user.EmailId,
                    user.FullName,
                    user.Gender,
                    user.MobileNo,
                }
            });
        }

        // DELETE: api/User/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var tokenUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            if (tokenUserId != id) return BadRequest("You are not Authorized to delete this Account.");

            var user = await _context.User.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.User.Remove(user);
            await _context.SaveChangesAsync();
            await _context.Database.ExecuteSqlRawAsync("EXEC ReseedUserIdentity");
            HttpContext.Response.Cookies.Delete("AccessToken");
            HttpContext.Response.Cookies.Delete("RefreshToken");
            return NoContent();
        }

        private bool UserExists(int id)
        {
            return _context.User.Any(e => e.UserId == id);
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
