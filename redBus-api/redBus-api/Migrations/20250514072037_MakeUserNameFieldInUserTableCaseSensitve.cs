using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace redBus_api.Migrations
{
    /// <inheritdoc />
    public partial class MakeUserNameFieldInUserTableCaseSensitve : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "UserName",
                table: "User",
                type: "nvarchar(50)",
                nullable: false,
                collation: "SQL_Latin1_General_CP1_CS_AS",
                oldClrType: typeof(string),
                oldType: "nvarchar(50)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "UserName",
                table: "User",
                type: "nvarchar(50)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldCollation: "SQL_Latin1_General_CP1_CS_AS");
        }
    }
}
