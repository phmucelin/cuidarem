namespace CuidaBem.Models;

public class Registro
{
    public int Id { get; set; }
    
    public enum TipoRef{
        Cafe = 1,
        Lanche = 2,
        Almoco = 3,
        Jantar = 4,
        LancheMadrugada = 5
    }
    public TipoRef Refeicao { get; set; } 
    public DateTime Data { get; set; }
    public TimeSpan HoraAntes { get; set; }
    public TimeSpan HoraDepois { get; set; }
    public int HgtAntes { get; set; }
    public int HgtDepois { get; set; }
    public int DoseLentaAnte { get; set; }
    public int DoseRapida { get; set; }
    public string? Observacao { get; set; }
    public int CuidadorId { get; set; }
    public Cuidador Cuidador { get; set; }
    
    public DateTime CriadoEm { get; private set; } = DateTime.UtcNow;

    protected Registro() {}

    public Registro(
        TipoRef refeicao,
        DateTime data,
        TimeSpan horaAntes,
        TimeSpan horaDepois,
        int hgtAntes,
        int hgtDepois,
        int doseLenta,
        int doseRapida,
        string? observacao,
        int cuidadorId)
    {
        Refeicao = refeicao;
        Data = data;
        HoraAntes = horaAntes;
        HoraDepois = horaDepois;
        HgtAntes = hgtAntes;
        HgtDepois = hgtDepois;
        DoseLentaAnte = doseLenta;
        DoseRapida = doseRapida;
        Observacao = observacao;
        CuidadorId = cuidadorId;
    }
}