using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CuidaBem.Migrations
{
    /// <inheritdoc />
    public partial class AddMedicamentosAndVitals : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<List<string>>(
                name: "MedicamentosTomados",
                table: "Registros",
                type: "text[]",
                nullable: false,
                defaultValueSql: "'{}'");

            migrationBuilder.AddColumn<int>(
                name: "PressaoDiastolica",
                table: "Registros",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PressaoSistolica",
                table: "Registros",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Saturacao",
                table: "Registros",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "Temperatura",
                table: "Registros",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MedicamentosTomados",
                table: "Registros");

            migrationBuilder.DropColumn(
                name: "PressaoDiastolica",
                table: "Registros");

            migrationBuilder.DropColumn(
                name: "PressaoSistolica",
                table: "Registros");

            migrationBuilder.DropColumn(
                name: "Saturacao",
                table: "Registros");

            migrationBuilder.DropColumn(
                name: "Temperatura",
                table: "Registros");
        }
    }
}
