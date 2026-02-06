import './Charts.css';

/**
 * Gráfico de linha para glicemia ao longo do tempo
 * Escala fixa de 50-300 mg/dL para melhor visualização
 */
const LineChart = ({ data, width = 300, height = 200, showLegend = true }) => {
    if (!data || data.length === 0) {
        return (
            <div className="chart-empty">
                <p>Sem dados para exibir</p>
            </div>
        );
    }

    const padding = { top: 20, right: 20, bottom: 30, left: 45 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Escala fixa para glicemia (mais adequada para diabetes)
    const yMin = 50;
    const yMax = 300;

    // Função para converter valor em coordenada Y (invertida para SVG)
    const scaleY = (value) => {
        const clampedValue = Math.max(yMin, Math.min(yMax, value));
        return chartHeight - ((clampedValue - yMin) / (yMax - yMin)) * chartHeight;
    };

    // Função para converter índice em coordenada X
    const scaleX = (index) => {
        return (index / (data.length - 1 || 1)) * chartWidth;
    };

    // Gerar pontos para linha "antes"
    const pontosAntes = data
        .map((d, i) => {
            if (d.hgtAntes <= 0) return null;
            return `${scaleX(i)},${scaleY(d.hgtAntes)}`;
        })
        .filter(Boolean)
        .join(' ');

    // Gerar pontos para linha "depois"
    const pontosDepois = data
        .map((d, i) => {
            if (d.hgtDepois <= 0) return null;
            return `${scaleX(i)},${scaleY(d.hgtDepois)}`;
        })
        .filter(Boolean)
        .join(' ');

    // Linhas de grade horizontais
    const gridLines = [70, 100, 150, 180, 250];

    return (
        <div className="chart-container">
            <svg width={width} height={height} className="line-chart">
                {/* Fundo com zonas de cor */}
                <rect
                    x={padding.left}
                    y={padding.top + scaleY(180)}
                    width={chartWidth}
                    height={scaleY(70) - scaleY(180)}
                    fill="rgba(52, 199, 89, 0.1)"
                />
                <rect
                    x={padding.left}
                    y={padding.top}
                    width={chartWidth}
                    height={scaleY(180)}
                    fill="rgba(255, 214, 10, 0.05)"
                />
                <rect
                    x={padding.left}
                    y={padding.top + scaleY(70)}
                    width={chartWidth}
                    height={chartHeight - scaleY(70)}
                    fill="rgba(255, 149, 0, 0.05)"
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
                    const y = padding.top + scaleY(value);
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

                {/* Linha HGT Antes */}
                {pontosAntes && (
                    <polyline
                        points={pontosAntes}
                        fill="none"
                        stroke="var(--color-blue)"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        transform={`translate(${padding.left}, ${padding.top})`}
                    />
                )}

                {/* Linha HGT Depois */}
                {pontosDepois && (
                    <polyline
                        points={pontosDepois}
                        fill="none"
                        stroke="var(--color-coral)"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        transform={`translate(${padding.left}, ${padding.top})`}
                    />
                )}

                {/* Pontos com valores */}
                {data.map((d, i) => {
                    if (d.hgtAntes > 0) {
                        return (
                            <g key={`antes-${i}`}>
                                <circle
                                    cx={padding.left + scaleX(i)}
                                    cy={padding.top + scaleY(d.hgtAntes)}
                                    r="5"
                                    fill="var(--color-blue)"
                                    stroke="white"
                                    strokeWidth="1.5"
                                />
                            </g>
                        );
                    }
                    return null;
                })}
                {data.map((d, i) => {
                    if (d.hgtDepois > 0) {
                        return (
                            <g key={`depois-${i}`}>
                                <circle
                                    cx={padding.left + scaleX(i)}
                                    cy={padding.top + scaleY(d.hgtDepois)}
                                    r="5"
                                    fill="var(--color-coral)"
                                    stroke="white"
                                    strokeWidth="1.5"
                                />
                            </g>
                        );
                    }
                    return null;
                })}

                {/* Labels do eixo X */}
                {data.map((d, i) => {
                    if (i % Math.ceil(data.length / 5) === 0 || i === data.length - 1) {
                        return (
                            <text
                                key={`label-${i}`}
                                x={padding.left + scaleX(i)}
                                y={height - 5}
                                fontSize="10"
                                fill="var(--text-secondary)"
                                textAnchor="middle"
                            >
                                {d.label}
                            </text>
                        );
                    }
                    return null;
                })}
            </svg>

            {showLegend && (
                <div className="chart-legend">
                    <div className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: 'var(--color-blue)' }}></span>
                        <span>HGT Antes</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: 'var(--color-coral)' }}></span>
                        <span>HGT Depois</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LineChart;
