using System.ComponentModel.DataAnnotations;
using CuidaBem.Models;
namespace CuidaBem.DTOs;

public record EditaDTO(
    Registro.TipoRef Refeicao,
    DateTime Data,
    TimeSpan HoraAntes,
    TimeSpan HoraDepois,
    int HgtAntes,
    int HgtDepois,
    int DoseLenta,
    int DoseRapida,
    string? Observacao);
public class CreateRegistroDTO
{
    [Required]
    public Registro.TipoRef Refeicao { get; set; }

    [Required]
    public DateTime Data { get; set; }

    [Required]
    public TimeSpan HoraAntes { get; set; }

    [Required]
    public TimeSpan HoraDepois { get; set; }

    [Range(1, 600)]
    public int HgtAntes { get; set; }

    [Range(1, 600)]
    public int HgtDepois { get; set; }

    [Range(0, 100)]
    public int DoseLentaAnte { get; set; }

    [Range(0, 100)]
    public int DoseRapida { get; set; }
    public string? Observacao { get; set; }
    [Required]
    public int CuidadorId { get; set; }

}