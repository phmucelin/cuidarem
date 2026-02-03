import { parseLocalDate } from './date';

// Faixas de glicemia (em mg/dL)
export const GLICEMIA_META_MIN = 70;
export const GLICEMIA_META_MAX = 180;
export const GLICEMIA_ALTA = 250;
export const GLICEMIA_BAIXA = 70;

/**
 * Calcula estatísticas gerais dos registros
 */
export function calcularEstatisticas(registros) {
    if (!registros || registros.length === 0) {
        return {
            total: 0,
            mediaHgtAntes: 0,
            mediaHgtDepois: 0,
            taxaControle: 0,
            diasEmMeta: 0,
            diasForaMeta: 0,
            valoresAltos: 0,
            valoresBaixos: 0,
            totalInsulinaLenta: 0,
            totalInsulinaRapida: 0,
            mediaInsulinaLenta: 0,
            mediaInsulinaRapida: 0,
        };
    }

    const hgtAntes = registros.map(r => r.hgtAntes).filter(v => v > 0);
    const hgtDepois = registros.map(r => r.hgtDepois).filter(v => v > 0);
    const todasHgt = [...hgtAntes, ...hgtDepois];

    const mediaHgtAntes = hgtAntes.length > 0 
        ? hgtAntes.reduce((a, b) => a + b, 0) / hgtAntes.length 
        : 0;
    
    const mediaHgtDepois = hgtDepois.length > 0 
        ? hgtDepois.reduce((a, b) => a + b, 0) / hgtDepois.length 
        : 0;

    const emMeta = todasHgt.filter(h => h >= GLICEMIA_META_MIN && h <= GLICEMIA_META_MAX).length;
    const taxaControle = todasHgt.length > 0 ? (emMeta / todasHgt.length) * 100 : 0;

    // Dias únicos em meta/fora de meta
    const diasUnicos = new Set(registros.map(r => parseLocalDate(r.data).toDateString()));
    const diasEmMeta = Array.from(diasUnicos).filter(dia => {
        const registrosDoDia = registros.filter(r => 
            parseLocalDate(r.data).toDateString() === dia
        );
        return registrosDoDia.some(r => 
            (r.hgtAntes >= GLICEMIA_META_MIN && r.hgtAntes <= GLICEMIA_META_MAX) ||
            (r.hgtDepois >= GLICEMIA_META_MIN && r.hgtDepois <= GLICEMIA_META_MAX)
        );
    }).length;

    const valoresAltos = todasHgt.filter(h => h > GLICEMIA_ALTA).length;
    const valoresBaixos = todasHgt.filter(h => h < GLICEMIA_BAIXA).length;

    const totalInsulinaLenta = registros.reduce((sum, r) => sum + (r.doseLentaAnte || 0), 0);
    const totalInsulinaRapida = registros.reduce((sum, r) => sum + (r.doseRapida || 0), 0);
    const mediaInsulinaLenta = registros.length > 0 ? totalInsulinaLenta / registros.length : 0;
    const mediaInsulinaRapida = registros.length > 0 ? totalInsulinaRapida / registros.length : 0;

    return {
        total: registros.length,
        mediaHgtAntes: Math.round(mediaHgtAntes),
        mediaHgtDepois: Math.round(mediaHgtDepois),
        taxaControle: Math.round(taxaControle * 10) / 10,
        diasEmMeta,
        diasForaMeta: diasUnicos.size - diasEmMeta,
        valoresAltos,
        valoresBaixos,
        totalInsulinaLenta,
        totalInsulinaRapida,
        mediaInsulinaLenta: Math.round(mediaInsulinaLenta * 10) / 10,
        mediaInsulinaRapida: Math.round(mediaInsulinaRapida * 10) / 10,
    };
}

/**
 * Calcula estatísticas por tipo de refeição
 */
export function calcularEstatisticasPorRefeicao(registros) {
    const porRefeicao = {};

    registros.forEach(r => {
        const tipo = r.refeicao;
        if (!porRefeicao[tipo]) {
            porRefeicao[tipo] = {
                tipo,
                total: 0,
                mediaHgtAntes: 0,
                mediaHgtDepois: 0,
                totalInsulinaLenta: 0,
                totalInsulinaRapida: 0,
            };
        }

        porRefeicao[tipo].total++;
        porRefeicao[tipo].totalInsulinaLenta += r.doseLentaAnte || 0;
        porRefeicao[tipo].totalInsulinaRapida += r.doseRapida || 0;
    });

    // Calcular médias
    Object.keys(porRefeicao).forEach(tipo => {
        const refs = registros.filter(r => r.refeicao === parseInt(tipo));
        const hgtAntes = refs.map(r => r.hgtAntes).filter(v => v > 0);
        const hgtDepois = refs.map(r => r.hgtDepois).filter(v => v > 0);

        porRefeicao[tipo].mediaHgtAntes = hgtAntes.length > 0
            ? Math.round(hgtAntes.reduce((a, b) => a + b, 0) / hgtAntes.length)
            : 0;
        
        porRefeicao[tipo].mediaHgtDepois = hgtDepois.length > 0
            ? Math.round(hgtDepois.reduce((a, b) => a + b, 0) / hgtDepois.length)
            : 0;
    });

    return porRefeicao;
}

/**
 * Agrupa registros por período (dia, semana, mês)
 */
export function agruparPorPeriodo(registros, periodo = 'dia') {
    const grupos = {};

    registros.forEach(r => {
        const data = parseLocalDate(r.data);
        let chave;

        if (periodo === 'dia') {
            chave = data.toDateString();
        } else if (periodo === 'semana') {
            const inicioSemana = new Date(data);
            inicioSemana.setDate(data.getDate() - data.getDay());
            chave = inicioSemana.toDateString();
        } else if (periodo === 'mes') {
            chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        }

        if (!grupos[chave]) {
            grupos[chave] = [];
        }
        grupos[chave].push(r);
    });

    return grupos;
}

/**
 * Calcula tendência (últimos N dias vs anteriores)
 */
export function calcularTendencia(registros, dias = 7) {
    const hoje = new Date();
    const limite = new Date(hoje);
    limite.setDate(hoje.getDate() - dias);

    const recentes = registros.filter(r => {
        const data = parseLocalDate(r.data);
        return data >= limite && data <= hoje;
    });

    const anteriores = registros.filter(r => {
        const data = parseLocalDate(r.data);
        const limiteAnterior = new Date(limite);
        limiteAnterior.setDate(limite.getDate() - dias);
        return data >= limiteAnterior && data < limite;
    });

    const statsRecentes = calcularEstatisticas(recentes);
    const statsAnteriores = calcularEstatisticas(anteriores);

    return {
        recentes: statsRecentes,
        anteriores: statsAnteriores,
        variacaoMedia: statsAnteriores.mediaHgtDepois > 0
            ? Math.round(((statsRecentes.mediaHgtDepois - statsAnteriores.mediaHgtDepois) / statsAnteriores.mediaHgtDepois) * 100 * 10) / 10
            : 0,
        variacaoControle: statsAnteriores.taxaControle > 0
            ? Math.round((statsRecentes.taxaControle - statsAnteriores.taxaControle) * 10) / 10
            : 0,
    };
}

/**
 * Prepara dados para gráfico de linha (glicemia ao longo do tempo)
 */
export function prepararDadosGraficoLinha(registros, limiteDias = 30) {
    const hoje = new Date();
    const limite = new Date(hoje);
    limite.setDate(hoje.getDate() - limiteDias);

    const registrosFiltrados = registros
        .filter(r => {
            const data = parseLocalDate(r.data);
            return data >= limite;
        })
        .sort((a, b) => {
            const dataA = parseLocalDate(a.data);
            const dataB = parseLocalDate(b.data);
            return dataA - dataB;
        });

    return registrosFiltrados.map(r => ({
        data: parseLocalDate(r.data),
        hgtAntes: r.hgtAntes,
        hgtDepois: r.hgtDepois,
        label: parseLocalDate(r.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    }));
}

/**
 * Prepara dados para gráfico de barras (médias por refeição)
 */
export function prepararDadosGraficoBarras(registros) {
    const statsPorRefeicao = calcularEstatisticasPorRefeicao(registros);
    
    return Object.values(statsPorRefeicao).map(stats => ({
        tipo: stats.tipo,
        mediaAntes: stats.mediaHgtAntes,
        mediaDepois: stats.mediaHgtDepois,
    }));
}
