using Microsoft.EntityFrameworkCore;
using redBus_api.Model;

namespace redBus_api.Data
{
    public class redBusDBContext : DbContext
    {
        public redBusDBContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<Location> Location { get; set; }
        public DbSet<User> User { get; set; }
        public DbSet<UserProfilePic> UserProfilePic { get; set; }
        public DbSet<Vendor> Vendor { get; set; }
        public DbSet<VendorProfilePic> VendorProfilePic { get; set; }
        public DbSet<Bus> Bus { get; set; }
        public DbSet<BusSchedule> BusSchedule { get; set; }
        public DbSet<BusBooking> BusBooking { get; set; }
        public DbSet<BusBookingPassenger> BusBookingPassenger { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<BusBooking>().ToTable(nameof(BusBooking));
            modelBuilder.Entity<BusBookingPassenger>().ToTable(nameof(BusBookingPassenger));

            // Setting 1 to many relationship between BusBooking and BusBookingPassenger
            modelBuilder.Entity<BusBooking>()
                .HasMany(b => b.BusBookingPassengers)
                .WithOne(p => p.Booking)
                .HasForeignKey(p => p.BookingId)
                .OnDelete(DeleteBehavior.Cascade);

            // Setting 1 to many (or 1 to 1 if applicable) relationship between BusBooking and BusSchedule
            modelBuilder.Entity<BusBooking>()
                .HasOne(b => b.BusSchedule)
                .WithMany() // or .WithMany(s => s.BusBookings) if you have a collection on BusSchedule
                .HasForeignKey(b => b.ScheduleId)
                .OnDelete(DeleteBehavior.Restrict); // or Cascade / SetNull, depends on your domain logic
        }
    }
}
