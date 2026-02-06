using CuidaBem.Data;
using CuidaBem.DTOs;
using CuidaBem.Models;
using Microsoft.EntityFrameworkCore;

namespace CuidaBem.Services;

public class OrientacoesService
{
    private readonly AppDbContext _context;
    private static readonly TimeZoneInfo BrasilTimeZone = GetBrazilTimeZone();

    private static TimeZoneInfo GetBrazilTimeZone()
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById("America/Sao_Paulo");
        }
        catch
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById("E. South America Standard Time");
            }
            catch
            {
                // Fallback: usar UTC-3
                return TimeZoneInfo.CreateCustomTimeZone(
                    "Brazil", 
                    TimeSpan.FromHours(-3), 
                    "Brazil Time", 
                    "Brazil Standard Time");
            }
        }
    }

    public OrientacoesService(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Obtém a hora atual no timezone do Brasil
    /// </summary>
    private DateTime GetAgora()
    {
        return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, BrasilTimeZone);
    }

    /// <summary>
    /// Obtém todas as orientações do dia atual, divididas em "agora" e "próximas"
    /// </summary>
    public async Task<OrientacoesDoDiaDTO> GetOrientacoesDoDia(int? hgtAtual = null)
    {
        var agora = GetAgora();
        var horaAtual = agora.TimeOfDay;
        var diaSemana = (int)agora.DayOfWeek;
        
        // Janela de tempo: "agora" = +/- 30 minutos do horário previsto
        var janelaMinutos = 30;
        var horaInicio = horaAtual.Add(TimeSpan.FromMinutes(-janelaMinutos));
        var horaFim = horaAtual.Add(TimeSpan.FromMinutes(janelaMinutos));
        
        // Buscar todos os horários ativos para hoje
        var horariosHoje = await _context.MedicamentoHorarios
            .Include(h => h.Medicamento)
            .Where(h => h.Ativo && h.DiasSemana.Contains(diaSemana))
            .OrderBy(h => h.Horario)
            .ToListAsync();

        // Verificar quais já foram executados hoje (usar UTC para query)
        var hojeUtcInicio = DateTime.UtcNow.Date;
        var hojeUtcFim = hojeUtcInicio.AddDays(1);
        var execucoesHoje = await _context.OrientacaoExecucoes
            .Where(e => e.ExecutadoEm >= hojeUtcInicio && e.ExecutadoEm < hojeUtcFim)
            .ToListAsync();

        // Separar em "agora" (dentro da janela) e "próximas" (após a janela)
        var orientacoesAgora = new List<OrientacaoDTO>();
        var proximasOrientacoes = new List<OrientacaoDTO>();

        foreach (var horario in horariosHoje)
        {
            var executado = execucoesHoje.Any(e => 
                e.Tipo == TipoOrientacao.Medicamento && 
                e.ReferenciaId == horario.Id);

            var orientacao = new OrientacaoDTO(
                Id: horario.Id,
                Tipo: horario.Medicamento.Tipo.ToString().ToUpper(),
                Nome: horario.Medicamento.Nome,
                Dosagem: $"{horario.Medicamento.Dosagem} {horario.Medicamento.Unidade}",
                Instrucoes: horario.Medicamento.Instrucoes,
                HorarioPrevisto: horario.Horario,
                ContextoRefeicao: horario.ContextoRefeicao,
                Prioridade: CalcularPrioridade(horario.Horario, horaAtual),
                Executado: executado
            );

            // Dentro da janela de tempo atual
            if (horario.Horario >= horaInicio && horario.Horario <= horaFim)
            {
                orientacoesAgora.Add(orientacao);
            }
            // Próximas orientações (depois da janela)
            else if (horario.Horario > horaFim)
            {
                proximasOrientacoes.Add(orientacao);
            }
        }

        // Adicionar procedimentos recorrentes que são para hoje
        var procedimentosHoje = await GetProcedimentosParaHoje(execucoesHoje);
        orientacoesAgora.AddRange(procedimentosHoje.Where(p => p.Prioridade <= 2));

        // Verificar alertas se HGT foi fornecido
        List<AlertaCriticoDTO>? alertas = null;
        if (hgtAtual.HasValue)
        {
            alertas = await VerificarAlertas(hgtAtual.Value);
        }

        // Próximo procedimento cíclico
        var proximoProcedimento = await GetProximoProcedimentoCiclico();

        return new OrientacoesDoDiaDTO(
            DataHoraAtual: agora,
            DiaSemana: GetDiaSemanaPortugues(agora.DayOfWeek),
            OrientacoesAgora: orientacoesAgora.OrderBy(o => o.Prioridade).ThenBy(o => o.HorarioPrevisto).ToList(),
            ProximasOrientacoes: proximasOrientacoes.Take(5).ToList(),
            Alertas: alertas,
            ProximoProcedimentoCiclico: proximoProcedimento
        );
    }

    /// <summary>
    /// Calcula a dosagem de insulina Humalog baseada no HGT atual
    /// </summary>
    public async Task<DosageInsulinaDTO> CalcularDosageInsulina(int hgtAtual, TimeSpan? horario = null)
    {
        var hora = horario ?? GetAgora().TimeOfDay;
        
        // Buscar insulina Humalog (rápida)
        var humalog = await _context.Medicamentos
            .Include(m => m.DosagensVariaveis)
            .FirstOrDefaultAsync(m => m.Nome.Contains("Humalog") || m.Nome.Contains("Rápida"));

        if (humalog?.DosagensVariaveis == null || !humalog.DosagensVariaveis.Any())
        {
            return new DosageInsulinaDTO(
                NomeInsulina: "Insulina Humalog",
                HgtAtual: hgtAtual,
                DoseRecomendada: 0,
                Aplicar: false,
                Alerta: "Configuração de dosagem não encontrada",
                ContatoEmergencia: null,
                TelefoneEmergencia: null
            );
        }

        // Encontrar a faixa correta
        var dosagem = humalog.DosagensVariaveis
            .FirstOrDefault(d => 
                hgtAtual >= d.HgtMinimo && 
                (!d.HgtMaximo.HasValue || hgtAtual <= d.HgtMaximo.Value));

        if (dosagem == null)
        {
            return new DosageInsulinaDTO(
                NomeInsulina: humalog.Nome,
                HgtAtual: hgtAtual,
                DoseRecomendada: 0,
                Aplicar: false,
                Alerta: "HGT fora das faixas configuradas",
                ContatoEmergencia: null,
                TelefoneEmergencia: null
            );
        }

        // Verificar se é noite (evitar aplicar Humalog à noite)
        var ehNoite = hora.Hours >= 20 || hora.Hours < 6;
        string? alerta = null;
        
        if (dosagem.AlertaCritico)
        {
            alerta = $"⚠️ ALERTA CRÍTICO: HGT {hgtAtual} - Entre em contato com {dosagem.ContatoEmergencia}";
        }
        else if (ehNoite && dosagem.Aplicar)
        {
            alerta = "⚠️ Atenção: Evitar aplicar insulina Humalog à noite";
        }

        return new DosageInsulinaDTO(
            NomeInsulina: humalog.Nome,
            HgtAtual: hgtAtual,
            DoseRecomendada: dosagem.DoseUi,
            Aplicar: dosagem.Aplicar && !ehNoite,
            Alerta: alerta,
            ContatoEmergencia: dosagem.ContatoEmergencia,
            TelefoneEmergencia: dosagem.TelefoneEmergencia
        );
    }

    /// <summary>
    /// Verifica se há alertas críticos baseado no HGT
    /// </summary>
    public async Task<List<AlertaCriticoDTO>> VerificarAlertas(int hgtAtual)
    {
        var alertas = new List<AlertaCriticoDTO>();

        // Buscar dosagens com alerta crítico
        var dosagensComAlerta = await _context.InsulinaDosagens
            .Where(d => d.AlertaCritico)
            .ToListAsync();

        foreach (var dosagem in dosagensComAlerta)
        {
            if (hgtAtual >= dosagem.HgtMinimo && 
                (!dosagem.HgtMaximo.HasValue || hgtAtual <= dosagem.HgtMaximo.Value))
            {
                alertas.Add(new AlertaCriticoDTO(
                    Tipo: "HGT_CRITICO",
                    Mensagem: $"HGT em {hgtAtual} mg/dL - Nível crítico detectado!",
                    ContatoEmergencia: dosagem.ContatoEmergencia,
                    Telefone: dosagem.TelefoneEmergencia
                ));
            }
        }

        return alertas;
    }

    /// <summary>
    /// Obtém o próximo procedimento cíclico (Epress, Sensor, etc.)
    /// </summary>
    public async Task<ProximoProcedimentoDTO?> GetProximoProcedimentoCiclico()
    {
        var procedimentos = await _context.ProcedimentosRecorrentes
            .Where(p => p.Ativo)
            .ToListAsync();

        ProximoProcedimentoDTO? proximo = null;
        var menorDias = int.MaxValue;

        foreach (var proc in procedimentos)
        {
            var proximaData = proc.GetProximaData();
            if (proximaData.HasValue)
            {
                var diasRestantes = (proximaData.Value.Date - GetAgora().Date).Days;
                if (diasRestantes >= 0 && diasRestantes < menorDias)
                {
                    menorDias = diasRestantes;
                    proximo = new ProximoProcedimentoDTO(
                        Nome: proc.Nome,
                        DataPrevista: proximaData.Value,
                        DiasRestantes: diasRestantes,
                        Instrucoes: proc.Instrucoes
                    );
                }
            }
        }

        return proximo;
    }

    /// <summary>
    /// Obtém orientações filtradas por contexto de refeição
    /// </summary>
    public async Task<List<OrientacaoDTO>> GetOrientacoesPorRefeicao(string refeicao)
    {
        var agora = GetAgora();
        var diaSemana = (int)agora.DayOfWeek;

        var horarios = await _context.MedicamentoHorarios
            .Include(h => h.Medicamento)
            .Where(h => h.Ativo && 
                        h.ContextoRefeicao != null &&
                        h.ContextoRefeicao.ToUpper() == refeicao.ToUpper() &&
                        h.DiasSemana.Contains(diaSemana))
            .OrderBy(h => h.Horario)
            .ToListAsync();

        // Verificar execuções de hoje (usar UTC para query)
        var hojeUtcInicio = DateTime.UtcNow.Date;
        var hojeUtcFim = hojeUtcInicio.AddDays(1);
        var execucoesHoje = await _context.OrientacaoExecucoes
            .Where(e => e.ExecutadoEm >= hojeUtcInicio && e.ExecutadoEm < hojeUtcFim)
            .ToListAsync();

        return horarios.Select(h => new OrientacaoDTO(
            Id: h.Id,
            Tipo: h.Medicamento.Tipo.ToString().ToUpper(),
            Nome: h.Medicamento.Nome,
            Dosagem: $"{h.Medicamento.Dosagem} {h.Medicamento.Unidade}",
            Instrucoes: h.Medicamento.Instrucoes,
            HorarioPrevisto: h.Horario,
            ContextoRefeicao: h.ContextoRefeicao,
            Prioridade: 2,
            Executado: execucoesHoje.Any(e => e.Tipo == TipoOrientacao.Medicamento && e.ReferenciaId == h.Id)
        )).ToList();
    }

    /// <summary>
    /// Marca uma orientação como executada
    /// </summary>
    public async Task<bool> MarcarComoExecutada(int cuidadorId, MarcarExecutadaRequest request)
    {
        var tipo = Enum.Parse<TipoOrientacao>(request.Tipo, ignoreCase: true);
        
        var execucao = new OrientacaoExecucao(
            tipo: tipo,
            referenciaId: request.ReferenciaId,
            cuidadorId: cuidadorId,
            observacao: request.Observacao
        );

        _context.OrientacaoExecucoes.Add(execucao);
        await _context.SaveChangesAsync();
        
        return true;
    }

    /// <summary>
    /// Obtém procedimentos que devem ser executados hoje
    /// </summary>
    private async Task<List<OrientacaoDTO>> GetProcedimentosParaHoje(List<OrientacaoExecucao> execucoesHoje)
    {
        var procedimentos = await _context.ProcedimentosRecorrentes
            .Where(p => p.Ativo)
            .ToListAsync();

        var resultado = new List<OrientacaoDTO>();

        foreach (var proc in procedimentos)
        {
            if (proc.EhHojeDia())
            {
                var executado = execucoesHoje.Any(e => 
                    e.Tipo == TipoOrientacao.Procedimento && 
                    e.ReferenciaId == proc.Id);

                resultado.Add(new OrientacaoDTO(
                    Id: proc.Id,
                    Tipo: "PROCEDIMENTO",
                    Nome: proc.Nome,
                    Dosagem: $"A cada {proc.IntervaloDias} dias",
                    Instrucoes: proc.Instrucoes,
                    HorarioPrevisto: new TimeSpan(18, 0, 0), // Default: 18h
                    ContextoRefeicao: "JANTAR",
                    Prioridade: 1, // Procedimentos têm alta prioridade
                    Executado: executado
                ));
            }
        }

        return resultado;
    }

    /// <summary>
    /// Calcula prioridade baseado na proximidade do horário
    /// </summary>
    private int CalcularPrioridade(TimeSpan horarioPrevisto, TimeSpan horaAtual)
    {
        var diferenca = Math.Abs((horarioPrevisto - horaAtual).TotalMinutes);
        
        if (diferenca <= 15) return 1; // Urgente
        if (diferenca <= 60) return 2; // Normal
        return 3; // Pode esperar
    }

    /// <summary>
    /// Converte dia da semana para português
    /// </summary>
    private string GetDiaSemanaPortugues(DayOfWeek dia)
    {
        return dia switch
        {
            DayOfWeek.Sunday => "Domingo",
            DayOfWeek.Monday => "Segunda-feira",
            DayOfWeek.Tuesday => "Terça-feira",
            DayOfWeek.Wednesday => "Quarta-feira",
            DayOfWeek.Thursday => "Quinta-feira",
            DayOfWeek.Friday => "Sexta-feira",
            DayOfWeek.Saturday => "Sábado",
            _ => dia.ToString()
        };
    }
}
