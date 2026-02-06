import { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, Phone, ChevronDown, ChevronUp, MessageCircle, Calendar } from 'lucide-react';
import { reportsApi } from '../../services/api';
import './Reports.css';

// Telefone do Dr. Fernando Portela
const DR_TELEFONE = '21999782547';

/**
 * Alertas Hierarquizados
 * Exibe alertas em 3 níveis: Crítico, Atenção, Informativo
 */
const HierarchicalAlerts = () => {
    const [alerts, setAlerts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedAlert, setExpandedAlert] = useState(null);

    useEffect(() => {
        loadAlerts();
    }, []);

    const loadAlerts = async () => {
        try {
            setLoading(true);
            const result = await reportsApi.getAlerts();
            setAlerts(result);
        } catch (err) {
            console.error('Erro ao carregar alertas:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (key) => {
        setExpandedAlert(expandedAlert === key ? null : key);
    };

    const handleCall = () => {
        window.location.href = `tel:+55${DR_TELEFONE}`;
    };

    const handleWhatsApp = (alert) => {
        const data = alert.dataOcorrencia
            ? new Date(alert.dataOcorrencia).toLocaleDateString('pt-BR')
            : 'hoje';

        // Clean emojis from title and message
        const title = (alert.titulo || '').replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu, '').trim();
        const details = (alert.mensagem || '').replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu, '').trim();

        const msg = encodeURIComponent(
            `Olá Dr. Fernando,\n\nEstou entrando em contato sobre o Gastao Mucelin.\n\n` +
            `Alerta: ${title}\n` +
            `Detalhes: ${details}\n` +
            `Data: ${data}\n\n` +
            `Preciso de orientação.`
        );
        window.open(`https://wa.me/55${DR_TELEFONE}?text=${msg}`, '_blank');
    };

    if (loading) {
        return (
            <div className="alerts-container skeleton">
                <div className="skeleton-alert"></div>
            </div>
        );
    }

    if (!alerts) return null;

    const { criticos, atencao, informativos } = alerts;
    const hasAlerts = criticos?.length > 0 || atencao?.length > 0 || informativos?.length > 0;

    if (!hasAlerts) return null;

    // Remove emojis from titles
    const cleanTitle = (title) => {
        return title?.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu, '').trim();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="hierarchical-alerts">
            {/* Alertas Críticos */}
            {criticos?.length > 0 && (
                <div className="alert-section alert-critical">
                    <div className="alert-header">
                        <AlertTriangle size={20} />
                        <span>ATENÇÃO URGENTE</span>
                    </div>
                    <div className="alert-list">
                        {criticos.map((alert, idx) => {
                            const key = `critical-${idx}`;
                            const isExpanded = expandedAlert === key;

                            return (
                                <div key={idx} className={`alert-item ${isExpanded ? 'expanded' : ''}`}>
                                    <div
                                        className="alert-content clickable"
                                        onClick={() => toggleExpand(key)}
                                    >
                                        <div className="alert-main">
                                            <strong>{cleanTitle(alert.titulo)}</strong>
                                            <p>{alert.mensagem}</p>
                                        </div>
                                        <span className="expand-icon">
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </span>
                                    </div>

                                    {isExpanded && (
                                        <div className="alert-expanded">
                                            {/* Detalhes da ocorrência */}
                                            <div className="alert-details">
                                                <div className="detail-item">
                                                    <Calendar size={16} />
                                                    <span>
                                                        {alert.dataOcorrencia
                                                            ? formatDate(alert.dataOcorrencia)
                                                            : 'Hoje'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Contato do médico */}
                                            <div className="doctor-contact">
                                                <p className="doctor-name">Dr. Fernando Portela</p>
                                                <p className="doctor-phone">(21) 99978-2547</p>
                                            </div>

                                            {/* Botões de ação */}
                                            <div className="action-buttons">
                                                <button
                                                    className="action-btn call"
                                                    onClick={(e) => { e.stopPropagation(); handleCall(); }}
                                                >
                                                    <Phone size={18} />
                                                    Ligar
                                                </button>
                                                <button
                                                    className="action-btn whatsapp"
                                                    onClick={(e) => { e.stopPropagation(); handleWhatsApp(alert); }}
                                                >
                                                    <MessageCircle size={18} />
                                                    WhatsApp
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Alertas de Atenção */}
            {atencao?.length > 0 && (
                <div className="alert-section alert-warning">
                    <div className="alert-header">
                        <AlertCircle size={20} />
                        <span>Requer Atenção</span>
                    </div>
                    <div className="alert-list">
                        {atencao.map((alert, idx) => {
                            const key = `warning-${idx}`;
                            const isExpanded = expandedAlert === key;

                            return (
                                <div key={idx} className={`alert-item ${isExpanded ? 'expanded' : ''}`}>
                                    <div
                                        className="alert-content clickable"
                                        onClick={() => toggleExpand(key)}
                                    >
                                        <div className="alert-main">
                                            <strong>{cleanTitle(alert.titulo)}</strong>
                                            <p>{alert.mensagem}</p>
                                        </div>
                                        <span className="expand-icon">
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </span>
                                    </div>

                                    {isExpanded && (
                                        <div className="alert-expanded">
                                            <div className="alert-details">
                                                {alert.dataOcorrencia && (
                                                    <div className="detail-item">
                                                        <Calendar size={16} />
                                                        <span>{formatDate(alert.dataOcorrencia)}</span>
                                                    </div>
                                                )}
                                                {alert.acao && (
                                                    <p className="alert-recommendation">{alert.acao}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Alertas Informativos */}
            {informativos?.length > 0 && (
                <div className="alert-section alert-info">
                    <div className="alert-header">
                        <Info size={20} />
                        <span>Observações</span>
                    </div>
                    <div className="alert-list">
                        {informativos.map((alert, idx) => (
                            <div key={idx} className="alert-item">
                                <div className="alert-content">
                                    <div className="alert-main">
                                        <strong>{cleanTitle(alert.titulo)}</strong>
                                        <p>{alert.mensagem}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HierarchicalAlerts;
