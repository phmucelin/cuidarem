using System.ComponentModel.DataAnnotations;

namespace CuidaBem.DTOs;

public class CriaCuidadorDTO
{
    [Required]
    public string Nome { get; set; }
    [Required]
    public string Email { get; set; }
    [Required]
    public string HashPassword { get; set; }
}

public class LoginDto
{
    [Required]
    public string Email { get; set; }
    [Required]
    public string Password { get; set; }
}

public record AlteraSenhaDTO(int cuidadorId, string senhaAtual, string novaSenha);