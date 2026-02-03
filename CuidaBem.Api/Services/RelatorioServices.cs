using CuidaBem.DTOs;
using CuidaBem.Data;
using CuidaBem.Models;
using Microsoft.EntityFrameworkCore;
namespace CuidaBem.Services;

public class RelatorioServices
{
    private readonly AppDbContext _db;

    public RelatorioServices(AppDbContext db)
    {
        _db = db;
    }

    public async Task<RelatorioDTO> GetRelatorioCuidador(int cuidadorId, DateTime inicio, DateTime fim)
    {
        var cuidador = await _db.Cuidadores.FindAsync(cuidadorId);
        if (cuidador == null) return null;

        var registros = await _db.Registros
            .Where(r => r.CuidadorId == cuidadorId && r.Data >= inicio && r.Data <= fim)
            .OrderBy(r => r.Data)
            .ToListAsync();
        var totalRegistros = registros.Count;

        var taxaPreenchimento = registros.Any()
            ? registros.Average(r => CalcularTaxaPreenchimento(r))
            : 0;
        var registrosResumo = registros.Select(r => new RegistroResumoDTO
        {
            Id = r.Id,
            Data = r.Data,
            Refeicao = r.Refeicao,
            HoraAntes = r.HoraAntes,
            HoraDepois = r.HoraDepois,
            HgtAntes = r.HgtAntes,
            HgtDepois = r.HgtDepois,
            DoseLentaAnte = r.DoseLentaAnte,
            DoseRapida = r.DoseRapida,
            Temperatura = r.Temperatura,
            Saturacao = r.Saturacao,
            PressaoSistolica = r.PressaoSistolica,
            PressaoDiastolica = r.PressaoDiastolica,
            MedicamentosTomados = r.MedicamentosTomados ?? new List<string>(),
            Observacao = r.Observacao
        }).ToList();
        return new RelatorioDTO
        {
            CuidadorId = cuidadorId,
            NomeCuidador = cuidador.Nome,
            DataInicio = inicio,
            DataFim = fim,
            TotalRegistros = totalRegistros,
            TaxaPreenchimento = Math.Round(taxaPreenchimento, 2),
            Registros = registrosResumo
        };
    }
    public async Task<RelatorioGeralDTO> GerarRelatorioGeral(DateTime inicio, DateTime fim)
    {
        var registros = await _db.Registros
            .Include(r => r.Cuidador)
            .Where(r => r.Data >= inicio && r.Data <= fim)
            .ToListAsync();

        var totalRegistros = registros.Count;
        
        // Análise de glicemia
        var mediaHgtAntes = registros.Any() ? registros.Average(r => r.HgtAntes) : 0;
        var mediaHgtDepois = registros.Any() ? registros.Average(r => r.HgtDepois) : 0;
        
        // Tendência (compara primeira e segunda metade do período)
        var tendencia = CalcularTendencia(registros);
        
        // Medicamentos
        var totalMedicamentosEsperados = registros.Count * 3; // exemplo: 3 remédios por refeição
        var totalMedicamentosTomados = registros.Sum(r => r.MedicamentosTomados?.Count ?? 0);
        
        // Breakdown por cuidador
        var cuidadoresResumo = registros
            .GroupBy(r => r.Cuidador)
            .Select(g => new CuidadorResumoDTO
            {
                Nome = g.Key.Nome,
                RegistrosCriados = g.Count()
            })
            .ToList();

        return new RelatorioGeralDTO
        {
            DataInicio = inicio,
            DataFim = fim,
            TotalRegistros = totalRegistros,
            MediaHgtAntes = Math.Round(mediaHgtAntes, 1),
            MediaHgtDepois = Math.Round(mediaHgtDepois, 1),
            TendenciaGlicemia = tendencia,
            TotalMedicamentosEsperados = totalMedicamentosEsperados,
            TotalMedicamentosTomados = totalMedicamentosTomados,
            Cuidadores = cuidadoresResumo
        };
    }
    private double CalcularTaxaPreenchimento(Registro r)
    {
        int camposPreenchidos = 0;
        int totalCampos = 7;

        if (r.HgtAntes > 0) camposPreenchidos++;
        if (r.HgtDepois > 0) camposPreenchidos++;
        if (r.HoraAntes != TimeSpan.Zero) camposPreenchidos++; // ✅ Verifica se não é vazio
        if (r.HoraDepois != TimeSpan.Zero) camposPreenchidos++; // ✅
        if (r.DoseLentaAnte > 0) camposPreenchidos++;
        if (r.DoseRapida > 0) camposPreenchidos++;
        if (r.MedicamentosTomados?.Any() == true) camposPreenchidos++;

        return (double)camposPreenchidos / totalCampos * 100;
    }
    private string CalcularTendencia(List<Registro> registros)
    {
        if (!registros.Any()) return "Sem dados";

        var metade = registros.Count / 2;
        var primeiraParte = registros.Take(metade).Average(r => r.HgtDepois);
        var segundaParte = registros.Skip(metade).Average(r => r.HgtDepois);

        var diferenca = segundaParte - primeiraParte;

        if (diferenca < -10) return "Melhora";
        if (diferenca > 10) return "Piora";
        return "Estável";
    }
}