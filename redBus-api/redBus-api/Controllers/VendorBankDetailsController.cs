using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
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
    [Authorize(Roles = "Vendor")]
    public class VendorBankDetailsController : ControllerBase
    {
        private readonly redBusDBContext _context;
        private readonly IMapper _mapper;

        public VendorBankDetailsController(redBusDBContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/VendorBankDetails
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VendorBankDetailsDTO>>> GetVendorBankDetails()
        {
            return Ok(_mapper.Map<IEnumerable<VendorBankDetailsDTO>>(await _context.VendorBankDetails.ToListAsync()));
        }

        // GET: api/VendorBankDetails/5
        [HttpGet("{id}")]
        public async Task<ActionResult<VendorBankDetailsDTO>> GetVendorBankDetails(int id)
        {
            var vendorBankDetails = await _context.VendorBankDetails.FindAsync(id);

            if (vendorBankDetails == null)
            {
                return NotFound();
            }

            return Ok(_mapper.Map<VendorBankDetailsDTO>(vendorBankDetails));
        }

        // PUT: api/VendorBankDetails/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutVendorBankDetails(int id, VendorBankDetailsDTO vendorBankDetailsDto)
        {
            if (id != vendorBankDetailsDto.VendorBankDetailsId)
            {
                return BadRequest(new { message = "Vendor id mismatch" });
            }

            var VendorBankDetailsEntity = await _context.VendorBankDetails.FindAsync(id);

            if (VendorBankDetailsEntity == null) return NotFound();

            _mapper.Map(vendorBankDetailsDto, VendorBankDetailsEntity);

            _context.Entry(VendorBankDetailsEntity).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!VendorBankDetailsExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(_mapper.Map<VendorBankDetailsDTO>(VendorBankDetailsEntity));
        }

        // POST: api/VendorBankDetails
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<VendorBankDetailsDTO>> PostVendorBankDetails(VendorBankDetailsDTO vendorBankDetailsDto)
        {
            var VendorBankDetailsEntity = _mapper.Map<VendorBankDetails>(vendorBankDetailsDto);
            _context.VendorBankDetails.Add(VendorBankDetailsEntity);
            await _context.SaveChangesAsync();

            var result = _mapper.Map<VendorBankDetailsDTO>(VendorBankDetailsEntity);


            return CreatedAtAction(nameof(GetVendorBankDetails), new { id = result.VendorBankDetailsId }, result);
        }

        // DELETE: api/VendorBankDetails/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVendorBankDetails(int id)
        {
            var vendorBankDetails = await _context.VendorBankDetails.FindAsync(id);
            if (vendorBankDetails == null)
            {
                return NotFound();
            }

            _context.VendorBankDetails.Remove(vendorBankDetails);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool VendorBankDetailsExists(int id)
        {
            return _context.VendorBankDetails.Any(e => e.VendorBankDetailsId == id);
        }
    }
}
