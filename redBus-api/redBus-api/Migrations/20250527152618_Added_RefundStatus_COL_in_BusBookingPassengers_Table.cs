using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace redBus_api.Migrations
{
    /// <inheritdoc />
    public partial class Added_RefundStatus_COL_in_BusBookingPassengers_Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RefundStatus",
                table: "BusBookingPassenger",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_BusBooking_ScheduleId",
                table: "BusBooking",
                column: "ScheduleId");

            migrationBuilder.AddForeignKey(
                name: "FK_BusBooking_BusSchedule_ScheduleId",
                table: "BusBooking",
                column: "ScheduleId",
                principalTable: "BusSchedule",
                principalColumn: "ScheduleId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BusBooking_BusSchedule_ScheduleId",
                table: "BusBooking");

            migrationBuilder.DropIndex(
                name: "IX_BusBooking_ScheduleId",
                table: "BusBooking");

            migrationBuilder.DropColumn(
                name: "RefundStatus",
                table: "BusBookingPassenger");
        }
    }
}
