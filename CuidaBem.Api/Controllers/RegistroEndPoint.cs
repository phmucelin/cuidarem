using CuidaBem.Models;
using CuidaBem.Services;
using CuidaBem.DTOs;
using CuidaBem.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace CuidaBem.Controllers
{
    [ApiController]
    [Route("api/registros")]
    [Authorize]
    public class RegistroEndPoint : ControllerBase
    {
        private readonly RegistroServices _registroServices;
        private readonly JwtService _jwtService;
        private readonly AppDbContext _context;

        public RegistroEndPoint(RegistroServices registroServices, JwtService jwtService, AppDbContext context)
        {
            _registroServices = registroServices;
            _jwtService = jwtService;
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CriaRegistro([FromBody] CreateRegistroDTO registro)
        {
            // Pegar o cuidadorId do token JWT
            var userId = _jwtService.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new { message = "Token inválido" });
            
            // Sobrescrever o CuidadorId com o do token para segurança
            registro.CuidadorId = userId.Value;
            
            var registrando = await _registroServices.CriarRegistro(registro);
            return Created("", registrando);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetRegistro(int id)
        {
            var registro = await _registroServices.ObterRegistro(id);
            if (registro == null) return NotFound();
            
            // Verificar se o registro pertence ao usuário logado
            var userId = _jwtService.GetUserIdFromClaims(User);
            if (registro.CuidadorId != userId)
                return Forbid();
            
            return Ok(registro);
        }

        [HttpGet]
        public async Task<IActionResult> ListarMeusRegistros()
        {
            var userId = _jwtService.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new { message = "Token inválido" });
            
            var registros = await _registroServices.ListarDoCuidador(userId.Value);
            return Ok(registros);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletarRegistro(int id)
        {
            // Verificar se o registro pertence ao usuário
            var registro = await _registroServices.ObterRegistro(id);
            if (registro == null) return NotFound();
            
            var userId = _jwtService.GetUserIdFromClaims(User);
            if (registro.CuidadorId != userId)
                return Forbid();
            
            var sucesso = await _registroServices.RemoverRegistro(id);
            if (!sucesso) return NotFound();
            return NoContent();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> AtualizarRegistro(int id, [FromBody] EditaDTO registro)
        {
            // Verificar se o registro pertence ao usuário
            var registroExistente = await _registroServices.ObterRegistro(id);
            if (registroExistente == null) return NotFound();
            
            var userId = _jwtService.GetUserIdFromClaims(User);
            if (registroExistente.CuidadorId != userId)
                return Forbid();
            
            var reg = await _registroServices.EditaRegistro(id, registro);
            return Ok(reg);
        }

        [HttpGet("medicamentos/{refeicao}")]
        public async Task<IActionResult> ObterMedicamentos(Registro.TipoRef refeicao)
        {
            // Mapear TipoRef para contexto de refeição
            var contexto = refeicao switch
            {
                Registro.TipoRef.Cafe => "CAFE",
                Registro.TipoRef.Lanche => "LANCHE",
                Registro.TipoRef.Almoco => "ALMOCO",
                Registro.TipoRef.Jantar => "JANTAR",
                _ => null
            };

            // Buscar do banco de dados
            var diaSemana = (int)DateTime.Now.DayOfWeek;
            
            var medicamentosDb = await _context.MedicamentoHorarios
                .Include(h => h.Medicamento)
                .Where(h => h.Ativo && 
                            h.ContextoRefeicao != null && 
                            h.ContextoRefeicao.ToUpper() == contexto &&
                            h.DiasSemana.Contains(diaSemana))
                .Select(h => $"{h.Medicamento.Nome} {h.Medicamento.Dosagem}")
                .Distinct()
                .ToListAsync();

            // Se não houver medicamentos no banco, usar lista estática como fallback
            if (medicamentosDb.Count == 0)
            {
                var medicamentosFallback = RemedioModels.MedicamentosPadrao.ObterPorRefeicao(refeicao);
                return Ok(medicamentosFallback);
            }

            return Ok(medicamentosDb);
        }
    }
}