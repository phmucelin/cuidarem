import './Charts.css';

/**
 * Gráfico de linha simples para glicemia ao longo do tempo
 */
const LineChart = ({ data, width = 300, height = 200, showLegend = true }) => {
    if (!data || data.length === 0) {
        return (
            <div className="chart-empty">
                <p>Sem dados para exibir</p>
            </div>
        );
    }

    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Encontrar valores min/max para escala
    const todosValores = data.flatMap(d => [d.hgtAntes, d.hgtDepois]).filter(v => v > 0);
    const min = Math.min(...todosValores);
    const max = Math.max(...todosValores);
    const range = max - min || 1;
    const yMin = Math.max(0, min - range * 0.1);
    const yMax = max + range * 0.1;

    // Função para converter valor em coordenada Y
    const scaleY = (value) => {
        return chartHeight - ((value - yMin) / (yMax - yMin)) * chartHeight;
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

    return (
        <div className="chart-container">
            <svg width={width} height={height} className="line-chart">
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
                <text
                    x={padding.left - 5}
                    y={padding.top + scaleY(180) + 4}
                    fontSize="10"
                    fill="var(--text-secondary)"
                    textAnchor="end"
                >
                    180
                </text>

                {/* Linha de referência (mínimo) */}
                <line
                    x1={padding.left}
                    y1={padding.top + scaleY(70)}
                    x2={padding.left + chartWidth}
                    y2={padding.top + scaleY(70)}
                    stroke="var(--color-orange)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    opacity="0.5"
                />
                <text
                    x={padding.left - 5}
                    y={padding.top + scaleY(70) + 4}
                    fontSize="10"
                    fill="var(--text-secondary)"
                    textAnchor="end"
                >
                    70
                </text>

                {/* Linha HGT Antes */}
                {pontosAntes && (
                    <polyline
                        points={pontosAntes}
                        fill="none"
                        stroke="var(--color-blue)"
                        strokeWidth="2"
                        transform={`translate(${padding.left}, ${padding.top})`}
                    />
                )}

                {/* Linha HGT Depois */}
                {pontosDepois && (
                    <polyline
                        points={pontosDepois}
                        fill="none"
                        stroke="var(--color-coral)"
                        strokeWidth="2"
                        transform={`translate(${padding.left}, ${padding.top})`}
                    />
                )}

                {/* Pontos */}
                {data.map((d, i) => {
                    if (d.hgtAntes > 0) {
                        return (
                            <circle
                                key={`antes-${i}`}
                                cx={padding.left + scaleX(i)}
                                cy={padding.top + scaleY(d.hgtAntes)}
                                r="3"
                                fill="var(--color-blue)"
                            />
                        );
                    }
                    return null;
                })}
                {data.map((d, i) => {
                    if (d.hgtDepois > 0) {
                        return (
                            <circle
                                key={`depois-${i}`}
                                cx={padding.left + scaleX(i)}
                                cy={padding.top + scaleY(d.hgtDepois)}
                                r="3"
                                fill="var(--color-coral)"
                            />
                        );
                    }
                    return null;
                })}

                {/* Labels do eixo X (mostrar alguns apenas) */}
                {data.map((d, i) => {
                    if (i % Math.ceil(data.length / 5) === 0 || i === data.length - 1) {
                        return (
                            <text
                                key={`label-${i}`}
                                x={padding.left + scaleX(i)}
                                y={height - padding.bottom + 15}
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
