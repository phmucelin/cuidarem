namespace CuidaBem.DTOs;

public class RelatorioGeralDTO
{
  public DateTime DataInicio { get; set; }
  public DateTime DataFim { get; set; }
  public int TotalRegistros { get; set; }

  //Analise medica do Gastao
  public double MediaHgtAntes { get; set; }
  public double MediaHgtDepois { get; set; }
  public string TendenciaGlicemia { get; set; }

  //Pills Gastao
  public int TotalMedicamentosEsperados { get; set; }
  public int TotalMedicamentosTomados { get; set; }

  public List<CuidadorResumoDTO> Cuidadores { get; set; }
}

public class CuidadorResumoDTO
{
  public string Nome { get; set; }
  public int RegistrosCriados { get; set; }
}
