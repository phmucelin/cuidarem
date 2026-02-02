using CuidaBem.Models;
using CuidaBem.Services;
using CuidaBem.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace CuidaBem.Controllers
{
    [ApiController]
    [Route("api/cuidadores")]
    public class CuidadorEndPoints : ControllerBase
    {
        private readonly CuidadorServices _cuidadorServices;
        private readonly JwtService _jwtService;

        public CuidadorEndPoints(CuidadorServices cuidadorServices, JwtService jwtService)
        {
            _cuidadorServices = cuidadorServices;
            _jwtService = jwtService;
        }
        
        [HttpPost("registro")]
        public async Task<IActionResult> Registro(CriaCuidadorDTO dto)
        {
            try
            {
                var cuidador = await _cuidadorServices.CriarCuidador(dto);
                var token = _jwtService.GenerateToken(cuidador);
                
                return Created("", new
                {
                    token,
                    user = new
                    {
                        id = cuidador.Id,
                        nome = cuidador.Nome,
                        email = cuidador.Email
                    }
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var cuidador = await _cuidadorServices.LoginCuidador(dto);
            if (cuidador == null) 
                return Unauthorized(new { message = "Email ou senha inválidos" });
            
            var token = _jwtService.GenerateToken(cuidador);
            
            return Ok(new
            {
                token,
                user = new
                {
                    id = cuidador.Id,
                    nome = cuidador.Nome,
                    email = cuidador.Email
                }
            });
        }
        
        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var userId = _jwtService.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new { message = "Token inválido" });
            
            var cuidador = await _cuidadorServices.ObterPorId(userId.Value);
            if (cuidador == null)
                return NotFound(new { message = "Usuário não encontrado" });
            
            return Ok(new
            {
                id = cuidador.Id,
                nome = cuidador.Nome,
                email = cuidador.Email,
                criadoEm = cuidador.CriadoEm
            });
        }
    }
}