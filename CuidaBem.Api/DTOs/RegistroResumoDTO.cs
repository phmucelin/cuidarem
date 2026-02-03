using CuidaBem.Models;

namespace CuidaBem.DTOs;

public class RegistroResumoDTO
{
    public int Id { get; set; }
    public DateTime Data { get; set; }
    public Registro.TipoRef Refeicao { get; set; } // TipoRef (1=Café, 2=Almoço, 3=Janta)
    public TimeSpan HoraAntes { get; set; }
    public TimeSpan HoraDepois { get; set; }
    public int HgtAntes { get; set; }
    public int HgtDepois { get; set; }
    public int DoseLentaAnte { get; set; }
    public int DoseRapida { get; set; }
    public List<string> MedicamentosTomados { get; set; }
    public string Observacao { get; set; }
}