using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Vitrine.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class OffersMultiTargetAndVibe : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // TargetId (single Guid) and Scope no longer fit the M:N model; drop them.
            // Offers are re-seeded from scratch, so no data migration is attempted.
            migrationBuilder.DropColumn(
                name: "Scope",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "TargetId",
                table: "Offers");

            migrationBuilder.AddColumn<string>(
                name: "CategoryIds",
                table: "Offers",
                type: "TEXT",
                nullable: false,
                defaultValue: "[]");

            migrationBuilder.AddColumn<string>(
                name: "ProductIds",
                table: "Offers",
                type: "TEXT",
                nullable: false,
                defaultValue: "[]");

            migrationBuilder.AddColumn<string>(
                name: "IconName",
                table: "Offers",
                type: "TEXT",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Vibe",
                table: "BrandSettings",
                type: "TEXT",
                maxLength: 40,
                nullable: false,
                defaultValue: "elegant");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CategoryIds",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "ProductIds",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "IconName",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "Vibe",
                table: "BrandSettings");

            migrationBuilder.AddColumn<Guid>(
                name: "TargetId",
                table: "Offers",
                type: "TEXT",
                nullable: false,
                defaultValue: Guid.Empty);

            migrationBuilder.AddColumn<int>(
                name: "Scope",
                table: "Offers",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }
    }
}
