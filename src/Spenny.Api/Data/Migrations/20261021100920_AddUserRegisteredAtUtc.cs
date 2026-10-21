using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Spenny.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUserRegisteredAtUtc : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "RegisteredAtUtc",
                table: "AspNetUsers",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RegisteredAtUtc",
                table: "AspNetUsers");
        }
    }
}
