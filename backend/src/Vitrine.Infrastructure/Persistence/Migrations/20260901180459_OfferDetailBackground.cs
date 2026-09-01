using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Vitrine.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class OfferDetailBackground : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "DetailBackgroundImageOpacity",
                table: "Offers",
                type: "REAL",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DetailBackgroundImageUrl",
                table: "Offers",
                type: "TEXT",
                maxLength: 2048,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DetailBackgroundImageOpacity",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "DetailBackgroundImageUrl",
                table: "Offers");
        }
    }
}
