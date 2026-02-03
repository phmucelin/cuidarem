namespace CuidaBem.DTOs;

public class RelatorioDTO
{
  public int CuidadorId { get; set; }
  public string NomeCuidador { get; set; }
  public DateTime DataInicio { get; set; }
  public DateTime DataFim { get; set; }

  // Status de cada cuidador.
  public int TotalRegistros { get; set; }
  public int RegistrosNoHorario { get; set; }
  public int RegistrosAtrasados { get; set; }
  public double TaxaPreenchimento { get; set; }

  public List<RegistroResumoDTO> Registros { get; set; }
}
