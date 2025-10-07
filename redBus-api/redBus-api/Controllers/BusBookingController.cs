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
    public class BusBookingController : ControllerBase
    {
        private readonly redBusDBContext _context;
        private readonly IMapper _mapper;

        public BusBookingController(redBusDBContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/BusBooking
        [HttpGet]
        [Authorize(Roles = "User,Vendor")]
        public async Task<ActionResult<IEnumerable<BusBooking>>> GetBusBooking()
        {
            return await _context.BusBooking.ToListAsync();
        }

        // GET: api/BusBooking/5
        [HttpGet("{id}")]
        [Authorize(Roles = "User,Vendor")]
        public async Task<ActionResult<List<BusBooking>>> GetBusBooking(int id)
        {
            var busBooking = await _context.BusBooking
                .Include(b => b.BusBookingPassengers)
                .Include(b => b.BusSchedule)
                .Where(b => b.UserId == id)
                .ToListAsync();

            if (busBooking == null)
            {
                return NotFound();
            }
            var DTO = _mapper.Map<List<BusBookingDTO>>(busBooking);

            return Ok(DTO);
        }
        // GET: api/BusBooking/BusForVendor/5
        [HttpGet("BusForVendor/{id}")]
        [Authorize(Roles = "User,Vendor")]
        public async Task<ActionResult<List<BusBooking>>> GetBusBookingForVendor(int id)
        {
            var busBooking = await _context.BusBooking
                .Include(b => b.BusBookingPassengers)
                .Where(b => b.ScheduleId == id)
                .ToListAsync();

            if (busBooking == null)
            {
                return NotFound();
            }
            var DTO = _mapper.Map<List<BusBookingDTO>>(busBooking);

            return Ok(DTO);
        }

        // PUT: api/BusBooking/5        
        [HttpPut("{id}")]
        [Authorize(Roles = "User,Vendor")]
        public async Task<IActionResult> PutBusBooking(int id, BusBooking busBooking)
        {
            if (id != busBooking.BookingId)
            {
                return BadRequest();
            }

            _context.Entry(busBooking).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BusBookingExists(id))
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

        // POST: api/BusBooking
        [HttpPost]
        [Authorize(Roles = "User,Vendor")]
        public async Task<ActionResult<BusBooking>> PostBusBooking(BusBooking busBooking)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Add Bookings
                _context.BusBooking.Add(busBooking);
                await _context.SaveChangesAsync();

                // Fetch related schedule
                var schedule = await _context.BusSchedule.FindAsync(busBooking.ScheduleId);
                if (schedule == null)
                {
                    return NotFound("Bus Schedule Not Found.");
                }

                // Calculate seats booked
                int seatesBooked = busBooking.BusBookingPassengers?.Count ?? 0;

                if (seatesBooked > schedule.AvailableSeats)
                {
                    return BadRequest("Enough Seats Not Available");
                }

                // Deduct the Seates and save
                schedule.AvailableSeats -= seatesBooked;
                _context.BusSchedule.Update(schedule);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                //return CreatedAtAction("GetBusBooking", new { id = busBooking.BookingId }, busBooking);
                return Ok();

            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        // DELETE: api/BusBooking/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "User,Vendor")]
        public async Task<IActionResult> DeleteBusBooking(int id)
        {
            var busBooking = await _context.BusBooking.FindAsync(id);
            if (busBooking == null)
            {
                return NotFound();
            }

            _context.BusBooking.Remove(busBooking);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool BusBookingExists(int id)
        {
            return _context.BusBooking.Any(e => e.BookingId == id);
        }
    }
}
