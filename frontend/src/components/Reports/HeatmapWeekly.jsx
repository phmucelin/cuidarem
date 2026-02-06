import { useState, useEffect } from 'react';
import { Grid3X3, Sun, Sunrise, Moon } from 'lucide-react';
import { reportsApi } from '../../services/api';
import './Reports.css';

/**
 * Mapa de Calor Semanal
 * Visualização 7x3 de padrões por dia da semana e período
 */
const HeatmapWeekly = ({ semanas = 4 }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [semanas]);

    const loadData = async () => {
        try {
            setLoading(true);
            const result = await reportsApi.getHeatmap(semanas);
            setData(result);
        } catch (err) {
            console.error('Erro ao carregar heatmap:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="heatmap-card skeleton">
                <div className="skeleton-grid"></div>
            </div>
        );
    }

    if (!data || !data.celulas) return null;

    const statusColors = {
        controlado: '#34c759',
        atencao: '#ffd60a',
        critico: '#ff3b30',
        sem_dados: '#2a2a3e'
    };

    // Organizar por período para criar grid
    const periodos = ['Manhã', 'Tarde', 'Noite'];
    const diasSemana = data.diasSemana || ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const getCelula = (dia, periodo) => {
        return data.celulas.find(c => c.diaSemana === dia && c.periodo === periodo);
    };

    const getPeriodoIcon = (periodo) => {
        switch (periodo) {
            case 'Manhã': return <Sunrise size={14} />;
            case 'Tarde': return <Sun size={14} />;
            case 'Noite': return <Moon size={14} />;
            default: return null;
        }
    };

    return (
        <div className="heatmap-card">
            <div className="heatmap-header">
                <Grid3X3 size={20} />
                <h3>Padrões por Horário</h3>
                <span className="heatmap-period">Últimas {semanas} semana{semanas > 1 ? 's' : ''}</span>
            </div>

            <div className="heatmap-grid">
                {/* Header com dias da semana */}
                <div className="heatmap-row header">
                    <div className="heatmap-cell label"></div>
                    {diasSemana.map(dia => (
                        <div key={dia} className="heatmap-cell day-label">{dia}</div>
                    ))}
                </div>

                {/* Linhas por período */}
                {periodos.map(periodo => (
                    <div key={periodo} className="heatmap-row">
                        <div className="heatmap-cell label periodo-label">
                            {getPeriodoIcon(periodo)}
                        </div>
                        {diasSemana.map(dia => {
                            const celula = getCelula(dia, periodo);
                            const status = celula?.status || 'sem_dados';
                            const media = celula?.mediaHgt || 0;

                            return (
                                <div
                                    key={`${dia}-${periodo}`}
                                    className={`heatmap-cell data ${status}`}
                                    style={{ backgroundColor: statusColors[status] }}
                                    title={media > 0 ? `${dia} ${periodo}: ${media} mg/dL` : `${dia} ${periodo}: Sem dados`}
                                >
                                    {status !== 'sem_dados' && media > 0 && (
                                        <span className="heatmap-value">{Math.round(media)}</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Legenda */}
            <div className="heatmap-legend">
                <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: statusColors.controlado }}></span>
                    <span>Controlado (70-180)</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: statusColors.atencao }}></span>
                    <span>Atenção (&gt;180)</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: statusColors.critico }}></span>
                    <span>Crítico (&gt;250 ou &lt;70)</span>
                </div>
            </div>
        </div>
    );
};

export default HeatmapWeekly;
