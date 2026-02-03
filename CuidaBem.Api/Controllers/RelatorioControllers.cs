using CuidaBem.Services;
using Microsoft.AspNetCore.Mvc;

namespace CuidaBem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RelatorioController : ControllerBase
{
    private readonly RelatorioServices _relatorioService;

    public RelatorioController(RelatorioServices relatorioService)
    {
        _relatorioService = relatorioService;
    }

    [HttpGet("individual/{cuidadorId}")]
    public async Task<IActionResult> RelatorioIndividual(
        int cuidadorId,
        [FromQuery] DateTime inicio,
        [FromQuery] DateTime fim)
    {
        var relatorio = await _relatorioService.GetRelatorioCuidador(cuidadorId, inicio, fim);
        
        if (relatorio == null)
            return NotFound(new { message = "Cuidador não encontrado" });
        
        return Ok(relatorio);
    }

    [HttpGet("geral")]
    public async Task<IActionResult> RelatorioGeral(
        [FromQuery] DateTime inicio,
        [FromQuery] DateTime fim)
    {
        var relatorio = await _relatorioService.GerarRelatorioGeral(inicio, fim);
        return Ok(relatorio);
    }
}
