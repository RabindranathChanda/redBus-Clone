using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace redBus_api.Migrations
{
    /// <inheritdoc />
    public partial class Added_Ref_to_Vendor__VendorProfilePic_and : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_VendorProfilePic_VendorId",
                table: "VendorProfilePic",
                column: "VendorId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_VendorProfilePic_Vendor_VendorId",
                table: "VendorProfilePic",
                column: "VendorId",
                principalTable: "Vendor",
                principalColumn: "VendorId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_VendorProfilePic_Vendor_VendorId",
                table: "VendorProfilePic");

            migrationBuilder.DropIndex(
                name: "IX_VendorProfilePic_VendorId",
                table: "VendorProfilePic");
        }
    }
}
