using CuidaBem.Data;
using CuidaBem.DTOs;
using CuidaBem.Models;
using Microsoft.EntityFrameworkCore;

namespace CuidaBem.Services;

public class ReportAnalysisService
{
    private readonly AppDbContext _context;

    // Faixas de glicemia (mg/dL)
    private const int MUITO_BAIXO = 54;
    private const int BAIXO = 70;
    private const int IDEAL_MAX = 180;
    private const int ALTO = 250;

    public ReportAnalysisService(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Calcula o Tempo no Alvo (Time in Range) para um cuidador
    /// </summary>
    public async Task<TimeInRangeDTO> CalculateTimeInRangeAsync(int cuidadorId, int dias = 30)
    {
        var dataInicio = DateTime.UtcNow.Date.AddDays(-dias);
        
        var registros = await _context.Registros
            .Where(r => r.CuidadorId == cuidadorId && r.Data >= dataInicio)
            .ToListAsync();

        // Coletar todas as medições de HGT
        var medicoes = new List<int>();
        foreach (var r in registros)
        {
            if (r.HgtAntes > 0) medicoes.Add(r.HgtAntes);
            if (r.HgtDepois > 0) medicoes.Add(r.HgtDepois);
        }

        if (medicoes.Count == 0)
        {
            return new TimeInRangeDTO(
                TotalMedicoes: 0,
                PercentMuitoBaixo: 0, PercentBaixo: 0, PercentIdeal: 0, 
                PercentAlto: 0, PercentMuitoAlto: 0,
                ContagemMuitoBaixo: 0, ContagemBaixo: 0, ContagemIdeal: 0,
                ContagemAlto: 0, ContagemMuitoAlto: 0,
                Tendencia: null
            );
        }

        // Classificar por faixa
        var muitoBaixo = medicoes.Count(h => h < MUITO_BAIXO);
        var baixo = medicoes.Count(h => h >= MUITO_BAIXO && h < BAIXO);
        var ideal = medicoes.Count(h => h >= BAIXO && h <= IDEAL_MAX);
        var alto = medicoes.Count(h => h > IDEAL_MAX && h <= ALTO);
        var muitoAlto = medicoes.Count(h => h > ALTO);

        var total = medicoes.Count;

        // Calcular tendência comparando com período anterior
        var tendencia = await CalcularTendenciaTimeInRangeAsync(cuidadorId, dias);

        return new TimeInRangeDTO(
            TotalMedicoes: total,
            PercentMuitoBaixo: Math.Round((double)muitoBaixo / total * 100, 1),
            PercentBaixo: Math.Round((double)baixo / total * 100, 1),
            PercentIdeal: Math.Round((double)ideal / total * 100, 1),
            PercentAlto: Math.Round((double)alto / total * 100, 1),
            PercentMuitoAlto: Math.Round((double)muitoAlto / total * 100, 1),
            ContagemMuitoBaixo: muitoBaixo,
            ContagemBaixo: baixo,
            ContagemIdeal: ideal,
            ContagemAlto: alto,
            ContagemMuitoAlto: muitoAlto,
            Tendencia: tendencia
        );
    }

    private async Task<TendenciaDTO?> CalcularTendenciaTimeInRangeAsync(int cuidadorId, int dias)
    {
        var dataAtualInicio = DateTime.UtcNow.Date.AddDays(-dias);
        var dataAnteriorInicio = dataAtualInicio.AddDays(-dias);
        var dataAnteriorFim = dataAtualInicio.AddDays(-1);

        var registrosAnteriores = await _context.Registros
            .Where(r => r.CuidadorId == cuidadorId && r.Data >= dataAnteriorInicio && r.Data <= dataAnteriorFim)
            .ToListAsync();

        if (registrosAnteriores.Count < 3) return null;

        var medicoesAnteriores = new List<int>();
        foreach (var r in registrosAnteriores)
        {
            if (r.HgtAntes > 0) medicoesAnteriores.Add(r.HgtAntes);
            if (r.HgtDepois > 0) medicoesAnteriores.Add(r.HgtDepois);
        }

        if (medicoesAnteriores.Count == 0) return null;

        var idealAnterior = medicoesAnteriores.Count(h => h >= BAIXO && h <= IDEAL_MAX);
        var percentAnterior = (double)idealAnterior / medicoesAnteriores.Count * 100;

        var registrosAtuais = await _context.Registros
            .Where(r => r.CuidadorId == cuidadorId && r.Data >= dataAtualInicio)
            .ToListAsync();

        var medicoesAtuais = new List<int>();
        foreach (var r in registrosAtuais)
        {
            if (r.HgtAntes > 0) medicoesAtuais.Add(r.HgtAntes);
            if (r.HgtDepois > 0) medicoesAtuais.Add(r.HgtDepois);
        }

        if (medicoesAtuais.Count == 0) return null;

        var idealAtual = medicoesAtuais.Count(h => h >= BAIXO && h <= IDEAL_MAX);
        var percentAtual = (double)idealAtual / medicoesAtuais.Count * 100;

        var variacao = percentAtual - percentAnterior;
        var direcao = variacao > 2 ? "melhora" : (variacao < -2 ? "piora" : "estavel");

        return new TendenciaDTO(
            VariacaoPercentIdeal: Math.Round(variacao, 1),
            Direcao: direcao
        );
    }

    /// <summary>
    /// Gera alertas hierarquizados
    /// </summary>
    public async Task<AlertsResponseDTO> GetActiveAlertsAsync(int cuidadorId)
    {
        var hoje = DateTime.UtcNow.Date;
        var seteDias = hoje.AddDays(-7);

        var registrosRecentes = await _context.Registros
            .Where(r => r.CuidadorId == cuidadorId && r.Data >= seteDias)
            .OrderByDescending(r => r.Data)
            .ToListAsync();

        var criticos = new List<AlertDTO>();
        var atencao = new List<AlertDTO>();
        var informativos = new List<AlertDTO>();

        // CRÍTICOS: Hipoglicemias hoje
        var registrosHoje = registrosRecentes.Where(r => r.Data.Date == hoje).ToList();
        var hipoglicemiasHoje = registrosHoje.Count(r => r.HgtAntes < BAIXO || r.HgtDepois < BAIXO);
        if (hipoglicemiasHoje > 0)
        {
            criticos.Add(new AlertDTO(
                Severidade: AlertaSeveridade.Critical,
                Tipo: "HIPOGLICEMIA",
                Titulo: "Hipoglicemia Detectada",
                Mensagem: $"{hipoglicemiasHoje} valor(es) abaixo de 70 mg/dL hoje",
                Acao: "Contatar Dr. Fernando",
                DataOcorrencia: hoje
            ));
        }

        // CRÍTICOS: Valores muito altos (>300)
        var muitoAltoHoje = registrosHoje.Count(r => r.HgtAntes > 300 || r.HgtDepois > 300);
        if (muitoAltoHoje > 0)
        {
            criticos.Add(new AlertDTO(
                Severidade: AlertaSeveridade.Critical,
                Tipo: "HIPERGLICEMIA_SEVERA",
                Titulo: "Glicemia Muito Alta",
                Mensagem: $"{muitoAltoHoje} valor(es) acima de 300 mg/dL hoje",
                Acao: "Verificar dosagem de insulina",
                DataOcorrencia: hoje
            ));
        }

        // ATENÇÃO: Padrão de alta após refeições
        var mediasDepois = registrosRecentes
            .Where(r => r.HgtDepois > 0)
            .GroupBy(r => r.Refeicao)
            .Select(g => new { Refeicao = g.Key, Media = g.Average(r => r.HgtDepois) })
            .Where(x => x.Media > 200)
            .ToList();

        foreach (var media in mediasDepois)
        {
            atencao.Add(new AlertDTO(
                Severidade: AlertaSeveridade.Warning,
                Tipo: "PADRAO_ALTA",
                Titulo: "Padrão de Glicemia Alta",
                Mensagem: $"Glicemia média de {Math.Round(media.Media)} mg/dL após {GetNomeRefeicao(media.Refeicao)}",
                Acao: "Ver recomendações",
                DataOcorrencia: null
            ));
        }

        // ATENÇÃO: Verificar procedimentos cíclicos
        var procedimentos = await _context.ProcedimentosRecorrentes.Where(p => p.Ativo).ToListAsync();
        foreach (var proc in procedimentos)
        {
            var proximaData = proc.GetProximaData();
            if (proximaData.HasValue)
            {
                var diasRestantes = (proximaData.Value.Date - hoje).Days;
                if (diasRestantes <= 2 && diasRestantes >= 0)
                {
                    atencao.Add(new AlertDTO(
                        Severidade: AlertaSeveridade.Warning,
                        Tipo: "PROCEDIMENTO_PROXIMO",
                        Titulo: $"{proc.Nome} em breve",
                        Mensagem: diasRestantes == 0 ? "Hoje!" : $"Em {diasRestantes} dia(s)",
                        Acao: proc.Instrucoes,
                        DataOcorrencia: proximaData
                    ));
                }
            }
        }

        // INFORMATIVOS: Dias consecutivos em meta
        var diasEmMeta = CalcularDiasConsecutivosEmMeta(registrosRecentes);
        if (diasEmMeta >= 3)
        {
            informativos.Add(new AlertDTO(
                Severidade: AlertaSeveridade.Info,
                Tipo: "DIAS_EM_META",
                Titulo: "Excelente Controle!",
                Mensagem: $"{diasEmMeta} dias consecutivos com glicemia na meta",
                Acao: null,
                DataOcorrencia: null
            ));
        }

        // INFORMATIVOS: Próximo procedimento
        var proximoProcedimento = procedimentos
            .Select(p => new { Proc = p, Proxima = p.GetProximaData() })
            .Where(x => x.Proxima.HasValue && (x.Proxima.Value.Date - hoje).Days > 2)
            .OrderBy(x => x.Proxima)
            .FirstOrDefault();

        if (proximoProcedimento != null)
        {
            var dias = (proximoProcedimento.Proxima!.Value.Date - hoje).Days;
            informativos.Add(new AlertDTO(
                Severidade: AlertaSeveridade.Info,
                Tipo: "PROCEDIMENTO_FUTURO",
                Titulo: $"{proximoProcedimento.Proc.Nome}",
                Mensagem: $"Próxima aplicação em {dias} dias ({proximoProcedimento.Proxima.Value:dd/MM})",
                Acao: null,
                DataOcorrencia: proximoProcedimento.Proxima
            ));
        }

        return new AlertsResponseDTO(
            Criticos: criticos,
            Atencao: atencao,
            Informativos: informativos
        );
    }

    private int CalcularDiasConsecutivosEmMeta(List<Registro> registros)
    {
        var diasOrdenados = registros
            .GroupBy(r => r.Data.Date)
            .OrderByDescending(g => g.Key)
            .ToList();

        int consecutivos = 0;
        foreach (var dia in diasOrdenados)
        {
            var todasMedicoes = dia.SelectMany(r => new[] { r.HgtAntes, r.HgtDepois })
                                   .Where(h => h > 0)
                                   .ToList();

            if (todasMedicoes.Count == 0) break;

            var todasEmMeta = todasMedicoes.All(h => h >= BAIXO && h <= IDEAL_MAX);
            if (todasEmMeta)
                consecutivos++;
            else
                break;
        }

        return consecutivos;
    }

    /// <summary>
    /// Gera mapa de calor semanal
    /// </summary>
    public async Task<HeatmapResponseDTO> GenerateHeatmapAsync(int cuidadorId, int semanas = 4)
    {
        var dataInicio = DateTime.UtcNow.Date.AddDays(-semanas * 7);

        var registros = await _context.Registros
            .Where(r => r.CuidadorId == cuidadorId && r.Data >= dataInicio)
            .ToListAsync();

        var diasSemana = new[] { "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb" };
        var periodos = new[] { "Manhã", "Tarde", "Noite" };
        var celulas = new List<HeatmapCellDTO>();

        foreach (var dia in diasSemana)
        {
            foreach (var periodo in periodos)
            {
                var dayOfWeek = Array.IndexOf(diasSemana, dia);
                var registrosFiltrados = registros.Where(r =>
                {
                    var diaSemanaRegistro = (int)r.Data.DayOfWeek;
                    if (diaSemanaRegistro != dayOfWeek) return false;

                    var hora = r.HoraAntes.Hours;
                    return periodo switch
                    {
                        "Manhã" => hora >= 6 && hora < 12,
                        "Tarde" => hora >= 12 && hora < 18,
                        "Noite" => hora >= 18 || hora < 6,
                        _ => false
                    };
                }).ToList();

                var medicoes = registrosFiltrados
                    .SelectMany(r => new[] { r.HgtAntes, r.HgtDepois })
                    .Where(h => h > 0)
                    .ToList();

                if (medicoes.Count == 0)
                {
                    celulas.Add(new HeatmapCellDTO(dia, periodo, 0, "sem_dados", 0));
                    continue;
                }

                var media = medicoes.Average();
                var status = media switch
                {
                    < BAIXO => "critico",
                    > ALTO => "critico",
                    > IDEAL_MAX => "atencao",
                    _ => "controlado"
                };

                celulas.Add(new HeatmapCellDTO(dia, periodo, Math.Round(media, 0), status, medicoes.Count));
            }
        }

        return new HeatmapResponseDTO(
            Celulas: celulas,
            DiasSemana: diasSemana,
            Periodos: periodos
        );
    }

    /// <summary>
    /// Gera timeline detalhada de um dia
    /// </summary>
    public async Task<List<TimelineEventDTO>> GetTimelineAsync(int cuidadorId, DateTime data)
    {
        var registros = await _context.Registros
            .Where(r => r.CuidadorId == cuidadorId && r.Data.Date == data.Date)
            .OrderBy(r => r.HoraAntes)
            .ToListAsync();

        var eventos = new List<TimelineEventDTO>();

        foreach (var r in registros)
        {
            var delta = r.HgtDepois > 0 && r.HgtAntes > 0 ? r.HgtDepois - r.HgtAntes : (int?)null;
            var severidade = GetSeveridadeGlicemia(r.HgtAntes, r.HgtDepois);

            eventos.Add(new TimelineEventDTO(
                Timestamp: data.Date.Add(r.HoraAntes),
                Tipo: "refeicao",
                Titulo: GetNomeRefeicao(r.Refeicao),
                Descricao: $"HGT: {r.HgtAntes} → {r.HgtDepois} mg/dL",
                HgtAntes: r.HgtAntes,
                HgtDepois: r.HgtDepois,
                DeltaHgt: delta,
                Severidade: severidade,
                Medicamentos: r.MedicamentosTomados,
                DoseInsulina: r.DoseRapida > 0 ? r.DoseRapida : null
            ));
        }

        return eventos;
    }

    /// <summary>
    /// Analisa efetividade da insulina por dose
    /// </summary>
    public async Task<List<InsulinEffectivenessDTO>> AnalyzeInsulinEffectivenessAsync(int cuidadorId, int dias = 30)
    {
        var dataInicio = DateTime.UtcNow.Date.AddDays(-dias);

        var registros = await _context.Registros
            .Where(r => r.CuidadorId == cuidadorId && r.Data >= dataInicio && r.DoseRapida > 0)
            .ToListAsync();

        var porDose = registros
            .GroupBy(r => r.DoseRapida)
            .OrderBy(g => g.Key)
            .ToList();

        var resultado = new List<InsulinEffectivenessDTO>();

        foreach (var grupo in porDose)
        {
            var reducoes = grupo
                .Where(r => r.HgtAntes > 0 && r.HgtDepois > 0)
                .Select(r => r.HgtAntes - r.HgtDepois)
                .ToList();

            if (reducoes.Count == 0) continue;

            var mediaReducao = reducoes.Average();
            var sucessos = reducoes.Count(r => r > 0);
            var taxaSucesso = (double)sucessos / reducoes.Count * 100;

            resultado.Add(new InsulinEffectivenessDTO(
                DoseUI: grupo.Key,
                MediaReducao: Math.Round(mediaReducao, 0),
                TempoMedioEfeito: TimeSpan.FromHours(2), // Estimativa padrão
                TaxaSucesso: Math.Round(taxaSucesso, 0),
                TotalAplicacoes: grupo.Count()
            ));
        }

        return resultado;
    }

    /// <summary>
    /// Detecta padrões automáticos
    /// </summary>
    public async Task<List<PatternDTO>> DetectPatternsAsync(int cuidadorId, int dias = 30)
    {
        var dataInicio = DateTime.UtcNow.Date.AddDays(-dias);

        var registros = await _context.Registros
            .Where(r => r.CuidadorId == cuidadorId && r.Data >= dataInicio)
            .OrderBy(r => r.Data)
            .ToListAsync();

        var padroes = new List<PatternDTO>();

        // Padrão 1: Spikes recorrentes após refeição
        var porRefeicao = registros.GroupBy(r => r.Refeicao);
        foreach (var grupo in porRefeicao)
        {
            var spikes = grupo.Where(r => r.HgtDepois > 0 && r.HgtAntes > 0)
                              .Where(r => (double)(r.HgtDepois - r.HgtAntes) / r.HgtAntes > 0.4)
                              .ToList();

            if (spikes.Count >= 3)
            {
                padroes.Add(new PatternDTO(
                    Tipo: "spike_recorrente",
                    Titulo: $"Picos após {GetNomeRefeicao(grupo.Key)}",
                    Descricao: $"Glicemia sobe mais de 40% após {GetNomeRefeicao(grupo.Key)} em {spikes.Count} ocasiões",
                    CausasPossiveis: new List<string> { "Carboidratos em excesso", "Insulina insuficiente", "Alimentação muito rápida" },
                    Recomendacao: $"Considere ajustar a dose de insulina pré-{GetNomeRefeicao(grupo.Key).ToLower()}",
                    Severidade: AlertaSeveridade.Warning,
                    Ocorrencias: spikes.Select(s => s.Data).ToList()
                ));
            }
        }

        // Padrão 2: Hipoglicemias em horário específico
        var hipoglicemias = registros
            .Where(r => r.HgtAntes < BAIXO || r.HgtDepois < BAIXO)
            .GroupBy(r => r.HoraAntes.Hours / 6) // Dividir em períodos de 6h
            .Where(g => g.Count() >= 2)
            .ToList();

        foreach (var grupo in hipoglicemias)
        {
            var periodo = grupo.Key switch
            {
                0 => "madrugada (0h-6h)",
                1 => "manhã (6h-12h)",
                2 => "tarde (12h-18h)",
                _ => "noite (18h-24h)"
            };

            padroes.Add(new PatternDTO(
                Tipo: "hipoglicemia_horario",
                Titulo: $"Hipoglicemias na {periodo}",
                Descricao: $"{grupo.Count()} episódios de hipoglicemia neste período",
                CausasPossiveis: new List<string> { "Dose de insulina alta", "Refeição insuficiente", "Exercício físico" },
                Recomendacao: "Monitorar glicemia mais frequentemente neste horário",
                Severidade: AlertaSeveridade.Warning,
                Ocorrencias: grupo.Select(r => r.Data).ToList()
            ));
        }

        // Padrão 3: Tendência de alta contínua
        var ultimos7Dias = registros.Where(r => r.Data >= DateTime.UtcNow.Date.AddDays(-7)).ToList();
        var anteriores7Dias = registros.Where(r => r.Data >= DateTime.UtcNow.Date.AddDays(-14) && r.Data < DateTime.UtcNow.Date.AddDays(-7)).ToList();

        if (ultimos7Dias.Count >= 5 && anteriores7Dias.Count >= 5)
        {
            var mediaRecente = ultimos7Dias.Where(r => r.HgtDepois > 0).Average(r => r.HgtDepois);
            var mediaAnterior = anteriores7Dias.Where(r => r.HgtDepois > 0).Average(r => r.HgtDepois);

            if (mediaRecente > mediaAnterior * 1.15) // 15% de aumento
            {
                padroes.Add(new PatternDTO(
                    Tipo: "tendencia_alta",
                    Titulo: "Tendência de Alta",
                    Descricao: $"Glicemia média subiu de {Math.Round(mediaAnterior)} para {Math.Round(mediaRecente)} mg/dL",
                    CausasPossiveis: new List<string> { "Mudança na alimentação", "Redução de atividade física", "Estresse" },
                    Recomendacao: "Revisar hábitos alimentares e doses de insulina",
                    Severidade: AlertaSeveridade.Warning,
                    Ocorrencias: new List<DateTime>()
                ));
            }
        }

        return padroes;
    }

    private string GetNomeRefeicao(Registro.TipoRef tipo)
    {
        return tipo switch
        {
            Registro.TipoRef.Cafe => "Café da Manhã",
            Registro.TipoRef.Lanche => "Lanche",
            Registro.TipoRef.Almoco => "Almoço",
            Registro.TipoRef.Jantar => "Jantar",
            Registro.TipoRef.LancheMadrugada => "Madrugada",
            _ => "Refeição"
        };
    }

    private string GetSeveridadeGlicemia(int antes, int depois)
    {
        var valores = new[] { antes, depois }.Where(v => v > 0);
        if (!valores.Any()) return "ok";

        if (valores.Any(v => v < MUITO_BAIXO || v > 300)) return "critico";
        if (valores.Any(v => v < BAIXO || v > ALTO)) return "atencao";
        return "ok";
    }
}
