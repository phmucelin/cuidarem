using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CuidaBem.Migrations
{
    /// <inheritdoc />
    public partial class AddOrientacoes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Medicamentos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Dosagem = table.Column<string>(type: "text", nullable: false),
                    Unidade = table.Column<string>(type: "text", nullable: false),
                    Tipo = table.Column<string>(type: "text", nullable: false),
                    Instrucoes = table.Column<string>(type: "text", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Medicamentos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OrientacaoExecucoes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Tipo = table.Column<string>(type: "text", nullable: false),
                    ReferenciaId = table.Column<int>(type: "integer", nullable: false),
                    CuidadorId = table.Column<int>(type: "integer", nullable: false),
                    ExecutadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Observacao = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrientacaoExecucoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrientacaoExecucoes_Cuidadores_CuidadorId",
                        column: x => x.CuidadorId,
                        principalTable: "Cuidadores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProcedimentosRecorrentes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Tipo = table.Column<string>(type: "text", nullable: false),
                    IntervaloDias = table.Column<int>(type: "integer", nullable: false),
                    DataInicio = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DataFim = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Instrucoes = table.Column<string>(type: "text", nullable: true),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProcedimentosRecorrentes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "InsulinaDosagens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MedicamentoId = table.Column<int>(type: "integer", nullable: false),
                    HgtMinimo = table.Column<int>(type: "integer", nullable: false),
                    HgtMaximo = table.Column<int>(type: "integer", nullable: true),
                    DoseUi = table.Column<int>(type: "integer", nullable: false),
                    Aplicar = table.Column<bool>(type: "boolean", nullable: false),
                    AlertaCritico = table.Column<bool>(type: "boolean", nullable: false),
                    ContatoEmergencia = table.Column<string>(type: "text", nullable: true),
                    TelefoneEmergencia = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InsulinaDosagens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InsulinaDosagens_Medicamentos_MedicamentoId",
                        column: x => x.MedicamentoId,
                        principalTable: "Medicamentos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MedicamentoHorarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MedicamentoId = table.Column<int>(type: "integer", nullable: false),
                    Horario = table.Column<TimeSpan>(type: "interval", nullable: false),
                    DiasSemana = table.Column<int[]>(type: "integer[]", nullable: false),
                    ContextoRefeicao = table.Column<string>(type: "text", nullable: true),
                    AntesOuDepois = table.Column<string>(type: "text", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicamentoHorarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MedicamentoHorarios_Medicamentos_MedicamentoId",
                        column: x => x.MedicamentoId,
                        principalTable: "Medicamentos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InsulinaDosagens_MedicamentoId",
                table: "InsulinaDosagens",
                column: "MedicamentoId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicamentoHorarios_MedicamentoId",
                table: "MedicamentoHorarios",
                column: "MedicamentoId");

            migrationBuilder.CreateIndex(
                name: "IX_OrientacaoExecucoes_CuidadorId",
                table: "OrientacaoExecucoes",
                column: "CuidadorId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InsulinaDosagens");

            migrationBuilder.DropTable(
                name: "MedicamentoHorarios");

            migrationBuilder.DropTable(
                name: "OrientacaoExecucoes");

            migrationBuilder.DropTable(
                name: "ProcedimentosRecorrentes");

            migrationBuilder.DropTable(
                name: "Medicamentos");
        }
    }
}
