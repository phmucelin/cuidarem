namespace CuidaBem.Models;

public class OrientacaoExecucao
{
    public int Id { get; set; }
    public TipoOrientacao Tipo { get; set; }
    public int ReferenciaId { get; set; } // ID do medicamento, horário, ou procedimento
    public int CuidadorId { get; set; }
    public Cuidador Cuidador { get; set; } = null!;
    public DateTime ExecutadoEm { get; set; } = DateTime.UtcNow;
    public string? Observacao { get; set; }

    protected OrientacaoExecucao() { }

    public OrientacaoExecucao(
        TipoOrientacao tipo,
        int referenciaId,
        int cuidadorId,
        string? observacao = null)
    {
        Tipo = tipo;
        ReferenciaId = referenciaId;
        CuidadorId = cuidadorId;
        Observacao = observacao;
    }
}

public enum TipoOrientacao
{
    Medicamento = 1,
    Insulina = 2,
    Procedimento = 3,
    Nebulizacao = 4
}
