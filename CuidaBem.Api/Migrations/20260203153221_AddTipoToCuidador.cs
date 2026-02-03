using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CuidaBem.Migrations
{
    /// <inheritdoc />
    public partial class AddTipoToCuidador : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Tipo",
                table: "Cuidadores",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.InsertData(
                table: "Cuidadores",
                columns: new[] { "Nome", "Email", "HashPassword", "Tipo", "CriadoEm" },
                values: new object[] { "Familia Admin", "admin@familia.com", "123456", 1, new System.DateTime(2024, 1, 1, 0, 0, 0, System.DateTimeKind.Utc) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Tipo",
                table: "Cuidadores");
        }
    }
}
