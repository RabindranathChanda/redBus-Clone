using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using redBus_api.Data;
using redBus_api.Model;

namespace redBus_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SearchBusController : ControllerBase
    {
        private readonly redBusDBContext _context;

        public SearchBusController(redBusDBContext context)
        {
            _context = context;
        }

        // GET: api/SearchBus?from=1&to=2&date=2025-05-01
        [HttpGet]
        public async Task<IActionResult> Search([FromQuery] string From, [FromQuery] string to, [FromQuery] DateTime travelDate)
        {
            if (string.IsNullOrEmpty(From) || string.IsNullOrEmpty(to))
                return BadRequest("From and To parameters are required.");

            IQueryable<BusSchedule> query = _context.BusSchedule;

            // Try to parse `from` and `to` as integers (location IDs)
            bool isFromId = int.TryParse(From, out int fromId);
            bool isToId = int.TryParse(to, out int toId);

            //if (isFromId && isToId)
            //{
            //    query = query.Where(bs =>
            //        bs.FromLocationId == fromId &&
            //        bs.ToLocationId == toId &&
            //        bs.ScheduleDate == travelDate
            //    );
            //}
            //else
            //{
            //    query = query.Where(bs =>
            //        bs.FromLocation == From &&
            //        bs.ToLocation == to &&
            //        bs.ScheduleDate == travelDate
            //    );
            //}

            //var schedule = await query.Select(bs => new
            //{
            //    bs.ScheduleId,
            //    bs.BusId,
            //    bs.VendorId,
            //    bs.VendorName,
            //    bs.BusName,
            //    bs.BusVehicleNo,
            //    bs.TotalSeats,
            //    bs.FromLocation,
            //    bs.ToLocation,
            //    bs.DepartureDateTime,
            //    bs.ArrivalDateTime,
            //    bs.ScheduleDate,
            //    bs.AvailableSeats,
            //    bs.PricePerSeat
            //}).ToListAsync();


            var schedule = await (
                    from bs in _context.BusSchedule
                    join b in _context.Bus on bs.BusId equals b.BusId
                    where
                        ((isFromId && isToId && bs.FromLocationId == fromId && bs.ToLocationId == toId) ||
                        (!isFromId && !isToId && bs.FromLocation == From && bs.ToLocation == to)) &&
                        bs.ScheduleDate == travelDate
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
                        bs.ToLocation,
                        bs.DepartureDateTime,
                        bs.ArrivalDateTime,
                        bs.ScheduleDate,
                        bs.AvailableSeats,
                        bs.PricePerSeat
                    }

                ).ToListAsync();

            if (schedule.Count == 0) return Ok(new List<object>());

            return Ok(schedule);
        }
    }
}
