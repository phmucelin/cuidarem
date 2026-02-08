namespace CuidaBem.Models;

public class Medicamento
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Dosagem { get; set; } = string.Empty;
    public string Unidade { get; set; } = string.Empty; // CP, UI, Gotas, mL, Sache, Jato
    public TipoMedicamento Tipo { get; set; }
    public string? Instrucoes { get; set; }
    public Registro.TipoRef? Refeicao { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    
    public List<MedicamentoHorario> Horarios { get; set; } = new();
    public List<InsulinaDosagem>? DosagensVariaveis { get; set; }

    protected Medicamento() { }

    public Medicamento(string nome, string dosagem, string unidade, TipoMedicamento tipo, Registro.TipoRef? refeicao = null, string? instrucoes = null)
    {
        Nome = nome;
        Dosagem = dosagem;
        Unidade = unidade;
        Tipo = tipo;
        Refeicao = refeicao;
        Instrucoes = instrucoes;
    }
}

public enum TipoMedicamento
{
    Oral = 1,
    Injetavel = 2,
    Inalacao = 3,
    Nebulizacao = 4,
    Topico = 5
}
