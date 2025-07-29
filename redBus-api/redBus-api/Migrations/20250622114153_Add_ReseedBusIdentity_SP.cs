using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace redBus_api.Migrations
{
    /// <inheritdoc />
    public partial class Add_ReseedBusIdentity_SP : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                CREATE PROCEDURE ReseedBusIdentity
                AS
                BEGIN
                    DECLARE @maxId INT;
                    SELECT @maxId = ISNULL(MAX(BusId), 0) FROM [Bus];
                    DBCC CHECKIDENT ('[Bus]', RESEED, @maxId);
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP PROCEDURE ReseedBusIdentity");

        }
    }
}
