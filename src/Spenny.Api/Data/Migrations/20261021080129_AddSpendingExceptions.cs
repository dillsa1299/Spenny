using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Spenny.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSpendingExceptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SpendingExceptions",
                columns: table => new
                {
                    SeriesId = table.Column<Guid>(type: "uuid", nullable: false),
                    OccurrenceDate = table.Column<DateOnly>(type: "date", nullable: false),
                    IsSkipped = table.Column<bool>(type: "boolean", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Amount = table.Column<decimal>(type: "numeric", nullable: true),
                    Category = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: true),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpendingExceptions", x => new { x.SeriesId, x.OccurrenceDate });
                    table.ForeignKey(
                        name: "FK_SpendingExceptions_SpendingSeries_SeriesId",
                        column: x => x.SeriesId,
                        principalTable: "SpendingSeries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SpendingExceptions");
        }
    }
}
