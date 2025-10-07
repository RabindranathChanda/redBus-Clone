using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace redBus_api.Migrations
{
    /// <inheritdoc />
    public partial class Added_VendorBankDetails_Model_and_VendorDTO_VendorBankDetailsDTO : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "VendorBankDetails",
                columns: table => new
                {
                    VendorBankDetailsId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VendorId = table.Column<int>(type: "int", nullable: false),
                    BankAccountNumber = table.Column<string>(type: "nvarchar(30)", nullable: true),
                    IFSCCode = table.Column<string>(type: "nvarchar(11)", nullable: true),
                    BankName = table.Column<string>(type: "nvarchar(100)", nullable: true),
                    AccountHolderName = table.Column<string>(type: "nvarchar(50)", nullable: true),
                    UPIID = table.Column<string>(type: "nvarchar(30)", nullable: true),
                    IsBankVerified = table.Column<bool>(type: "bit", nullable: false),
                    VerificationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PAN = table.Column<string>(type: "nvarchar(20)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VendorBankDetails", x => x.VendorBankDetailsId);
                    table.ForeignKey(
                        name: "FK_VendorBankDetails_Vendor_VendorId",
                        column: x => x.VendorId,
                        principalTable: "Vendor",
                        principalColumn: "VendorId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_VendorBankDetails_VendorId",
                table: "VendorBankDetails",
                column: "VendorId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VendorBankDetails");
        }
    }
}
