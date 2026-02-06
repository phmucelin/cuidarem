namespace CuidaBem.Models;

public class RemedioModels
{
    public static class MedicamentosPadrao
    {
        public static List<string> Cafe = new() { "Pantoprazol 40mg", "Ezetimiba 10mg", "Xarelto 2,5mg", "Bisoprolol 1,25mg", "Velija 30mg", "Celabrat 100mg", "Primid 100mg", "Azitromicina 500mg - Segundas / Quartas / Sextas", "Insulina Glargilin (Lenta) - Aplicar antes do café da amanhã 12UI ás 08:00"};
        public static List<string> Lanche = new() { "Muvinlax : 1 Sache depois do lanche da tarde (15h/16h)"};
        public static List<string> Almoco = new() { ""};
        public static List<string> Janta = new() { "Cebralat 100mg", "Primid 100mg", "Lyrica 75mg", "Crestor 20mg - Rosuvastatina", "Duomo 2mg", "Bissulfato de Copidroguel 75mg", "Neutrofer 300mg", "Insulina Glargilin (Lenta) - Aplicar antes do Jantar 06UI ás 18:00"};
        public static List<string> Madrugada = new() { ""};

        public static List<string> ObterPorRefeicao(Registro.TipoRef refeicao)
        {
            return refeicao switch
            {
                Registro.TipoRef.Cafe => Cafe,
                Registro.TipoRef.Lanche => Lanche,
                Registro.TipoRef.Almoco => Almoco,
                Registro.TipoRef.Jantar => Janta,
                _ => new List<string>()
            };
        }
    }
}
