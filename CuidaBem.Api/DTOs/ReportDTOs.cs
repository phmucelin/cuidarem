namespace CuidaBem.DTOs;

/// <summary>
/// DTO para Time in Range - Tempo no Alvo
/// </summary>
public record TimeInRangeDTO(
    int TotalMedicoes,
    double PercentMuitoBaixo,   // < 54 mg/dL
    double PercentBaixo,         // 54-69 mg/dL
    double PercentIdeal,         // 70-180 mg/dL (alvo)
    double PercentAlto,          // 181-250 mg/dL
    double PercentMuitoAlto,     // > 250 mg/dL
    int ContagemMuitoBaixo,
    int ContagemBaixo,
    int ContagemIdeal,
    int ContagemAlto,
    int ContagemMuitoAlto,
    TendenciaDTO? Tendencia      // Comparativo com período anterior
);

public record TendenciaDTO(
    double VariacaoPercentIdeal, // +/- variação no % ideal
    string Direcao               // "melhora", "piora", "estavel"
);

/// <summary>
/// Alertas hierarquizados por severidade
/// </summary>
public record AlertDTO(
    AlertaSeveridade Severidade,
    string Tipo,
    string Titulo,
    string Mensagem,
    string? Acao,
    DateTime? DataOcorrencia
);

public enum AlertaSeveridade
{
    Critical = 1,
    Warning = 2,
    Info = 3
}

/// <summary>
/// Célula do mapa de calor semanal
/// </summary>
public record HeatmapCellDTO(
    string DiaSemana,
    string Periodo,            // "manha", "tarde", "noite"
    double MediaHgt,
    string Status,             // "controlado", "atencao", "critico"
    int TotalRegistros
);

/// <summary>
/// Evento da timeline do dia
/// </summary>
public record TimelineEventDTO(
    DateTime Timestamp,
    string Tipo,               // "refeicao", "medicacao", "insulina", "procedimento"
    string Titulo,
    string Descricao,
    int? HgtAntes,
    int? HgtDepois,
    int? DeltaHgt,
    string? Severidade,        // "ok", "atencao", "critico"
    List<string>? Medicamentos,
    int? DoseInsulina
);

/// <summary>
/// Análise de efetividade da insulina
/// </summary>
public record InsulinEffectivenessDTO(
    int DoseUI,
    double MediaReducao,
    TimeSpan TempoMedioEfeito,
    double TaxaSucesso,        // % de vezes que reduziu glicemia
    int TotalAplicacoes
);

/// <summary>
/// Padrão detectado automaticamente
/// </summary>
public record PatternDTO(
    string Tipo,               // "spike_recorrente", "hipoglicemia_horario", "tendencia_alta"
    string Titulo,
    string Descricao,
    List<string> CausasPossiveis,
    string Recomendacao,
    AlertaSeveridade Severidade,
    List<DateTime> Ocorrencias
);

/// <summary>
/// Comparativo de dois períodos
/// </summary>
public record PeriodComparisonDTO(
    string Periodo1Label,
    string Periodo2Label,
    double MediaHgt1,
    double MediaHgt2,
    double VariacaoMediaHgt,
    double PercentAlvo1,
    double PercentAlvo2,
    double VariacaoPercentAlvo,
    int Hipoglicemias1,
    int Hipoglicemias2,
    int EventosCriticos1,
    int EventosCriticos2,
    string Resumo
);

/// <summary>
/// Resposta consolidada de alertas
/// </summary>
public record AlertsResponseDTO(
    List<AlertDTO> Criticos,
    List<AlertDTO> Atencao,
    List<AlertDTO> Informativos
);

/// <summary>
/// Resposta do heatmap semanal
/// </summary>
public record HeatmapResponseDTO(
    List<HeatmapCellDTO> Celulas,
    string[] DiasSemana,
    string[] Periodos
);
