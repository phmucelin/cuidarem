using CuidaBem.DTOs;
using CuidaBem.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CuidaBem.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize]
public class ReportController : ControllerBase
{
    private readonly ReportAnalysisService _reportService;
    private readonly JwtService _jwtService;

    public ReportController(ReportAnalysisService reportService, JwtService jwtService)
    {
        _reportService = reportService;
        _jwtService = jwtService;
    }

    /// <summary>
    /// Obtém o Tempo no Alvo (Time in Range) - % de medições em cada faixa de glicemia
    /// </summary>
    [HttpGet("time-in-range")]
    public async Task<ActionResult<TimeInRangeDTO>> GetTimeInRange([FromQuery] int dias = 30)
    {
        var userId = _jwtService.GetUserIdFromClaims(User);
        if (userId == null) return Unauthorized();

        var result = await _reportService.CalculateTimeInRangeAsync(userId.Value, dias);
        return Ok(result);
    }

    /// <summary>
    /// Obtém alertas hierarquizados (Críticos, Atenção, Informativos)
    /// </summary>
    [HttpGet("alerts")]
    public async Task<ActionResult<AlertsResponseDTO>> GetAlerts()
    {
        var userId = _jwtService.GetUserIdFromClaims(User);
        if (userId == null) return Unauthorized();

        var result = await _reportService.GetActiveAlertsAsync(userId.Value);
        return Ok(result);
    }

    /// <summary>
    /// Obtém mapa de calor semanal (padrões por dia/horário)
    /// </summary>
    [HttpGet("heatmap")]
    public async Task<ActionResult<HeatmapResponseDTO>> GetHeatmap([FromQuery] int semanas = 4)
    {
        var userId = _jwtService.GetUserIdFromClaims(User);
        if (userId == null) return Unauthorized();

        var result = await _reportService.GenerateHeatmapAsync(userId.Value, semanas);
        return Ok(result);
    }

    /// <summary>
    /// Obtém timeline detalhada de um dia específico
    /// </summary>
    [HttpGet("timeline")]
    public async Task<ActionResult<List<TimelineEventDTO>>> GetTimeline([FromQuery] DateTime? data = null)
    {
        var userId = _jwtService.GetUserIdFromClaims(User);
        if (userId == null) return Unauthorized();

        var dataConsulta = data ?? DateTime.UtcNow.Date;
        var result = await _reportService.GetTimelineAsync(userId.Value, dataConsulta);
        return Ok(result);
    }

    /// <summary>
    /// Obtém análise de efetividade da insulina por dose
    /// </summary>
    [HttpGet("insulin-effectiveness")]
    public async Task<ActionResult<List<InsulinEffectivenessDTO>>> GetInsulinEffectiveness([FromQuery] int dias = 30)
    {
        var userId = _jwtService.GetUserIdFromClaims(User);
        if (userId == null) return Unauthorized();

        var result = await _reportService.AnalyzeInsulinEffectivenessAsync(userId.Value, dias);
        return Ok(result);
    }

    /// <summary>
    /// Obtém padrões detectados automaticamente
    /// </summary>
    [HttpGet("patterns")]
    public async Task<ActionResult<List<PatternDTO>>> GetPatterns([FromQuery] int dias = 30)
    {
        var userId = _jwtService.GetUserIdFromClaims(User);
        if (userId == null) return Unauthorized();

        var result = await _reportService.DetectPatternsAsync(userId.Value, dias);
        return Ok(result);
    }
}
