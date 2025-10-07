using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using redBus_api.Data;

namespace redBus_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GetBookedSeatsController : ControllerBase
    {
        private readonly redBusDBContext _context;

        public GetBookedSeatsController(redBusDBContext context)
        {
            _context = context;
        }
        // GET: api/GetBookedSeats?{id}
        [HttpGet]
        public async Task<IActionResult> Search([FromQuery] int scheduleId)
        {
            var seats = await _context.BusBookingPassenger
                .Where(bs =>
                bs.Booking != null && bs.Booking.ScheduleId == scheduleId && bs.BookingStatus.ToLower() != "cancelled")
                .Select(bs => bs.SeatNo)
                .ToListAsync();
            //if(seats.Count == 0 ) return NotFound();
            return Ok(seats);
        }
    }
}
