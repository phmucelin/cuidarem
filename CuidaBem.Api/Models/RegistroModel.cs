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
    public decimal Temperatura { get; set; }
    public int Saturacao { get; set; }
    public int PressaoSistolica { get; set; }
    public int PressaoDiastolica { get; set; }
    public string? Observacao { get; set; }
    public int CuidadorId { get; set; }
    public Cuidador Cuidador { get; set; }

    public List<string> MedicamentosTomados { get; set; }

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
        decimal temperatura,
        int saturacao,
        int pressaoSistolica,
        int pressaoDiastolica,
        string? observacao,
        int cuidadorId,
        List<string> medicamentosTomados)
    {
        Refeicao = refeicao;
        Data = data;
        HoraAntes = horaAntes;
        HoraDepois = horaDepois;
        HgtAntes = hgtAntes;
        HgtDepois = hgtDepois;
        DoseLentaAnte = doseLenta;
        DoseRapida = doseRapida;
        Temperatura = temperatura;
        Saturacao = saturacao;
        PressaoSistolica = pressaoSistolica;
        PressaoDiastolica = pressaoDiastolica;
        Observacao = observacao;
        CuidadorId = cuidadorId;
        MedicamentosTomados = medicamentosTomados;
    }
}
