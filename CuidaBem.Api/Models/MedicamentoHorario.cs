namespace CuidaBem.Models;

public class MedicamentoHorario
{
    public int Id { get; set; }
    public int MedicamentoId { get; set; }
    public Medicamento Medicamento { get; set; } = null!;
    public TimeSpan Horario { get; set; }
    public int[] DiasSemana { get; set; } = { 0, 1, 2, 3, 4, 5, 6 }; // 0=Dom, 1=Seg, 2=Ter...
    public string? ContextoRefeicao { get; set; } // CAFE, ALMOCO, JANTAR, LANCHE
    public string AntesOuDepois { get; set; } = "ANTES";
    public bool Ativo { get; set; } = true;

    protected MedicamentoHorario() { }

    public MedicamentoHorario(
        int medicamentoId,
        TimeSpan horario,
        int[]? diasSemana = null,
        string? contextoRefeicao = null,
        string antesOuDepois = "ANTES")
    {
        MedicamentoId = medicamentoId;
        Horario = horario;
        DiasSemana = diasSemana ?? new[] { 0, 1, 2, 3, 4, 5, 6 };
        ContextoRefeicao = contextoRefeicao;
        AntesOuDepois = antesOuDepois;
    }
}
