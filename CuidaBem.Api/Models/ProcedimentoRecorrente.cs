namespace CuidaBem.Models;

public class ProcedimentoRecorrente
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public TipoProcedimento Tipo { get; set; }
    public int IntervaloDias { get; set; }
    public DateTime DataInicio { get; set; }
    public DateTime? DataFim { get; set; }
    public string? Instrucoes { get; set; }
    public bool Ativo { get; set; } = true;

    protected ProcedimentoRecorrente() { }

    public ProcedimentoRecorrente(
        string nome,
        TipoProcedimento tipo,
        int intervaloDias,
        DateTime dataInicio,
        DateTime? dataFim = null,
        string? instrucoes = null)
    {
        Nome = nome;
        Tipo = tipo;
        IntervaloDias = intervaloDias;
        DataInicio = dataInicio;
        DataFim = dataFim;
        Instrucoes = instrucoes;
    }

    /// <summary>
    /// Calcula a próxima data de execução a partir de hoje
    /// </summary>
    public DateTime? GetProximaData()
    {
        if (!Ativo) return null;
        
        var hoje = DateTime.UtcNow.Date;
        
        // Se ainda não começou
        if (hoje < DataInicio.Date)
            return DataInicio.Date;
        
        // Se já terminou
        if (DataFim.HasValue && hoje > DataFim.Value.Date)
            return null;
        
        // Calcular próxima ocorrência
        var diasDesdeInicio = (hoje - DataInicio.Date).Days;
        var ciclosCompletos = diasDesdeInicio / IntervaloDias;
        var proximaData = DataInicio.Date.AddDays((ciclosCompletos + 1) * IntervaloDias);
        
        // Se a próxima data é após o fim, retorna null
        if (DataFim.HasValue && proximaData > DataFim.Value.Date)
            return null;
        
        return proximaData;
    }

    /// <summary>
    /// Verifica se hoje é dia de executar o procedimento
    /// </summary>
    public bool EhHojeDia()
    {
        if (!Ativo) return false;
        
        var hoje = DateTime.UtcNow.Date;
        
        if (hoje < DataInicio.Date) return false;
        if (DataFim.HasValue && hoje > DataFim.Value.Date) return false;
        
        var diasDesdeInicio = (hoje - DataInicio.Date).Days;
        return diasDesdeInicio % IntervaloDias == 0;
    }
}

public enum TipoProcedimento
{
    Sensor = 1,
    InjecaoCiclo = 2,
    Nebulizacao = 3,
    Outro = 4
}
