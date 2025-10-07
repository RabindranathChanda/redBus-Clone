using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using redBus_api.Data;
using redBus_api.Model;
using redBus_api.Model.DTOs;

namespace redBus_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "User")]
    public class UserProfilePicController : ControllerBase
    {
        private readonly redBusDBContext _context;

        public UserProfilePicController(redBusDBContext context)
        {
            _context = context;
        }

        // GET: api/UserProfilePic
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserProfilePic>>> GetUserProfilePic()
        {
            return await _context.UserProfilePic.ToListAsync();
        }

        // GET: api/UserProfilePic/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserProfilePic>> GetUserProfilePic(int id)
        {
            var userProfilePic = await _context.UserProfilePic
                .Where(u => u.UserId == id)
                .Select(u => u.ImageData)
                .FirstOrDefaultAsync();

            if (userProfilePic == null)
            {
                return NotFound();
            }

            return File(userProfilePic, "image/png");
        }

        // PUT: api/UserProfilePic/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUserProfilePic(int id, UserProfilePic userProfilePic)
        {
            if (id != userProfilePic.Id)
            {
                return BadRequest();
            }

            _context.Entry(userProfilePic).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserProfilePicExists(id))
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

        // POST: api/UserProfilePic
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<UserProfilePic>> UserProfilePic([FromForm] UserProfilePicUploadDTO userProfilePicUploadDTO)
        {
            if (userProfilePicUploadDTO.ImageFile == null || userProfilePicUploadDTO.ImageFile.Length == 0)
                return BadRequest("Image file is required");

            using var memoryStream = new MemoryStream();
            await userProfilePicUploadDTO.ImageFile.CopyToAsync(memoryStream);
            var imageData = memoryStream.ToArray();

            var existingProfilePic = await _context.UserProfilePic
                .FirstOrDefaultAsync(p => p.UserId == userProfilePicUploadDTO.UserId);

            if (existingProfilePic != null)
            {
                existingProfilePic.ImageData = imageData;
                _context.UserProfilePic.Update(existingProfilePic);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Profile picture Updated" });
            }

            var profilePic = new UserProfilePic
            {
                UserId = userProfilePicUploadDTO.UserId,
                ImageData = imageData
            };

            _context.UserProfilePic.Add(profilePic);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Profile picture Uploaded" });
        }

        // DELETE: api/UserProfilePic/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUserProfilePic(int id)
        {
            var userProfilePic = await _context.UserProfilePic.FindAsync(id);
            if (userProfilePic == null)
            {
                return NotFound();
            }

            _context.UserProfilePic.Remove(userProfilePic);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UserProfilePicExists(int id)
        {
            return _context.UserProfilePic.Any(e => e.Id == id);
        }
    }
}
