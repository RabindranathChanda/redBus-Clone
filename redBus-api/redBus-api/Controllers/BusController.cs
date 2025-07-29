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
    public class BusController : ControllerBase
    {
        private readonly redBusDBContext _context;

        public BusController(redBusDBContext context)
        {
            _context = context;
        }

        // GET: api/Bus
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Bus>>> GetBus()
        {
            return await _context.Bus.ToListAsync();
        }

        // GET: api/Bus/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Bus>> GetBus(int id)
        {
            var bus = await _context.Bus.FindAsync(id);

            if (bus == null)
            {
                return NotFound();
            }

            return bus;
        }

        // GET: api/Bus/AllBusByVendor/5
        [HttpGet("AllBusByVendor/{id}")]
        public async Task<ActionResult<IEnumerable<Bus>>> GetAllBus(int id)
        {
            var buses = await _context.Bus
                .Where(b => b.VendorId == id)
                .ToListAsync();


            return Ok(buses);
        }

        // GET: api/Bus/Vendor/{vendorId}?page=1&pageSize=5
        [HttpGet("Vendor/{vendorId}")]
        public async Task<IActionResult> GetVendorBuses(int vendorId, int page = 1, int pageSize = 5)
        {
            if (page <= 0) page = 1;
            if (pageSize <= 0) pageSize = 5;

            var query = _context.Bus.Where(b => b.VendorId == vendorId);

            var totalCount = await query.CountAsync();

            var buses = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(b => new
                {
                    b.BusId,
                    b.BusName,
                    b.BusVehicleNo,
                    b.BusType,
                    b.IsAC,
                    b.TotalSeats
                })
                .ToListAsync();

            return Ok(new
            {
                buses = buses,
                totalCount = totalCount
            });
        }

        // PUT: api/Bus/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutBus(int id, Bus bus)
        {
            if (id != bus.BusId)
            {
                return BadRequest();
            }

            _context.Entry(bus).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BusExists(id))
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

        // POST: api/Bus
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Authorize(Roles = "Vendor")]
        public async Task<ActionResult<Bus>> PostBus(Bus bus)
        {
            var existingBus = await _context.Bus
                .FirstOrDefaultAsync(b => b.BusVehicleNo == bus.BusVehicleNo);


            if (existingBus != null) return BadRequest(new { message = "Bus with same vehicle number already present" });


            _context.Bus.Add(bus);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                bus = bus,
                message = "Done"
            });
        }

        // DELETE: api/Bus/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Vendor")]
        public async Task<IActionResult> DeleteBus(int id)
        {
            var bus = await _context.Bus.FindAsync(id);
            if (bus == null)
            {
                return NotFound();
            }

            // Check id bus has upcoming schedules
            var hasUpcomingSchedule = await _context.BusSchedule
                .AnyAsync(BusSchedule => BusSchedule.BusId == id && BusSchedule.DepartureDateTime > DateTime.Now);

            if (hasUpcomingSchedule) return BadRequest(new { message = "Cannot delete bus with upcoming schedule. Please delete the schedules first." });


            _context.Bus.Remove(bus);
            await _context.SaveChangesAsync();
            await _context.Database.ExecuteSqlRawAsync("EXEC ReseedBusIdentity");

            return Ok(new { message = "Bus deleted successfully" });
        }

        private bool BusExists(int id)
        {
            return _context.Bus.Any(e => e.BusId == id);
        }
    }
}
