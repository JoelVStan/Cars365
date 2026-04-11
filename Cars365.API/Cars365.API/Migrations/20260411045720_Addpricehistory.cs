using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cars365.API.Migrations
{
    /// <inheritdoc />
    public partial class Addpricehistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "PreviousPrice",
                table: "Cars",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PriceUpdatedAt",
                table: "Cars",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PreviousPrice",
                table: "Cars");

            migrationBuilder.DropColumn(
                name: "PriceUpdatedAt",
                table: "Cars");
        }
    }
}
