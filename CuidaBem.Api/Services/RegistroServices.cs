using Microsoft.EntityFrameworkCore;
using CuidaBem.Models;
using CuidaBem.DTOs;
using CuidaBem.Data;
using CuidaBem.Exceptions;

namespace CuidaBem.Services;

public class RegistroServices
{
    private readonly AppDbContext _db;

    public RegistroServices(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Registro> CriarRegistro(CreateRegistroDTO registroRequest)
    {
        // var verified = await _db.Registros.Where(x =>
        //     x.Refeicao == registroRequest.Refeicao &&
        //     x.Data == registroRequest.Data &&
        //     x.HoraAntes == registroRequest.HoraAntes).AnyAsync();

        if (registroRequest.HoraDepois <= registroRequest.HoraAntes)
        {
            throw new BusinessException("HoraDepois deve ser maior que HoraAntes.");
        }

        // Converter data para UTC se necessário (PostgreSQL requer timestamp with time zone)
        var dataUtc = registroRequest.Data.Kind == DateTimeKind.Unspecified
            ? DateTime.SpecifyKind(registroRequest.Data, DateTimeKind.Utc)
            : registroRequest.Data.ToUniversalTime();

        var novoRegistro = new Registro(registroRequest.Refeicao,
            dataUtc,
            registroRequest.HoraAntes,
            registroRequest.HoraDepois,
            registroRequest.HgtAntes,
            registroRequest.HgtDepois,
            registroRequest.DoseLentaAnte,
            registroRequest.DoseRapida,
            registroRequest.Temperatura,
            registroRequest.Saturacao,
            registroRequest.PressaoSistolica,
            registroRequest.PressaoDiastolica,
            registroRequest.Observacao,
            registroRequest.CuidadorId,
            registroRequest.MedicamentosTomados);
        _db.Add(novoRegistro);
        await _db.SaveChangesAsync();
        return novoRegistro;
    }

    public async Task<Registro> EditaRegistro(int id, EditaDTO dto)
    {
        var editado = await _db.Registros.FindAsync(id);
        if (editado == null)
        {
            return null;
        }
        editado.Refeicao = dto.Refeicao;
        // Converter data para UTC se necessário
        editado.Data = dto.Data.Kind == DateTimeKind.Unspecified
            ? DateTime.SpecifyKind(dto.Data, DateTimeKind.Utc)
            : dto.Data.ToUniversalTime();
        editado.HoraAntes = dto.HoraAntes;
        editado.HoraDepois = dto.HoraDepois;
        editado.HgtAntes = dto.HgtAntes;
        editado.HgtDepois = dto.HgtDepois;
        editado.Observacao = dto.Observacao;

        await _db.SaveChangesAsync();

        return editado;
    }
    public async Task<bool> RemoverRegistro(int id)
    {
        var registrado = await _db.Registros.FindAsync(id);
        if (registrado == null) return false;
        _db.Registros.Remove(registrado);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<Registro?> ObterRegistro(int id)
    {
        return await _db.Registros.FindAsync(id);
    }

    public async Task<List<Registro>> ListarDoCuidador(int cuidadorId)
    {
        return await _db.Registros
            .Where(r => r.CuidadorId == cuidadorId)
            .OrderByDescending(r => r.Data)
            .ToListAsync();
    }
}
