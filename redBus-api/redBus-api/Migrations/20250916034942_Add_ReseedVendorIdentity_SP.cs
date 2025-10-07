using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace redBus_api.Migrations
{
    /// <inheritdoc />
    public partial class Add_ReseedVendorIdentity_SP : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                CREATE PROCEDURE ReseedVendorIdentity
                AS
                BEGIN

                    -- Reseed Vendor -------
                    DECLARE @maxVendorId INT;
                    SELECT @maxVendorId = ISNULL(MAX(VendorId), 0) FROM [Vendor];
                    DBCC CHECKIDENT ('[Vendor]', RESEED, @maxVendorId);


                    -- Reseed VendorProfilePic ------
                    DECLARE @maxVendorProfilePicId INT;
                    SELECT @maxVendorProfilePicId = ISNULL(MAX(Id),0) FROM [VendorProfilePic];
                    DBCC CHECKIDENT ('[VendorProfilePic]', RESEED, @maxVendorProfilePicId);

                    
                    -- Reseed VendorBankDetails ------
                    DECLARE @maxVendorBankDetailsId INT;
                    SELECT @maxVendorBankDetailsId = ISNULL(MAX(VendorBankDetailsId),0) FROM [VendorBankDetails];
                    DBCC CHECKIDENT ('[VendorBankDetails]', RESEED, @maxVendorBankDetailsId);

                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP PROCEDURE ReseedVendorIdentity");
        }
    }
}
