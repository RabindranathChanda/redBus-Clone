using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace redBus_api.Migrations
{
    /// <inheritdoc />
    public partial class Added_RefundableAmount_GstAmount_CancellationFee_RefundDate_COL_In_BusBookingPassenger_Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CancellationFee",
                table: "BusBookingPassenger",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GstAmount",
                table: "BusBookingPassenger",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RefundDate",
                table: "BusBookingPassenger",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RefundableAmount",
                table: "BusBookingPassenger",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CancellationFee",
                table: "BusBookingPassenger");

            migrationBuilder.DropColumn(
                name: "GstAmount",
                table: "BusBookingPassenger");

            migrationBuilder.DropColumn(
                name: "RefundDate",
                table: "BusBookingPassenger");

            migrationBuilder.DropColumn(
                name: "RefundableAmount",
                table: "BusBookingPassenger");
        }
    }
}
