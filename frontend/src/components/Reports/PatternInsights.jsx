import { useState, useEffect } from 'react';
import { Lightbulb, AlertTriangle, ChevronDown, ChevronUp, TrendingUp, Clock } from 'lucide-react';
import { reportsApi } from '../../services/api';
import './Reports.css';

/**
 * Insights e Padrões Automáticos
 * Exibe padrões detectados pelo sistema
 */
const PatternInsights = ({ dias = 30 }) => {
    const [patterns, setPatterns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedPattern, setExpandedPattern] = useState(null);

    useEffect(() => {
        loadPatterns();
    }, [dias]);

    const loadPatterns = async () => {
        try {
            setLoading(true);
            const result = await reportsApi.getPatterns(dias);
            setPatterns(result || []);
        } catch (err) {
            console.error('Erro ao carregar padrões:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="insights-card skeleton">
                <div className="skeleton-insight"></div>
            </div>
        );
    }

    if (patterns.length === 0) {
        return (
            <div className="insights-card empty">
                <Lightbulb size={24} />
                <p>Nenhum padrão identificado no período</p>
                <span>Continue registrando para obter insights</span>
            </div>
        );
    }

    const togglePattern = (idx) => {
        setExpandedPattern(expandedPattern === idx ? null : idx);
    };

    return (
        <div className="insights-card">
            <div className="insights-header">
                <Lightbulb size={20} />
                <h3>Padrões Identificados</h3>
            </div>

            <div className="patterns-list">
                {patterns.map((pattern, idx) => (
                    <div
                        key={idx}
                        className={`pattern-item ${pattern.severidade === 1 ? 'critical' : pattern.severidade === 2 ? 'warning' : 'info'}`}
                    >
                        <div
                            className="pattern-header"
                            onClick={() => togglePattern(idx)}
                        >
                            <div className="pattern-icon">
                                {pattern.tipo === 'spike_recorrente' ? (
                                    <TrendingUp size={18} />
                                ) : pattern.tipo === 'hipoglicemia_horario' ? (
                                    <Clock size={18} />
                                ) : (
                                    <AlertTriangle size={18} />
                                )}
                            </div>
                            <div className="pattern-title">
                                <strong>{pattern.titulo}</strong>
                                <p>{pattern.descricao}</p>
                            </div>
                            <div className="pattern-toggle">
                                {expandedPattern === idx ? (
                                    <ChevronUp size={20} />
                                ) : (
                                    <ChevronDown size={20} />
                                )}
                            </div>
                        </div>

                        {expandedPattern === idx && (
                            <div className="pattern-details">
                                {pattern.causasPossiveis?.length > 0 && (
                                    <div className="pattern-causes">
                                        <span className="detail-label">Possíveis causas:</span>
                                        <ul>
                                            {pattern.causasPossiveis.map((causa, i) => (
                                                <li key={i}>{causa}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {pattern.recomendacao && (
                                    <div className="pattern-recommendation">
                                        <div className="recommendation-header">
                                            <Lightbulb size={14} />
                                            <span className="detail-label">Sugestão:</span>
                                        </div>
                                        <p>{pattern.recomendacao}</p>
                                    </div>
                                )}

                                {pattern.ocorrencias?.length > 0 && (
                                    <div className="pattern-occurrences">
                                        <span className="detail-label">Ocorrências:</span>
                                        <span className="occurrences-count">
                                            {pattern.ocorrencias.length} vez(es) no período
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PatternInsights;
