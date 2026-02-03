import './Charts.css';
import { TIPOS_REFEICAO } from '../../services/api';

/**
 * Gráfico de barras para médias por refeição
 */
const BarChart = ({ data, width = 300, height = 200, showLegend = true }) => {
    if (!data || data.length === 0) {
        return (
            <div className="chart-empty">
                <p>Sem dados para exibir</p>
            </div>
        );
    }

    const padding = { top: 20, right: 20, bottom: 50, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const barWidth = chartWidth / (data.length * 2.5);
    const gap = barWidth * 0.3;

    // Encontrar valor máximo para escala
    const todosValores = data.flatMap(d => [d.mediaAntes, d.mediaDepois]).filter(v => v > 0);
    const max = Math.max(...todosValores, 200);
    const scaleY = (value) => (value / max) * chartHeight;

    return (
        <div className="chart-container">
            <svg width={width} height={height} className="bar-chart">
                {/* Eixos */}
                <line
                    x1={padding.left}
                    y1={padding.top + chartHeight}
                    x2={padding.left + chartWidth}
                    y2={padding.top + chartHeight}
                    stroke="var(--text-secondary)"
                    strokeWidth="2"
                />
                <line
                    x1={padding.left}
                    y1={padding.top}
                    x2={padding.left}
                    y2={padding.top + chartHeight}
                    stroke="var(--text-secondary)"
                    strokeWidth="2"
                />

                {/* Linha de referência (meta) */}
                <line
                    x1={padding.left}
                    y1={padding.top + scaleY(180)}
                    x2={padding.left + chartWidth}
                    y2={padding.top + scaleY(180)}
                    stroke="var(--color-green)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    opacity="0.5"
                />

                {/* Barras */}
                {data.map((item, index) => {
                    const x = padding.left + (index * (barWidth * 2 + gap)) + barWidth * 0.5;
                    const alturaAntes = scaleY(item.mediaAntes);
                    const alturaDepois = scaleY(item.mediaDepois);
                    const refeicao = TIPOS_REFEICAO[item.tipo];

                    return (
                        <g key={index}>
                            {/* Barra Antes */}
                            {item.mediaAntes > 0 && (
                                <rect
                                    x={x - barWidth / 2}
                                    y={padding.top + chartHeight - alturaAntes}
                                    width={barWidth}
                                    height={alturaAntes}
                                    fill="var(--color-blue)"
                                    opacity="0.7"
                                />
                            )}
                            {/* Barra Depois */}
                            {item.mediaDepois > 0 && (
                                <rect
                                    x={x + barWidth / 2}
                                    y={padding.top + chartHeight - alturaDepois}
                                    width={barWidth}
                                    height={alturaDepois}
                                    fill="var(--color-coral)"
                                />
                            )}
                            {/* Label */}
                            <text
                                x={x}
                                y={height - padding.bottom + 15}
                                fontSize="9"
                                fill="var(--text-secondary)"
                                textAnchor="middle"
                            >
                                {refeicao?.label?.substring(0, 4) || item.tipo}
                            </text>
                        </g>
                    );
                })}

                {/* Valor máximo no eixo Y */}
                <text
                    x={padding.left - 5}
                    y={padding.top + 5}
                    fontSize="10"
                    fill="var(--text-secondary)"
                    textAnchor="end"
                >
                    {max}
                </text>
            </svg>

            {showLegend && (
                <div className="chart-legend">
                    <div className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: 'var(--color-blue)', opacity: 0.7 }}></span>
                        <span>Média Antes</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: 'var(--color-coral)' }}></span>
                        <span>Média Depois</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BarChart;
