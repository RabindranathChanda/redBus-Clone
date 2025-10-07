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
    [Authorize(Roles = "User,Vendor")]
    public class BusBookingPassengerController : ControllerBase
    {
        private readonly redBusDBContext _context;

        public BusBookingPassengerController(redBusDBContext context)
        {
            _context = context;
        }

        // GET: api/BusBookingPassenger
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BusBookingPassenger>>> GetBusBookingPassenger()
        {
            return await _context.BusBookingPassenger.ToListAsync();
        }

        // GET: api/BusBookingPassenger/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BusBookingPassenger>> GetBusBookingPassenger(int id)
        {
            var busBookingPassenger = await _context.BusBookingPassenger.FindAsync(id);

            if (busBookingPassenger == null)
            {
                return NotFound();
            }

            return busBookingPassenger;
        }

        // PUT: api/BusBookingPassenger/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutBusBookingPassenger(int id, BusBookingPassenger busBookingPassenger)
        {
            if (id != busBookingPassenger.PassengerId)
            {
                return BadRequest();
            }

            _context.Entry(busBookingPassenger).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BusBookingPassengerExists(id))
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

        // POST: api/BusBookingPassenger
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<BusBookingPassenger>> PostBusBookingPassenger(BusBookingPassenger busBookingPassenger)
        {
            _context.BusBookingPassenger.Add(busBookingPassenger);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetBusBookingPassenger", new { id = busBookingPassenger.PassengerId }, busBookingPassenger);
        }

        // DELETE: api/BusBookingPassenger/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBusBookingPassenger(int id)
        {
            var busBookingPassenger = await _context.BusBookingPassenger.FindAsync(id);
            if (busBookingPassenger == null)
            {
                return NotFound();
            }

            _context.BusBookingPassenger.Remove(busBookingPassenger);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool BusBookingPassengerExists(int id)
        {
            return _context.BusBookingPassenger.Any(e => e.PassengerId == id);
        }
    }
}
