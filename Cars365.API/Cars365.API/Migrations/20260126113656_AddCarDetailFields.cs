using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cars365.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCarDetailFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EngineCC",
                table: "Cars",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "HasSpareKey",
                table: "Cars",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "InsuranceTill",
                table: "Cars",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "KmsDriven",
                table: "Cars",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Ownership",
                table: "Cars",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "RegistrationCode",
                table: "Cars",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "RegistrationYear",
                table: "Cars",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EngineCC",
                table: "Cars");

            migrationBuilder.DropColumn(
                name: "HasSpareKey",
                table: "Cars");

            migrationBuilder.DropColumn(
                name: "InsuranceTill",
                table: "Cars");

            migrationBuilder.DropColumn(
                name: "KmsDriven",
                table: "Cars");

            migrationBuilder.DropColumn(
                name: "Ownership",
                table: "Cars");

            migrationBuilder.DropColumn(
                name: "RegistrationCode",
                table: "Cars");

            migrationBuilder.DropColumn(
                name: "RegistrationYear",
                table: "Cars");
        }
    }
}
