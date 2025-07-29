using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace redBus_api.Migrations
{
    /// <inheritdoc />
    public partial class Add_ReseedBusScheduleIdentity_SP : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                CREATE PROCEDURE ReseedBusScheduleIdentity
                AS
                BEGIN
                    DECLARE @maxId INT;
                    SELECT @maxId = ISNULL(MAX(ScheduleId), 0) FROM [BusSchedule];
                    DBCC CHECKIDENT ('[BusSchedule]', RESEED, @maxId);
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP PROCEDURE ReseedBusScheduleIdentity");

        }
    }
}
