using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CuidaBem.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CuidadorId",
                table: "Registros",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Cuidadores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    HashPassword = table.Column<string>(type: "text", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cuidadores", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Registros_CuidadorId",
                table: "Registros",
                column: "CuidadorId");

            migrationBuilder.AddForeignKey(
                name: "FK_Registros_Cuidadores_CuidadorId",
                table: "Registros",
                column: "CuidadorId",
                principalTable: "Cuidadores",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Registros_Cuidadores_CuidadorId",
                table: "Registros");

            migrationBuilder.DropTable(
                name: "Cuidadores");

            migrationBuilder.DropIndex(
                name: "IX_Registros_CuidadorId",
                table: "Registros");

            migrationBuilder.DropColumn(
                name: "CuidadorId",
                table: "Registros");
        }
    }
}
