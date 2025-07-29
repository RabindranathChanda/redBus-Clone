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
    public class BusScheduleController : ControllerBase
    {
        private readonly redBusDBContext _context;

        public BusScheduleController(redBusDBContext context)
        {
            _context = context;
        }

        // GET: api/BusSchedule
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BusSchedule>>> GetBusSchedule()
        {
            return await _context.BusSchedule.ToListAsync();
        }

        //// GET: api/BusSchedule/ByVendor/5
        //[HttpGet("ByVendor/{id}")]
        //[Authorize(Roles = "Vendor")]
        //public async Task<ActionResult<IEnumerable<BusSchedule>>> GetBusScheduleByVendor(int id)
        //{
        //    var getScheduleByVendor = await _context.BusSchedule
        //        .Where(bs => bs.VendorId == id && bs.DepartureDateTime > DateTime.Now)
        //        .ToListAsync();

        //    return Ok(getScheduleByVendor);
        //}


        // GET: api/BusSchedule/ByVendor/5?page=1&pageSize=10
        [HttpGet("ByVendor/{vendorId}")]
        [Authorize(Roles = "Vendor")]
        public async Task<IActionResult> GetBusScheduleByVendor(int vendorId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (page <= 0) page = 1;
            if (pageSize <= 0) pageSize = 10;

            var query = _context.BusSchedule
                .Where(bs => bs.VendorId == vendorId && bs.DepartureDateTime > DateTime.Now);

            var totalCount = await query.CountAsync();

            var schedules = await query
                .OrderBy(bs => bs.DepartureDateTime)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                totalCount = totalCount,
                page = page,
                pageSize = pageSize,
                schedules = schedules
            });
        }



        // GET: api/BusSchedule/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BusSchedule>> GetBusSchedule(int id)
        {

            var scheduleWithRating = await (
                from bs in _context.BusSchedule
                join b in _context.Bus on bs.BusId equals b.BusId
                where bs.ScheduleId == id
                select new
                {
                    bs.ScheduleId,
                    bs.BusId,
                    bs.VendorId,
                    bs.VendorName,
                    bs.BusName,
                    bs.BusVehicleNo,
                    bs.BusType,
                    bs.IsAC,
                    b.Rating,
                    b.RattingCount,
                    bs.TotalSeats,
                    bs.FromLocation,
                    bs.FromLocationId,
                    bs.ToLocation,
                    bs.ToLocationId,
                    bs.DepartureDateTime,
                    bs.ArrivalDateTime,
                    bs.ScheduleDate,
                    bs.AvailableSeats,
                    bs.PricePerSeat
                }).FirstOrDefaultAsync();

            if (scheduleWithRating == null)
            {
                return NotFound();
            }

            return Ok(scheduleWithRating);
        }

        // GET: api/BusSchedule/BookingScheduleForVendor/5
        [HttpGet("BookingScheduleForVendor/{id}")]
        public async Task<ActionResult<BusSchedule>> GetBookingScheduleForVendor(int id)
        {

            //var schedule = await _context.BusSchedule
            //    .Where(bs => bs.VendorId == id && bs.DepartureDateTime > DateTime.UtcNow)
            //    .ToListAsync();
            var schedule = await (
                from bs in _context.BusSchedule
                where bs.VendorId == id && bs.DepartureDateTime > DateTime.UtcNow
                select new
                {
                    bs.ScheduleId,
                    bs.BusId,
                    bs.VendorId,
                    bs.VendorName,
                    bs.BusName,
                    bs.BusVehicleNo,
                    bs.BusType
                }).ToListAsync();

            if (schedule == null)
            {
                return NotFound();
            }

            return Ok(schedule);
        }


        // PUT: api/BusSchedule/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutBusSchedule(int id, BusSchedule busSchedule)
        {
            if (id != busSchedule.ScheduleId)
            {
                return BadRequest();
            }

            _context.Entry(busSchedule).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BusScheduleExists(id))
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

        // PATCH: api/BusSchedule/
        [HttpPatch]
        [Authorize(Roles = "Vendor")]
        public async Task<IActionResult> PatchScheduleStatus([FromBody] BusScheduleStatusUpdateDTO busScheduleStatusUpdateDTO)
        {
            var busSchedule = await _context.BusSchedule.FindAsync(busScheduleStatusUpdateDTO.ScheduleId);

            if (busSchedule == null)
            {
                return BadRequest(new { message = "Schedule not found" });
            }

            if (busSchedule.ScheduleStatus == "Active")
            {
                var existingBookings = await _context.BusBooking
                    .Where(bk => bk.ScheduleId == busScheduleStatusUpdateDTO.ScheduleId)
                    .ToListAsync();

                if (existingBookings.Any())
                {
                    return BadRequest(new
                    {
                        message = "Bookings exist for this schedule. Please issue refunds before deactivating."
                    });
                }
            }
            if (busScheduleStatusUpdateDTO.ScheduleStatus == "Activate")
            {
                busSchedule.ScheduleStatus = "Active";
            }
            else
            {
                busSchedule.ScheduleStatus = "Inactive";
            }
            await _context.SaveChangesAsync();

            return Ok(new { message = "Schedule updated successfully" });
        }





        // POST: api/BusSchedule
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Authorize(Roles = "Vendor")]
        public async Task<ActionResult<BusSchedule>> PostBusSchedule(BusSchedule busSchedule)
        {
            var scheduleExists = await _context.BusSchedule
                .Where(bs => bs.BusVehicleNo == busSchedule.BusVehicleNo
                    && bs.ScheduleStatus != "Completed"
                    && bs.DepartureDateTime <= busSchedule.ArrivalDateTime
                    && bs.ArrivalDateTime >= busSchedule.DepartureDateTime)
                .FirstOrDefaultAsync();


            if (scheduleExists != null) return BadRequest(new
            {
                title = "Warning",
                message = "Single bus can't have multiple schedule on same date until last journey ends."
            });

            _context.BusSchedule.Add(busSchedule);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                title = "Successfull",
                message = "Sechedule created successfully"
            });
        }

        // DELETE: api/BusSchedule/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Vendor")]
        public async Task<IActionResult> DeleteBusSchedule(int id)
        {

            bool hasBooking = await _context.BusBooking.AnyAsync(b => b.ScheduleId == id);

            if (hasBooking)
            {
                return BadRequest(new
                {
                    title = "Warning",
                    message = "This schedule has bookings. Please cancel the schedule and refund before deletion."
                });
            }


            var busSchedule = await _context.BusSchedule.FindAsync(id);
            if (busSchedule == null)
            {
                return BadRequest(new
                {
                    title = "Warning",
                    message = "Schedule not found."
                });
            }


            _context.BusSchedule.Remove(busSchedule);
            await _context.SaveChangesAsync();
            await _context.Database.ExecuteSqlRawAsync("EXEC ReseedBusScheduleIdentity");


            return Ok(new
            {
                title = "Successfull",
                message = "Schedule deleted."
            });



        }

        private bool BusScheduleExists(int id)
        {
            return _context.BusSchedule.Any(e => e.ScheduleId == id);
        }
    }
}
