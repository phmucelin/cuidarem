using CuidaBem.DTOs;
using CuidaBem.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CuidaBem.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrientacoesController : ControllerBase
{
    private readonly OrientacoesService _orientacoesService;

    public OrientacoesController(OrientacoesService orientacoesService)
    {
        _orientacoesService = orientacoesService;
    }

    /// <summary>
    /// Obtém as orientações do momento atual
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<OrientacoesDoDiaDTO>> GetOrientacoesAgora([FromQuery] int? hgt = null)
    {
        var orientacoes = await _orientacoesService.GetOrientacoesDoDia(hgt);
        return Ok(orientacoes);
    }

    /// <summary>
    /// Obtém todas as orientações do dia
    /// </summary>
    [HttpGet("dia")]
    public async Task<ActionResult<OrientacoesDoDiaDTO>> GetOrientacoesDia([FromQuery] int? hgt = null)
    {
        var orientacoes = await _orientacoesService.GetOrientacoesDoDia(hgt);
        return Ok(orientacoes);
    }

    /// <summary>
    /// Obtém orientações filtradas por refeição
    /// </summary>
    [HttpGet("refeicao/{tipo}")]
    public async Task<ActionResult<List<OrientacaoDTO>>> GetOrientacoesPorRefeicao(string tipo)
    {
        var orientacoes = await _orientacoesService.GetOrientacoesPorRefeicao(tipo);
        return Ok(orientacoes);
    }

    /// <summary>
    /// Calcula a dosagem de insulina baseada no HGT atual
    /// </summary>
    [HttpPost("insulina/dosagem")]
    public async Task<ActionResult<DosageInsulinaDTO>> CalcularDosageInsulina([FromBody] CalcularDosageRequest request)
    {
        TimeSpan? horario = null;
        if (!string.IsNullOrEmpty(request.Horario) && TimeSpan.TryParse(request.Horario, out var parsedHorario))
        {
            horario = parsedHorario;
        }

        var dosagem = await _orientacoesService.CalcularDosageInsulina(request.HgtAtual, horario);
        return Ok(dosagem);
    }

    /// <summary>
    /// Verifica alertas críticos baseado no HGT
    /// </summary>
    [HttpGet("alertas")]
    public async Task<ActionResult<List<AlertaCriticoDTO>>> VerificarAlertas([FromQuery] int hgt)
    {
        var alertas = await _orientacoesService.VerificarAlertas(hgt);
        return Ok(alertas);
    }

    /// <summary>
    /// Obtém os próximos procedimentos cíclicos
    /// </summary>
    [HttpGet("procedimentos/proximos")]
    public async Task<ActionResult<ProximoProcedimentoDTO?>> GetProximosProcedimentos()
    {
        var proximo = await _orientacoesService.GetProximoProcedimentoCiclico();
        return Ok(proximo);
    }

    /// <summary>
    /// Marca uma orientação como executada
    /// </summary>
    [HttpPost("executar")]
    public async Task<ActionResult> MarcarExecutada([FromBody] MarcarExecutadaRequest request)
    {
        var cuidadorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(cuidadorIdClaim) || !int.TryParse(cuidadorIdClaim, out var cuidadorId))
        {
            return Unauthorized();
        }

        var sucesso = await _orientacoesService.MarcarComoExecutada(cuidadorId, request);
        if (sucesso)
        {
            return Ok(new { message = "Orientação marcada como executada" });
        }

        return BadRequest(new { message = "Erro ao marcar orientação" });
    }
}
