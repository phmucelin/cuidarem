namespace CuidaBem.DTOs;

public class RelatorioDTO
{
  public int CuidadorId { get; set; }
  public string NomeCuidador { get; set; }
  public DateTime DataInicio { get; set; }
  public DateTime DataFim { get; set; }

  // Status de cada cuidador.
  public int TotalRegistros { get; set; }
  public double TaxaPreenchimento { get; set; }

  // Estatisticas adicionais
  public double MediaHgtAntes { get; set; }
  public double MediaHgtDepois { get; set; }
  public string TendenciaGlicemia { get; set; }
  public int TotalMedicamentosTomados { get; set; }

  public List<RegistroResumoDTO> Registros { get; set; }
}
