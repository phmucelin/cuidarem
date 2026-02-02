namespace CuidaBem.Models;

public class Cuidador
{
    public int Id { get; set; }
    public string Nome { get; set; }
    public string Email {get; set;}
    public string HashPassword { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public List<Registro> Registros { get; set; }
    
    protected Cuidador() {}

    public Cuidador(string nome, string email, string hashPassword)
    {
        Nome = nome;
        Email = email;
        HashPassword = hashPassword;
    }
}