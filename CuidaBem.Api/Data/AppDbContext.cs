using Microsoft.EntityFrameworkCore;
using CuidaBem.Models;
namespace CuidaBem.Data;

public class AppDbContext : DbContext
{
    public DbSet<Registro> Registros => Set<Registro>();
    public DbSet<Cuidador> Cuidadores => Set<Cuidador>();
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Registro>(builder =>
        {
            builder.Property(x => x.Refeicao)
                .HasConversion<string>()
                .IsRequired();

            builder.Property(x => x.MedicamentosTomados)
                .HasColumnType("text[]");
        });
    }
}