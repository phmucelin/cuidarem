using CuidaBem.DTOs;
using CuidaBem.Models;
using CuidaBem.Data;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;

namespace CuidaBem.Services;

public class CuidadorServices
{
    private readonly AppDbContext _db;

    public CuidadorServices(AppDbContext db)
    {
        _db = db;
    }
    
    public async Task<Cuidador> CriarCuidador(CriaCuidadorDTO dto)
    {
        // Verificar se email já existe
        var existente = await _db.Cuidadores.FirstOrDefaultAsync(c => c.Email == dto.Email);
        if (existente != null)
        {
            throw new InvalidOperationException("Email já cadastrado");
        }
        
        var hashedPass = BCrypt.Net.BCrypt.HashPassword(dto.HashPassword);
        var newCuidador = new Cuidador(dto.Nome, dto.Email, hashedPass);
        _db.Add(newCuidador);
        await _db.SaveChangesAsync();
        return newCuidador;
    }

    public async Task<Cuidador?> LoginCuidador(LoginDto dto)
    {
        var cuidador = await _db.Cuidadores.FirstOrDefaultAsync(c => c.Email == dto.Email);
        if (cuidador == null) return null;
    
        if (!BCrypt.Net.BCrypt.Verify(dto.Password, cuidador.HashPassword))
            return null;
            
        return cuidador;
    }
    
    public async Task<Cuidador?> ObterPorId(int id)
    {
        return await _db.Cuidadores.FindAsync(id);
    }
    
    public async Task<bool> AlterarSenha(AlteraSenhaDTO dto)
    {
        var cuidador = await _db.Cuidadores.FindAsync(dto.cuidadorId);
        if (cuidador == null) return false;
        
        if (!BCrypt.Net.BCrypt.Verify(dto.senhaAtual, cuidador.HashPassword))
            return false;
        
        cuidador.HashPassword = BCrypt.Net.BCrypt.HashPassword(dto.novaSenha);
        await _db.SaveChangesAsync();
    
        return true;
    }

    public async Task<List<Cuidador>> ListarTodosCuidadores()
    {
        return await _db.Cuidadores
            .Where(c => c.Tipo == TipoUsuario.Cuidador)
            .OrderBy(c => c.Nome)
            .ToListAsync();
    }
}