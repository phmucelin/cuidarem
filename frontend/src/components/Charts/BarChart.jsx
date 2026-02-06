import './Charts.css';
import { TIPOS_REFEICAO } from '../../services/api';

/**
 * Gráfico de barras para médias por refeição
 * Escala fixa para melhor comparação visual
 */
const BarChart = ({ data, width = 300, height = 200, showLegend = true }) => {
    if (!data || data.length === 0) {
        return (
            <div className="chart-empty">
                <p>Sem dados para exibir</p>
            </div>
        );
    }

    const padding = { top: 20, right: 20, bottom: 50, left: 45 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Escala fixa para glicemia (50-300 mg/dL)
    const yMin = 50;
    const yMax = 300;

    const scaleY = (value) => {
        const clampedValue = Math.max(yMin, Math.min(yMax, value));
        return ((clampedValue - yMin) / (yMax - yMin)) * chartHeight;
    };

    // Calcular largura das barras baseado no número de itens
    const groupWidth = chartWidth / data.length;
    const barWidth = Math.min(groupWidth * 0.35, 40);
    const barGap = 4;

    // Linhas de grade
    const gridLines = [70, 100, 150, 180, 250];

    return (
        <div className="chart-container">
            <svg width={width} height={height} className="bar-chart">
                {/* Fundo com zona ideal */}
                <rect
                    x={padding.left}
                    y={padding.top + chartHeight - scaleY(180)}
                    width={chartWidth}
                    height={scaleY(180) - scaleY(70)}
                    fill="rgba(52, 199, 89, 0.1)"
                />

                {/* Eixos */}
                <line
                    x1={padding.left}
                    y1={padding.top + chartHeight}
                    x2={padding.left + chartWidth}
                    y2={padding.top + chartHeight}
                    stroke="var(--text-secondary)"
                    strokeWidth="1"
                />
                <line
                    x1={padding.left}
                    y1={padding.top}
                    x2={padding.left}
                    y2={padding.top + chartHeight}
                    stroke="var(--text-secondary)"
                    strokeWidth="1"
                />

                {/* Linhas de grade e labels Y */}
                {gridLines.map((value) => {
                    const y = padding.top + chartHeight - scaleY(value);
                    const isTarget = value === 70 || value === 180;
                    return (
                        <g key={value}>
                            <line
                                x1={padding.left}
                                y1={y}
                                x2={padding.left + chartWidth}
                                y2={y}
                                stroke={isTarget ? (value === 70 ? 'var(--color-orange)' : 'var(--color-green)') : 'var(--text-secondary)'}
                                strokeWidth={isTarget ? 1.5 : 0.5}
                                strokeDasharray={isTarget ? '4 4' : '2 2'}
                                opacity={isTarget ? 0.7 : 0.3}
                            />
                            <text
                                x={padding.left - 5}
                                y={y + 4}
                                fontSize="10"
                                fill="var(--text-secondary)"
                                textAnchor="end"
                            >
                                {value}
                            </text>
                        </g>
                    );
                })}

                {/* Barras */}
                {data.map((item, index) => {
                    const groupCenterX = padding.left + (index + 0.5) * groupWidth;
                    const alturaAntes = scaleY(item.mediaAntes);
                    const alturaDepois = scaleY(item.mediaDepois);
                    const refeicao = TIPOS_REFEICAO[item.tipo];

                    return (
                        <g key={index}>
                            {/* Barra Antes */}
                            {item.mediaAntes > 0 && (
                                <>
                                    <rect
                                        x={groupCenterX - barWidth - barGap / 2}
                                        y={padding.top + chartHeight - alturaAntes}
                                        width={barWidth}
                                        height={Math.max(alturaAntes, 2)}
                                        fill="var(--color-blue)"
                                        rx="3"
                                        ry="3"
                                    />
                                    <text
                                        x={groupCenterX - barWidth / 2 - barGap / 2}
                                        y={padding.top + chartHeight - alturaAntes - 5}
                                        fontSize="9"
                                        fill="var(--color-blue)"
                                        textAnchor="middle"
                                        fontWeight="600"
                                    >
                                        {Math.round(item.mediaAntes)}
                                    </text>
                                </>
                            )}
                            {/* Barra Depois */}
                            {item.mediaDepois > 0 && (
                                <>
                                    <rect
                                        x={groupCenterX + barGap / 2}
                                        y={padding.top + chartHeight - alturaDepois}
                                        width={barWidth}
                                        height={Math.max(alturaDepois, 2)}
                                        fill="var(--color-coral)"
                                        rx="3"
                                        ry="3"
                                    />
                                    <text
                                        x={groupCenterX + barWidth / 2 + barGap / 2}
                                        y={padding.top + chartHeight - alturaDepois - 5}
                                        fontSize="9"
                                        fill="var(--color-coral)"
                                        textAnchor="middle"
                                        fontWeight="600"
                                    >
                                        {Math.round(item.mediaDepois)}
                                    </text>
                                </>
                            )}
                            {/* Label da refeição */}
                            <text
                                x={groupCenterX}
                                y={height - padding.bottom + 18}
                                fontSize="10"
                                fill="var(--text-secondary)"
                                textAnchor="middle"
                            >
                                {refeicao?.label?.split(' ')[0] || item.tipo}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {showLegend && (
                <div className="chart-legend">
                    <div className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: 'var(--color-blue)' }}></span>
                        <span>Antes</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: 'var(--color-coral)' }}></span>
                        <span>Depois</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BarChart;
