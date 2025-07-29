using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace redBus_api.Migrations
{
    /// <inheritdoc />
    public partial class Added_BusType_and_IsAC_Field_in_Bus_Model : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BusType",
                table: "Bus",
                type: "nvarchar(50)",
                nullable: false,
                defaultValue: "Normal");

            migrationBuilder.AddColumn<bool>(
                name: "IsAC",
                table: "Bus",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BusType",
                table: "Bus");

            migrationBuilder.DropColumn(
                name: "IsAC",
                table: "Bus");
        }
    }
}
