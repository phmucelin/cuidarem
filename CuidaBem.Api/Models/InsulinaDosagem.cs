namespace CuidaBem.Models;

public class InsulinaDosagem
{
    public int Id { get; set; }
    public int MedicamentoId { get; set; }
    public Medicamento Medicamento { get; set; } = null!;
    public int HgtMinimo { get; set; }
    public int? HgtMaximo { get; set; } // null = "acima de X"
    public int DoseUi { get; set; }
    public bool Aplicar { get; set; } = true;
    public bool AlertaCritico { get; set; } = false;
    public string? ContatoEmergencia { get; set; }
    public string? TelefoneEmergencia { get; set; }

    protected InsulinaDosagem() { }

    public InsulinaDosagem(
        int medicamentoId,
        int hgtMinimo,
        int? hgtMaximo,
        int doseUi,
        bool aplicar = true,
        bool alertaCritico = false,
        string? contatoEmergencia = null,
        string? telefoneEmergencia = null)
    {
        MedicamentoId = medicamentoId;
        HgtMinimo = hgtMinimo;
        HgtMaximo = hgtMaximo;
        DoseUi = doseUi;
        Aplicar = aplicar;
        AlertaCritico = alertaCritico;
        ContatoEmergencia = contatoEmergencia;
        TelefoneEmergencia = telefoneEmergencia;
    }
}
