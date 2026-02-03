import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar,
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart as PieChartIcon,
    Activity,
    AlertTriangle,
    CheckCircle,
    Droplet,
    Syringe,
    Zap,
    Coffee,
    Apple,
    UtensilsCrossed,
    Soup,
    Moon,
} from 'lucide-react';
import { registrosApi, TIPOS_REFEICAO } from '../../services/api';
import {
    calcularEstatisticas,
    calcularEstatisticasPorRefeicao,
    calcularTendencia,
    prepararDadosGraficoLinha,
    prepararDadosGraficoBarras,
    GLICEMIA_META_MIN,
    GLICEMIA_META_MAX,
} from '../../utils/statistics';
import { parseLocalDate } from '../../utils/date';
import { LineChart, BarChart, PieChart } from '../../components/Charts';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import './Relatorio.css';

// Datas padrão: últimos 30 dias para o filtro já começar válido
const getDefaultDates = () => {
    const hoje = new Date();
    const inicio = new Date(hoje);
    inicio.setDate(hoje.getDate() - 30);
    return {
        inicio: inicio.toISOString().split('T')[0],
        fim: hoje.toISOString().split('T')[0],
    };
};

const Relatorio = () => {
    const navigate = useNavigate();
    const defaults = getDefaultDates();
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [periodo, setPeriodo] = useState('mes'); // mes como padrão para mostrar mais registros
    const [dataInicio, setDataInicio] = useState(defaults.inicio);
    const [dataFim, setDataFim] = useState(defaults.fim);

    useEffect(() => {
        loadRegistros();
    }, []);

    useEffect(() => {
        if (registros.length > 0) {
            atualizarPeriodo();
        }
    }, [periodo, registros]);

    const loadRegistros = async () => {
        try {
            const data = await registrosApi.listar();
            setRegistros(data);
            atualizarPeriodo();
        } catch (error) {
            console.error('Erro ao carregar registros:', error);
        } finally {
            setLoading(false);
        }
    };

    const atualizarPeriodo = () => {
        const hoje = new Date();
        let inicio, fim;

        if (periodo === 'semana') {
            inicio = new Date(hoje);
            inicio.setDate(hoje.getDate() - 7);
            fim = hoje;
        } else if (periodo === 'mes') {
            inicio = new Date(hoje);
            inicio.setDate(hoje.getDate() - 30);
            fim = hoje;
        } else {
            // personalizado
            inicio = dataInicio ? new Date(dataInicio) : new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
            fim = dataFim ? new Date(dataFim) : hoje;
        }

        setDataInicio(inicio.toISOString().split('T')[0]);
        setDataFim(fim.toISOString().split('T')[0]);
    };

    const getRegistrosFiltrados = () => {
        if (!dataInicio || !dataFim) return registros;
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);
        if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime())) return registros;
        fim.setHours(23, 59, 59, 999);

        return registros.filter(r => {
            const data = parseLocalDate(r.data);
            return data >= inicio && data <= fim;
        });
    };

    const registrosFiltrados = getRegistrosFiltrados();
    const stats = calcularEstatisticas(registrosFiltrados);
    const statsPorRefeicao = calcularEstatisticasPorRefeicao(registrosFiltrados);
    const tendencia = calcularTendencia(registrosFiltrados, 7);
    const dadosGraficoLinha = prepararDadosGraficoLinha(registrosFiltrados, 30);
    const dadosGraficoBarras = prepararDadosGraficoBarras(registrosFiltrados);

    const getMealIcon = (typeId) => {
        switch (parseInt(typeId)) {
            case 1: return <Coffee size={16} />;
            case 2: return <Apple size={16} />;
            case 3: return <UtensilsCrossed size={16} />;
            case 4: return <Soup size={16} />;
            case 5: return <Moon size={16} />;
            default: return <UtensilsCrossed size={16} />;
        }
    };

    const getStatusGlicemia = (valor) => {
        if (valor < GLICEMIA_META_MIN) return { status: 'baixa', cor: 'var(--color-orange)', icon: AlertTriangle };
        if (valor > GLICEMIA_META_MAX) return { status: 'alta', cor: 'var(--color-coral)', icon: AlertTriangle };
        return { status: 'ok', cor: 'var(--color-green)', icon: CheckCircle };
    };

    if (loading) {
        return <Loading fullScreen text="Carregando relatório..." />;
    }

    return (
        <div className="relatorio-container">
            {/* Header */}
            <header className="relatorio-header">
                <button className="back-btn" onClick={() => navigate('/dashboard')} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 500,
                }}>
                    <ArrowLeft size={20} /> Voltar
                </button>
                <h1>Relatório de Estatísticas</h1>
                <p className="relatorio-subtitle">
                    Análise completa dos seus registros de glicemia
                </p>
            </header>

            {/* Filtros de Período */}
            <Card className="filter-card">
                <div className="filter-card-content">
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <button
                            className={`period-btn ${periodo === 'semana' ? 'active' : ''}`}
                            onClick={() => setPeriodo('semana')}
                            style={{
                                flex: 1,
                                padding: '10px',
                                border: periodo === 'semana' ? '2px solid var(--color-coral)' : '1px solid var(--bg-secondary)',
                                borderRadius: '8px',
                                background: periodo === 'semana' ? 'rgba(249, 123, 92, 0.1)' : 'var(--bg-input)',
                                color: 'var(--text-primary)',
                                fontWeight: periodo === 'semana' ? 600 : 400,
                                cursor: 'pointer',
                            }}
                        >
                            7 dias
                        </button>
                        <button
                            className={`period-btn ${periodo === 'mes' ? 'active' : ''}`}
                            onClick={() => setPeriodo('mes')}
                            style={{
                                flex: 1,
                                padding: '10px',
                                border: periodo === 'mes' ? '2px solid var(--color-coral)' : '1px solid var(--bg-secondary)',
                                borderRadius: '8px',
                                background: periodo === 'mes' ? 'rgba(249, 123, 92, 0.1)' : 'var(--bg-input)',
                                color: 'var(--text-primary)',
                                fontWeight: periodo === 'mes' ? 600 : 400,
                                cursor: 'pointer',
                            }}
                        >
                            30 dias
                        </button>
                        <button
                            className={`period-btn ${periodo === 'personalizado' ? 'active' : ''}`}
                            onClick={() => setPeriodo('personalizado')}
                            style={{
                                flex: 1,
                                padding: '10px',
                                border: periodo === 'personalizado' ? '2px solid var(--color-coral)' : '1px solid var(--bg-secondary)',
                                borderRadius: '8px',
                                background: periodo === 'personalizado' ? 'rgba(249, 123, 92, 0.1)' : 'var(--bg-input)',
                                color: 'var(--text-primary)',
                                fontWeight: periodo === 'personalizado' ? 600 : 400,
                                cursor: 'pointer',
                            }}
                        >
                            Personalizado
                        </button>
                    </div>

                    {periodo === 'personalizado' && (
                        <div className="date-inputs">
                            <div className="date-field">
                                <label>Data Início</label>
                                <div className="input-wrapper">
                                    <div className="input-icon">
                                        <Calendar size={18} />
                                    </div>
                                    <input
                                        type="date"
                                        value={dataInicio}
                                        onChange={(e) => setDataInicio(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="date-field">
                                <label>Data Fim</label>
                                <div className="input-wrapper">
                                    <div className="input-icon">
                                        <Calendar size={18} />
                                    </div>
                                    <input
                                        type="date"
                                        value={dataFim}
                                        onChange={(e) => setDataFim(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Estatísticas Principais */}
            <div className="summary-grid">
                <Card>
                    <div className="stat-card-content">
                        <div className="stat-icon" style={{ background: 'rgba(249, 123, 92, 0.1)' }}>
                            <Activity size={20} color="var(--color-coral)" />
                        </div>
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Total Registros</div>
                    </div>
                </Card>

                <Card>
                    <div className="stat-card-content">
                        <div className="stat-icon" style={{ background: 'rgba(76, 175, 80, 0.1)' }}>
                            <CheckCircle size={20} color="var(--color-green)" />
                        </div>
                        <div className="stat-value">{stats.taxaControle}%</div>
                        <div className="stat-label">Taxa de Controle</div>
                    </div>
                </Card>

                <Card>
                    <div className="stat-card-content">
                        <div className="stat-icon" style={{ background: 'rgba(33, 150, 243, 0.1)' }}>
                            <Droplet size={20} color="var(--color-blue)" />
                        </div>
                        <div className="stat-dual-value">
                            <span>{stats.mediaHgtAntes}</span>
                            <span className="separator">/</span>
                            <span>{stats.mediaHgtDepois}</span>
                        </div>
                        <div className="stat-label">Média HGT (Antes/Depois)</div>
                    </div>
                </Card>

                <Card>
                    <div className="stat-card-content">
                        <div className="stat-icon" style={{ background: 'rgba(255, 152, 0, 0.1)' }}>
                            <Syringe size={20} color="var(--color-orange)" />
                        </div>
                        <div className="stat-dual-value">
                            <span>{stats.totalInsulinaLenta}</span>
                            <span className="separator">/</span>
                            <span>{stats.totalInsulinaRapida}</span>
                        </div>
                        <div className="stat-label">Total Insulina (Lenta/Rápida)</div>
                    </div>
                </Card>
            </div>

            {/* Alertas */}
            {(stats.valoresAltos > 0 || stats.valoresBaixos > 0) && (
                <Card style={{ marginTop: '16px', border: '2px solid var(--color-orange)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px' }}>
                        <AlertTriangle size={24} color="var(--color-orange)" />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, marginBottom: '4px' }}>Atenção</div>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                {stats.valoresAltos > 0 && `${stats.valoresAltos} valores altos (>250 mg/dL)`}
                                {stats.valoresAltos > 0 && stats.valoresBaixos > 0 && ' • '}
                                {stats.valoresBaixos > 0 && `${stats.valoresBaixos} valores baixos (<70 mg/dL)`}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Gráfico de Tendência */}
            {dadosGraficoLinha.length > 0 && (
                <Card style={{ marginTop: '24px' }}>
                    <div style={{ padding: '16px' }}>
                        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 700 }}>
                            Evolução da Glicemia
                        </h3>
                        <LineChart data={dadosGraficoLinha} width={350} height={200} />
                    </div>
                </Card>
            )}

            {/* Gráfico de Pizza - Taxa de Controle */}
            <Card style={{ marginTop: '16px' }}>
                <div style={{ padding: '16px' }}>
                    <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 700 }}>
                        Taxa de Controle
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <PieChart
                            data={[
                                {
                                    value: stats.taxaControle,
                                    label: 'Em Meta',
                                    color: 'var(--color-green)',
                                },
                                {
                                    value: 100 - stats.taxaControle,
                                    label: 'Fora da Meta',
                                    color: 'var(--color-coral)',
                                },
                            ]}
                            width={200}
                            height={200}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '12px', height: '12px', background: 'var(--color-green)', borderRadius: '2px' }}></div>
                            <span style={{ fontSize: '14px' }}>Em Meta ({stats.taxaControle}%)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '12px', height: '12px', background: 'var(--color-coral)', borderRadius: '2px' }}></div>
                            <span style={{ fontSize: '14px' }}>Fora da Meta ({Math.round((100 - stats.taxaControle) * 10) / 10}%)</span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Gráfico de Barras - Médias por Refeição */}
            {dadosGraficoBarras.length > 0 && (
                <Card style={{ marginTop: '16px' }}>
                    <div style={{ padding: '16px' }}>
                        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 700 }}>
                            Médias por Tipo de Refeição
                        </h3>
                        <BarChart data={dadosGraficoBarras} width={350} height={200} />
                    </div>
                </Card>
            )}

            {/* Estatísticas por Refeição */}
            {Object.keys(statsPorRefeicao).length > 0 && (
                <Card style={{ marginTop: '16px' }}>
                    <div style={{ padding: '16px' }}>
                        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 700 }}>
                            Detalhes por Refeição
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {Object.values(statsPorRefeicao).map((stat) => {
                                const refeicao = TIPOS_REFEICAO[stat.tipo];
                                return (
                                    <div
                                        key={stat.tipo}
                                        style={{
                                            padding: '12px',
                                            background: 'var(--bg-primary)',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ color: refeicao?.color }}>
                                                {getMealIcon(stat.tipo)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{refeicao?.label}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                    {stat.total} registro{stat.total !== 1 ? 's' : ''}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '14px', fontWeight: 600 }}>
                                                {stat.mediaHgtAntes} / {stat.mediaHgtDepois}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                                Média HGT
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Card>
            )}

            {/* Comparação de Tendência */}
            {tendencia.recentes.total > 0 && tendencia.anteriores.total > 0 && (
                <Card style={{ marginTop: '16px' }}>
                    <div style={{ padding: '16px' }}>
                        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 700 }}>
                            Comparação: Últimos 7 dias vs Anteriores
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {tendencia.variacaoMedia >= 0 ? (
                                    <TrendingUp size={20} color="var(--color-coral)" />
                                ) : (
                                    <TrendingDown size={20} color="var(--color-green)" />
                                )}
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                        Média HGT Depois
                                    </div>
                                    <div style={{ fontWeight: 600 }}>
                                        {tendencia.recentes.mediaHgtDepois} mg/dL
                                        {tendencia.variacaoMedia !== 0 && (
                                            <span style={{
                                                color: tendencia.variacaoMedia > 0 ? 'var(--color-coral)' : 'var(--color-green)',
                                                marginLeft: '8px',
                                                fontSize: '12px',
                                            }}>
                                                ({tendencia.variacaoMedia > 0 ? '+' : ''}{tendencia.variacaoMedia}%)
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {tendencia.variacaoControle >= 0 ? (
                                    <TrendingUp size={20} color="var(--color-green)" />
                                ) : (
                                    <TrendingDown size={20} color="var(--color-coral)" />
                                )}
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                        Taxa de Controle
                                    </div>
                                    <div style={{ fontWeight: 600 }}>
                                        {tendencia.recentes.taxaControle}%
                                        {tendencia.variacaoControle !== 0 && (
                                            <span style={{
                                                color: tendencia.variacaoControle > 0 ? 'var(--color-green)' : 'var(--color-coral)',
                                                marginLeft: '8px',
                                                fontSize: '12px',
                                            }}>
                                                ({tendencia.variacaoControle > 0 ? '+' : ''}{tendencia.variacaoControle}%)
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Resumo de Dias */}
            <Card style={{ marginTop: '16px' }}>
                <div style={{ padding: '16px' }}>
                    <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 700 }}>
                        Resumo de Dias
                    </h3>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'space-around' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-green)' }}>
                                {stats.diasEmMeta}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                Dias em Meta
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-coral)' }}>
                                {stats.diasForaMeta}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                Dias Fora da Meta
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Relatorio;
