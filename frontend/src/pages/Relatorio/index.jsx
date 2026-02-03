import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { relatorioApi, TIPOS_REFEICAO } from '../../services/api';
import Card from '../../components/Card/Card';
// Importando ícones e configurando tamanho padrão
import {
    Calendar,
    Search,
    FileText,
    Activity,
    Clock,
    Thermometer,
    Droplets,
    Heart,
    Pill
} from 'lucide-react';
import './Relatorio.css';

const Relatorio = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [relatorio, setRelatorio] = useState(null);
    const [datas, setDatas] = useState({
        inicio: new Date().toISOString().split('T')[0],
        fim: new Date().toISOString().split('T')[0]
    });

    const handleCarregarRelatorio = async () => {
        try {
            setLoading(true);
            const inicio = new Date(datas.inicio);
            const fim = new Date(datas.fim);
            fim.setHours(23, 59, 59);

            const data = await relatorioApi.getIndividual(user.id, inicio, fim);
            setRelatorio(data);
        } catch (error) {
            console.error('Erro ao carregar relatório:', error);
            alert('Erro ao carregar relatório. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const getRefeicaoInfo = (id) => TIPOS_REFEICAO[id] || { label: 'Desconhecido', color: '#ccc' };

    const formatData = (dataInfo) => {
        return new Date(dataInfo).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long'
        });
    }

    return (
        <div className="relatorio-container fade-in">
            <header className="relatorio-header">
                <h1>Relatório de Saúde</h1>
                <p className="relatorio-subtitle">Acompanhe a evolução e histórico de cuidados.</p>
            </header>

            <Card className="filter-card">
                <div className="filter-card-content">
                    <div className="date-inputs">
                        <div className="date-field">
                            <label>Data Início</label>
                            <div className="input-wrapper">
                                <Calendar size={18} className="input-icon" />
                                <input
                                    type="date"
                                    value={datas.inicio}
                                    onChange={e => setDatas({ ...datas, inicio: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="date-field">
                            <label>Data Fim</label>
                            <div className="input-wrapper">
                                <Calendar size={18} className="input-icon" />
                                <input
                                    type="date"
                                    value={datas.fim}
                                    onChange={e => setDatas({ ...datas, fim: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        className="generate-btn"
                        onClick={handleCarregarRelatorio}
                        disabled={loading}
                    >
                        {loading ? <Activity className="animate-spin" /> : <Search size={20} />}
                        {loading ? 'Gerando...' : 'Gerar Relatório Completo'}
                    </button>
                </div>
            </Card>

            {relatorio && (
                <div className="relatorio-content slide-up">
                    <div className="summary-grid">
                        <Card padding="md">
                            <div className="stat-card-content">
                                <div className="stat-icon">
                                    <FileText size={24} />
                                </div>
                                <span className="stat-value">{relatorio.totalRegistros}</span>
                                <span className="stat-label">Registros</span>
                            </div>
                        </Card>
                        <Card padding="md">
                            <div className="stat-card-content">
                                <div className="stat-icon">
                                    <Activity size={24} />
                                </div>
                                <span className="stat-value">{relatorio.taxaPreenchimento}%</span>
                                <span className="stat-label">Preenchimento</span>
                            </div>
                        </Card>
                    </div>

                    <div className="records-container">
                        <h2 className="section-title">Histórico Detalhado</h2>

                        {relatorio.registros?.length > 0 ? (
                            relatorio.registros.map((reg, index) => {
                                const refeicao = getRefeicaoInfo(reg.refeicao);

                                return (
                                    <Card
                                        key={reg.id}
                                        className="record-item"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <div className="record-header">
                                            <div className="record-time">
                                                <Clock size={16} className="text-muted" />
                                                <span>{new Date(reg.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                <span className="record-date">• {formatData(reg.data)}</span>
                                            </div>
                                            <span
                                                className="meal-badge"
                                                style={{ backgroundColor: refeicao.color }}
                                            >
                                                {refeicao.label}
                                            </span>
                                        </div>

                                        <div className="record-metrics">
                                            <div className="metric-box">
                                                <Droplets size={18} className="metric-icon" />
                                                <div className="metric-info">
                                                    <span className="metric-label">Glicemia</span>
                                                    <span className="metric-value">
                                                        {reg.hgtAntes || '-'} / {reg.hgtDepois || '-'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="metric-box">
                                                <Heart size={18} className="metric-icon" />
                                                <div className="metric-info">
                                                    <span className="metric-label">Pressão</span>
                                                    <span className="metric-value">
                                                        {reg.pressaoSistolica > 0 ? `${reg.pressaoSistolica}/${reg.pressaoDiastolica}` : '-'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="metric-box">
                                                <Activity size={18} className="metric-icon" />
                                                <div className="metric-info">
                                                    <span className="metric-label">Saturação</span>
                                                    <span className="metric-value">
                                                        {reg.saturacao > 0 ? `${reg.saturacao}%` : '-'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="metric-box">
                                                <Thermometer size={18} className="metric-icon" />
                                                <div className="metric-info">
                                                    <span className="metric-label">Temp</span>
                                                    <span className="metric-value">
                                                        {reg.temperatura > 0 ? `${reg.temperatura}°C` : '-'}
                                                    </span>
                                                </div>
                                            </div>

                                            {reg.medicamentosTomados?.length > 0 && (
                                                <div className="metric-extra">
                                                    <Pill size={16} className="text-coral" />
                                                    <span className="meds-list">
                                                        {reg.medicamentosTomados.join(', ')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                );
                            })
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">📂</div>
                                <p>Nenhum registro encontrado no período selecionado.</p>
                            </div>
                        )}

                        <p style={{ textAlign: 'center', fontSize: '11px', color: '#999', marginTop: '16px' }}>
                            * Dados exibidos conforme registrados.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Relatorio;
