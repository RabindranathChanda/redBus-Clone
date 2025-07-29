using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using redBus_api.Data;

namespace redBus_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CancelBusBookingController : ControllerBase
    {
        private readonly redBusDBContext _context;

        public CancelBusBookingController(redBusDBContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize(Roles = "User,Vendor")]
        public async Task<IActionResult> CancelPassengers([FromBody] List<int> passengerIds)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (passengerIds == null || !passengerIds.Any())
                    return BadRequest("No passenger IDs provided.");

                var passengers = await _context.BusBookingPassenger
                    .Where(p => passengerIds.Contains(p.PassengerId))
                    .ToListAsync();

                if (!passengers.Any())
                    return NotFound("No matching passengers found.");

                // Track total refund per bookingId
                var bookingRefunds = new Dictionary<int, int>();

                // Track schedule seat updates
                var scheduleSeatAdjustments = new Dictionary<int, int>();

                foreach (var passenger in passengers)
                {
                    if (passenger.BookingStatus == "Cancelled")
                        continue;

                    // Calculate charges
                    int cancellationFee = (int)(passenger.Price * 0.05);
                    int gstAmount = (int)(passenger.Price * 0.18);
                    int refundableAmount = passenger.Price - cancellationFee - gstAmount;

                    passenger.BookingStatus = "Cancelled";
                    passenger.RefundStatus = "Initiated";
                    passenger.CancellationFee = cancellationFee;
                    passenger.GstAmount = gstAmount;
                    passenger.RefundableAmount = refundableAmount;
                    passenger.RefundDate = DateTime.UtcNow;

                    // Refund adjustment
                    if (!bookingRefunds.ContainsKey(passenger.BookingId))
                        bookingRefunds[passenger.BookingId] = 0;

                    bookingRefunds[passenger.BookingId] += refundableAmount;

                    // Find schedule ID through the booking
                    var booking = await _context.BusBooking
                        .Where(b => b.BookingId == passenger.BookingId)
                        .FirstOrDefaultAsync();

                    if (booking != null)
                    {
                        int scheduleId = booking.ScheduleId;

                        // Get the schedule to check departure time
                        var schedule = await _context.BusSchedule.FindAsync(scheduleId);
                        if (schedule != null && schedule.DepartureDateTime <= DateTime.UtcNow.AddHours(3))
                        {
                            return BadRequest($"Cannot cancel booking for passenger {passenger.PassengerId} within 3 hours of departure.");
                        }

                        if (!scheduleSeatAdjustments.ContainsKey(scheduleId))
                            scheduleSeatAdjustments[scheduleId] = 0;

                        scheduleSeatAdjustments[scheduleId] += 1; // 1 seat freed per cancelled passenger
                    }

                }

                // Update BusBooking currentPrice
                foreach (var kvp in bookingRefunds)
                {
                    var booking = await _context.BusBooking.FindAsync(kvp.Key);
                    if (booking != null)
                    {
                        booking.CurrentPrice -= kvp.Value;
                        if (booking.CurrentPrice < 0)
                            booking.CurrentPrice = 0;
                    }
                }

                // Update BusSchedule availableSeats
                foreach (var kvp in scheduleSeatAdjustments)
                {
                    var schedule = await _context.BusSchedule.FindAsync(kvp.Key);
                    if (schedule != null)
                    {
                        schedule.AvailableSeats += kvp.Value;
                        if (schedule.AvailableSeats > schedule.TotalSeats)
                            schedule.AvailableSeats = schedule.TotalSeats; // Safety cap
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    message = "Booking Cancelled."
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"An error occurred during cancellation: {ex.Message}");
            }
        }

    }
}
