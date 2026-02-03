namespace CuidaBem.Models;

public class RemedioModels
{
    public static class MedicamentosPadrao
    {
        public static List<string> Cafe = new() { "Zolpidem", "Revoc" };
        public static List<string> Lanche = new() { "rrr", "aaaa" };
        public static List<string> Almoco = new() { "Remédio X", "Remédio Y" };
        public static List<string> Janta = new() { "Remédio Z", "Remédio W" };
        public static List<string> Madrugada = new() { "xx", "aaa" };
    
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