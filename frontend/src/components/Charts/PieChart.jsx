import './Charts.css';

/**
 * Gráfico de pizza simples para distribuição
 */
const PieChart = ({ data, width = 200, height = 200 }) => {
    if (!data || data.length === 0) {
        return (
            <div className="chart-empty">
                <p>Sem dados para exibir</p>
            </div>
        );
    }

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;

    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
        return (
            <div className="chart-empty">
                <p>Sem dados para exibir</p>
            </div>
        );
    }

    let currentAngle = -Math.PI / 2; // Começar do topo

    const paths = data.map((item, index) => {
        const percentage = item.value / total;
        const angle = percentage * 2 * Math.PI;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;

        const x1 = centerX + radius * Math.cos(startAngle);
        const y1 = centerY + radius * Math.sin(startAngle);
        const x2 = centerX + radius * Math.cos(endAngle);
        const y2 = centerY + radius * Math.sin(endAngle);

        const largeArc = percentage > 0.5 ? 1 : 0;

        const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
            'Z'
        ].join(' ');

        currentAngle = endAngle;

        return (
            <path
                key={index}
                d={pathData}
                fill={item.color}
                stroke="var(--bg-primary)"
                strokeWidth="2"
            />
        );
    });

    return (
        <div className="chart-container">
            <svg width={width} height={height} className="pie-chart">
                {paths}
                {/* Valor central */}
                <text
                    x={centerX}
                    y={centerY - 5}
                    fontSize="24"
                    fontWeight="bold"
                    fill="var(--text-primary)"
                    textAnchor="middle"
                >
                    {Math.round((data[0]?.value / total) * 100)}%
                </text>
                <text
                    x={centerX}
                    y={centerY + 15}
                    fontSize="12"
                    fill="var(--text-secondary)"
                    textAnchor="middle"
                >
                    {data[0]?.label || 'Controle'}
                </text>
            </svg>
        </div>
    );
};

export default PieChart;
