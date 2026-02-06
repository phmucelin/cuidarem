using Microsoft.EntityFrameworkCore;
using CuidaBem.Models;
namespace CuidaBem.Data;

public class AppDbContext : DbContext
{
    public DbSet<Registro> Registros => Set<Registro>();
    public DbSet<Cuidador> Cuidadores => Set<Cuidador>();
    public DbSet<Medicamento> Medicamentos => Set<Medicamento>();
    public DbSet<MedicamentoHorario> MedicamentoHorarios => Set<MedicamentoHorario>();
    public DbSet<InsulinaDosagem> InsulinaDosagens => Set<InsulinaDosagem>();
    public DbSet<ProcedimentoRecorrente> ProcedimentosRecorrentes => Set<ProcedimentoRecorrente>();
    public DbSet<OrientacaoExecucao> OrientacaoExecucoes => Set<OrientacaoExecucao>();
    
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Registro configuration
        modelBuilder.Entity<Registro>(builder =>
        {
            builder.Property(x => x.Refeicao)
                .HasConversion<string>()
                .IsRequired();

            builder.Property(x => x.MedicamentosTomados)
                .HasColumnType("text[]");
        });
        
        // Medicamento configuration
        modelBuilder.Entity<Medicamento>(builder =>
        {
            builder.Property(x => x.Tipo)
                .HasConversion<string>()
                .IsRequired();
                
            builder.HasMany(x => x.Horarios)
                .WithOne(x => x.Medicamento)
                .HasForeignKey(x => x.MedicamentoId)
                .OnDelete(DeleteBehavior.Cascade);
                
            builder.HasMany(x => x.DosagensVariaveis)
                .WithOne(x => x.Medicamento)
                .HasForeignKey(x => x.MedicamentoId)
                .OnDelete(DeleteBehavior.Cascade);
        });
        
        // MedicamentoHorario configuration
        modelBuilder.Entity<MedicamentoHorario>(builder =>
        {
            builder.Property(x => x.DiasSemana)
                .HasColumnType("integer[]");
        });
        
        // ProcedimentoRecorrente configuration
        modelBuilder.Entity<ProcedimentoRecorrente>(builder =>
        {
            builder.Property(x => x.Tipo)
                .HasConversion<string>()
                .IsRequired();
        });
        
        // OrientacaoExecucao configuration
        modelBuilder.Entity<OrientacaoExecucao>(builder =>
        {
            builder.Property(x => x.Tipo)
                .HasConversion<string>()
                .IsRequired();
                
            builder.HasOne(x => x.Cuidador)
                .WithMany()
                .HasForeignKey(x => x.CuidadorId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}