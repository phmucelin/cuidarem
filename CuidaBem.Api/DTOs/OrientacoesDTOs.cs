namespace CuidaBem.DTOs;

/// <summary>
/// Representa uma orientação individual (medicamento, procedimento, etc.)
/// </summary>
public record OrientacaoDTO(
    int Id,
    string Tipo, // MEDICAMENTO, INSULINA, PROCEDIMENTO, NEBULIZACAO
    string Nome,
    string Dosagem,
    string? Instrucoes,
    TimeSpan HorarioPrevisto,
    string? ContextoRefeicao,
    int Prioridade, // 1=Urgente, 2=Normal, 3=Pode esperar
    bool Executado
);

/// <summary>
/// DTO principal retornado pelo endpoint de orientações
/// </summary>
public record OrientacoesDoDiaDTO(
    DateTime DataHoraAtual,
    string DiaSemana,
    List<OrientacaoDTO> OrientacoesAgora,
    List<OrientacaoDTO> ProximasOrientacoes,
    List<AlertaCriticoDTO>? Alertas,
    ProximoProcedimentoDTO? ProximoProcedimentoCiclico
);

/// <summary>
/// Alerta crítico (ex: HGT > 350)
/// </summary>
public record AlertaCriticoDTO(
    string Tipo,
    string Mensagem,
    string? ContatoEmergencia,
    string? Telefone
);

/// <summary>
/// Próximo procedimento cíclico (ex: Epress, Sensor)
/// </summary>
public record ProximoProcedimentoDTO(
    string Nome,
    DateTime DataPrevista,
    int DiasRestantes,
    string? Instrucoes
);

/// <summary>
/// Resultado do cálculo de dosagem de insulina
/// </summary>
public record DosageInsulinaDTO(
    string NomeInsulina,
    int HgtAtual,
    int DoseRecomendada,
    bool Aplicar,
    string? Alerta,
    string? ContatoEmergencia,
    string? TelefoneEmergencia
);

/// <summary>
/// Request para calcular dosagem de insulina
/// </summary>
public record CalcularDosageRequest(
    int HgtAtual,
    string? Horario = null // HH:mm formato, opcional (usa hora atual se null)
);

/// <summary>
/// Request para marcar orientação como executada
/// </summary>
public record MarcarExecutadaRequest(
    string Tipo, // MEDICAMENTO, INSULINA, PROCEDIMENTO
    int ReferenciaId,
    string? Observacao = null
);
