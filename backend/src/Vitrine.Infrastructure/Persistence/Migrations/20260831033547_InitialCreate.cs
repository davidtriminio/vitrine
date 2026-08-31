using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Vitrine.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AdminUsers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Username = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Role = table.Column<string>(type: "TEXT", maxLength: 40, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdminUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BrandSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false),
                    BrandName = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    LogoUrl = table.Column<string>(type: "TEXT", maxLength: 2048, nullable: false),
                    WhatsappNumber = table.Column<string>(type: "TEXT", maxLength: 32, nullable: false),
                    DefaultLocale = table.Column<string>(type: "TEXT", maxLength: 8, nullable: false),
                    HeroTitle = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    HeroSubtitle = table.Column<string>(type: "TEXT", maxLength: 300, nullable: true),
                    HeroImageUrl = table.Column<string>(type: "TEXT", maxLength: 2048, nullable: true),
                    ThemeTokens = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BrandSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Slug = table.Column<string>(type: "TEXT", maxLength: 140, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Offers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    DiscountType = table.Column<int>(type: "INTEGER", nullable: false),
                    Value = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false),
                    Scope = table.Column<int>(type: "INTEGER", nullable: false),
                    TargetId = table.Column<Guid>(type: "TEXT", nullable: false),
                    StartsAt = table.Column<long>(type: "INTEGER", nullable: false),
                    EndsAt = table.Column<long>(type: "INTEGER", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    BannerTitle = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    BannerSubtitle = table.Column<string>(type: "TEXT", maxLength: 300, nullable: true),
                    BannerBackgroundColor = table.Column<string>(type: "TEXT", maxLength: 64, nullable: true),
                    BannerImageUrl = table.Column<string>(type: "TEXT", maxLength: 2048, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Offers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Sku = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 4000, nullable: false),
                    CategoryId = table.Column<Guid>(type: "TEXT", nullable: false),
                    BasePrice = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<long>(type: "INTEGER", nullable: false),
                    Images = table.Column<string>(type: "TEXT", nullable: false),
                    Attributes = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AdminUsers_Username",
                table: "AdminUsers",
                column: "Username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Categories_Slug",
                table: "Categories",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Offers_IsActive_StartsAt_EndsAt",
                table: "Offers",
                columns: new[] { "IsActive", "StartsAt", "EndsAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Products_CategoryId",
                table: "Products",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_Sku",
                table: "Products",
                column: "Sku",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdminUsers");

            migrationBuilder.DropTable(
                name: "BrandSettings");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "Offers");

            migrationBuilder.DropTable(
                name: "Products");
        }
    }
}
