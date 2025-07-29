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

namespace redBus_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VendorProfilePicController : ControllerBase
    {
        private readonly redBusDBContext _context;

        public VendorProfilePicController(redBusDBContext context)
        {
            _context = context;
        }

        // GET: api/VendorProfilePic
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VendorProfilePic>>> GetVendorProfilePic()
        {
            return await _context.VendorProfilePic.ToListAsync();
        }

        // GET: api/VendorProfilePic/5
        [HttpGet("{id}")]
        [Authorize(Roles = "Vendor")]
        public async Task<ActionResult<VendorProfilePic>> GetVendorProfilePic(int id)
        {
            var vendorProfilePic = await _context.VendorProfilePic
                .Where(u => u.VendorId == id)
                .Select(u => u.ImageData)
                .FirstOrDefaultAsync();

            if (vendorProfilePic == null)
            {
                return NotFound();
            }

            return File(vendorProfilePic, "image/png");
        }

        // PUT: api/VendorProfilePic/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutVendorProfilePic(int id, VendorProfilePic vendorProfilePic)
        {
            if (id != vendorProfilePic.Id)
            {
                return BadRequest();
            }

            _context.Entry(vendorProfilePic).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!VendorProfilePicExists(id))
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

        // POST: api/VendorProfilePic
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Authorize(Roles = "Vendor")]
        public async Task<ActionResult<VendorProfilePic>> PostVendorProfilePic([FromForm] int vendorId, [FromForm] IFormFile imageFile)
        {
            if (imageFile == null || imageFile.Length == 0)
                return BadRequest("Image file is required");

            using var memoryStream = new MemoryStream();
            await imageFile.CopyToAsync(memoryStream);
            var imageData = memoryStream.ToArray();

            var existingProfilePic = await _context.VendorProfilePic
                .FirstOrDefaultAsync(p => p.VendorId == vendorId);

            if (existingProfilePic != null)
            {
                existingProfilePic.ImageData = imageData;
                _context.VendorProfilePic.Update(existingProfilePic);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Profile picture updated" });
            }

            var profilePic = new VendorProfilePic
            {
                VendorId = vendorId,
                ImageData = imageData
            };

            _context.VendorProfilePic.Add(profilePic);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Profile picture updated" });
        }

        // DELETE: api/VendorProfilePic/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVendorProfilePic(int id)
        {
            var vendorProfilePic = await _context.VendorProfilePic.FindAsync(id);
            if (vendorProfilePic == null)
            {
                return NotFound();
            }

            _context.VendorProfilePic.Remove(vendorProfilePic);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool VendorProfilePicExists(int id)
        {
            return _context.VendorProfilePic.Any(e => e.Id == id);
        }
    }
}
