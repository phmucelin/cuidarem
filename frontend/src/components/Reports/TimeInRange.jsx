import { useState, useEffect } from 'react';
import { Target, TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle } from 'lucide-react';
import { reportsApi } from '../../services/api';
import './Reports.css';

/**
 * Widget de Tempo no Alvo (Time in Range)
 * Mostra % de medições em cada faixa de glicemia
 */
const TimeInRange = ({ dias = 30 }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, [dias]);

    const loadData = async () => {
        try {
            setLoading(true);
            const result = await reportsApi.getTimeInRange(dias);
            setData(result);
        } catch (err) {
            setError('Erro ao carregar dados');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="time-in-range-card skeleton">
                <div className="skeleton-bar"></div>
            </div>
        );
    }

    if (error || !data) {
        return null;
    }

    const {
        totalMedicoes,
        percentMuitoBaixo,
        percentBaixo,
        percentIdeal,
        percentAlto,
        percentMuitoAlto,
        tendencia
    } = data;

    // Cores para cada faixa
    const faixas = [
        { label: 'Muito Baixo', percent: percentMuitoBaixo, color: '#1a1a2e', textColor: '#fff', desc: '<54' },
        { label: 'Baixo', percent: percentBaixo, color: '#ff9500', textColor: '#000', desc: '54-69' },
        { label: 'Ideal', percent: percentIdeal, color: '#34c759', textColor: '#000', desc: '70-180' },
        { label: 'Alto', percent: percentAlto, color: '#ffd60a', textColor: '#000', desc: '181-250' },
        { label: 'Muito Alto', percent: percentMuitoAlto, color: '#ff3b30', textColor: '#fff', desc: '>250' },
    ].filter(f => f.percent > 0);

    const metaAtingida = percentIdeal >= 70;

    return (
        <div className="time-in-range-card">
            <div className="tir-header">
                <div className="tir-title">
                    <Target size={20} className="tir-icon" />
                    <h3>Tempo no Alvo</h3>
                </div>
                <span className="tir-period">{dias} dias | {totalMedicoes} medições</span>
            </div>

            {/* Barra de progresso segmentada */}
            <div className="tir-bar-container">
                <div className="tir-bar">
                    {faixas.map((faixa, idx) => (
                        <div
                            key={idx}
                            className="tir-segment"
                            style={{
                                width: `${faixa.percent}%`,
                                backgroundColor: faixa.color,
                                color: faixa.textColor,
                            }}
                            title={`${faixa.label}: ${faixa.percent}%`}
                        >
                            {faixa.percent >= 10 && <span>{faixa.percent}%</span>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Destaque do ideal */}
            <div className="tir-ideal-highlight">
                <div className="tir-ideal-value" style={{
                    color: metaAtingida ? 'var(--color-green)' : 'var(--color-coral)'
                }}>
                    {percentIdeal}%
                </div>
                <div className="tir-ideal-label">
                    <span>No Alvo (70-180 mg/dL)</span>
                    {metaAtingida ? (
                        <CheckCircle size={16} color="var(--color-green)" style={{ marginLeft: 6 }} />
                    ) : (
                        <AlertCircle size={16} color="var(--color-coral)" style={{ marginLeft: 6 }} />
                    )}
                </div>
                {tendencia && (
                    <div className={`tir-trend ${tendencia.direcao}`}>
                        {tendencia.direcao === 'melhora' ? (
                            <>
                                <TrendingUp size={16} />
                                <span>+{tendencia.variacaoPercentIdeal}% vs período anterior</span>
                            </>
                        ) : tendencia.direcao === 'piora' ? (
                            <>
                                <TrendingDown size={16} />
                                <span>{tendencia.variacaoPercentIdeal}% vs período anterior</span>
                            </>
                        ) : (
                            <>
                                <Minus size={16} />
                                <span>Estável vs período anterior</span>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Legenda */}
            <div className="tir-legend">
                {[
                    { color: '#1a1a2e', label: '<54', name: 'Muito Baixo' },
                    { color: '#ff9500', label: '54-69', name: 'Baixo' },
                    { color: '#34c759', label: '70-180', name: 'Ideal' },
                    { color: '#ffd60a', label: '181-250', name: 'Alto' },
                    { color: '#ff3b30', label: '>250', name: 'Muito Alto' },
                ].map((item, idx) => (
                    <div key={idx} className="tir-legend-item">
                        <div className="tir-legend-color" style={{ backgroundColor: item.color }}></div>
                        <span className="tir-legend-label">{item.label}</span>
                    </div>
                ))}
            </div>

            {/* Meta */}
            <div className="tir-meta-info">
                <span>Meta recomendada: 70% ou mais no alvo</span>
            </div>
        </div>
    );
};

export default TimeInRange;
