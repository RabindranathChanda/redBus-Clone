using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace redBus_api.Migrations
{
    /// <inheritdoc />
    public partial class Add_ReseedUserIdentity_SP : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                CREATE PROCEDURE ReseedUserIdentity
                AS
                BEGIN
                    DECLARE @maxId INT;
                    SELECT @maxId = ISNULL(MAX(UserId), 0) FROM [User];
                    DBCC CHECKIDENT ('[User]', RESEED, @maxId);
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP PROCEDURE ReseedUserIdentity");
        }
    }
}
