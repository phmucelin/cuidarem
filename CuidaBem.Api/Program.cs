using System.Text;
using CuidaBem.Services;
using CuidaBem.Data;
using CuidaBem.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

// Controllers
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };
});

builder.Services.AddAuthorization();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:3000",
                "http://192.168.0.5:5173",
                "http://192.168.0.25:5173",
                "http://192.168.0.40:5173"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });

    // Policy mais permissiva para desenvolvimento
    options.AddPolicy("Development", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Services
builder.Services.AddScoped<RegistroServices>();
builder.Services.AddScoped<CuidadorServices>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<RelatorioServices>();
builder.Services.AddScoped<OrientacoesService>();
builder.Services.AddScoped<ReportAnalysisService>();

var app = builder.Build();

// Configure Swagger for development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// CORS - MUST COME BEFORE OTHER MIDDLEWARE
// Use AllowFrontend para permitir localhost:5173 com headers corretos no preflight
app.UseCors("AllowFrontend");

// Em desenvolvimento não redireciona HTTP->HTTPS (evita que o preflight perca os headers CORS)
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Seed do usuário família: só roda se SeedFamilia:Email e SeedFamilia:Password estiverem configurados
// (appsettings.json local, variáveis de ambiente SeedFamilia__Email / SeedFamilia__Password, ou User Secrets)
var seedEmail = builder.Configuration["SeedFamilia:Email"];
var seedPassword = builder.Configuration["SeedFamilia:Password"];
if (!string.IsNullOrWhiteSpace(seedEmail) && !string.IsNullOrWhiteSpace(seedPassword))
{
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var familia = db.Cuidadores.FirstOrDefault(c => c.Email == seedEmail.Trim());
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(seedPassword);
        if (familia != null)
        {
            familia.Tipo = TipoUsuario.Familia;
            familia.HashPassword = hashedPassword;
            familia.Nome ??= "Família";
            db.SaveChanges();
        }
        else
        {
            db.Cuidadores.Add(new Cuidador("Família", seedEmail.Trim(), hashedPassword, TipoUsuario.Familia));
            db.SaveChanges();
        }
    }
}

app.Run();
