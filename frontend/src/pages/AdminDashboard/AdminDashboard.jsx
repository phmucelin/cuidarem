import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    BarChart3,
    TrendingUp,
    TrendingDown,
    Activity,
    Droplet,
    Calendar,
    ArrowLeft,
    LogOut,
    FileText,
    User,
    CheckCircle,
    AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { familiaApi } from '../../services/api';
import {
    calcularEstatisticas,
    prepararDadosGraficoLinha,
    prepararDadosGraficoBarras,
} from '../../utils/statistics';
import { parseLocalDate } from '../../utils/date';
import { LineChart, BarChart, PieChart } from '../../components/Charts';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import Button from '../../components/Button';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [cuidadores, setCuidadores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [periodo, setPeriodo] = useState('mes'); // semana, mes
    const [relatorioGeral, setRelatorioGeral] = useState(null);
    const [relatoriosIndividuais, setRelatoriosIndividuais] = useState({});
    const [cuidadorSelecionado, setCuidadorSelecionado] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (cuidadores.length > 0) {
            loadRelatorios();
        }
    }, [periodo, cuidadores]);

    const loadData = async () => {
        try {
            const cuidadoresData = await familiaApi.listarCuidadores();
            setCuidadores(cuidadoresData);
        } catch (error) {
            console.error('Erro ao carregar cuidadores:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadRelatorios = async () => {
        try {
            const hoje = new Date();
            const inicio = new Date(hoje);
            inicio.setDate(hoje.getDate() - (periodo === 'semana' ? 7 : 30));
            const fim = hoje;

            // Relatório geral
            const geral = await familiaApi.getRelatorioGeral(inicio, fim);
            setRelatorioGeral(geral);

            // Relatórios individuais
            const individuais = {};
            for (const cuidador of cuidadores) {
                try {
                    const relatorio = await familiaApi.getRelatorioCuidador(cuidador.id, inicio, fim);
                    individuais[cuidador.id] = relatorio;
                } catch (err) {
                    console.error(`Erro ao carregar relatório do cuidador ${cuidador.id}:`, err);
                }
            }
            setRelatoriosIndividuais(individuais);
        } catch (error) {
            console.error('Erro ao carregar relatórios:', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return <Loading fullScreen text="Carregando dashboard..." />;
    }

    return (
        <div className="admin-dashboard">
            {/* Header */}
            <header className="admin-header">
                <div className="admin-header-content">
                    <div>
                        <h1 className="admin-title">Dashboard Familiar</h1>
                        <p className="admin-subtitle">Visão geral de todos os cuidadores</p>
                    </div>
                    <div className="admin-actions">
                        <button onClick={handleLogout} className="logout-btn">
                            <LogOut size={20} />
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            {/* Filtro de Período */}
            <div style={{ padding: '0 16px', marginBottom: '16px' }}>
                <Card>
                    <div style={{ display: 'flex', gap: '8px', padding: '8px' }}>
                        <button
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
                    </div>
                </Card>
            </div>

            {/* Estatísticas Gerais */}
            {relatorioGeral && (
                <div style={{ padding: '0 16px', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
                        Estatísticas Gerais
                    </h2>
                    <div className="stats-grid">
                        <Card>
                            <div className="stat-card-content">
                                <div className="stat-icon" style={{ background: 'rgba(249, 123, 92, 0.1)' }}>
                                    <Activity size={24} color="var(--color-coral)" />
                                </div>
                                <div className="stat-value">{relatorioGeral.totalRegistros}</div>
                                <div className="stat-label">Total de Registros</div>
                            </div>
                        </Card>

                        <Card>
                            <div className="stat-card-content">
                                <div className="stat-icon" style={{ background: 'rgba(33, 150, 243, 0.1)' }}>
                                    <Droplet size={24} color="var(--color-blue)" />
                                </div>
                                <div className="stat-dual-value">
                                    <span>{Math.round(relatorioGeral.mediaHgtAntes)}</span>
                                    <span className="separator">/</span>
                                    <span>{Math.round(relatorioGeral.mediaHgtDepois)}</span>
                                </div>
                                <div className="stat-label">Média HGT (Antes/Depois)</div>
                            </div>
                        </Card>

                        <Card>
                            <div className="stat-card-content">
                                <div className="stat-icon" style={{ background: 'rgba(76, 175, 80, 0.1)' }}>
                                    <Users size={24} color="var(--color-green)" />
                                </div>
                                <div className="stat-value">{cuidadores.length}</div>
                                <div className="stat-label">Cuidadores Ativos</div>
                            </div>
                        </Card>

                        <Card>
                            <div className="stat-card-content">
                                <div className="stat-icon" style={{ background: 'rgba(255, 152, 0, 0.1)' }}>
                                    {relatorioGeral.tendenciaGlicemia === 'Melhora' ? (
                                        <TrendingDown size={24} color="var(--color-green)" />
                                    ) : relatorioGeral.tendenciaGlicemia === 'Piora' ? (
                                        <TrendingUp size={24} color="var(--color-coral)" />
                                    ) : (
                                        <BarChart3 size={24} color="var(--color-blue)" />
                                    )}
                                </div>
                                <div className="stat-value" style={{ fontSize: '18px' }}>
                                    {relatorioGeral.tendenciaGlicemia || 'Estável'}
                                </div>
                                <div className="stat-label">Tendência</div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* Lista de Cuidadores */}
            <div style={{ padding: '0 16px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
                    Cuidadores
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {cuidadores.map((cuidador) => {
                        const relatorio = relatoriosIndividuais[cuidador.id];
                        return (
                            <Card
                                key={cuidador.id}
                                style={{ cursor: 'pointer' }}
                                onClick={() => setCuidadorSelecionado(cuidadorSelecionado === cuidador.id ? null : cuidador.id)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '50%',
                                            background: 'var(--gradient-heart)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 700,
                                            fontSize: '18px',
                                        }}>
                                            {cuidador.nome.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '16px' }}>
                                                {cuidador.nome}
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                {cuidador.email}
                                            </div>
                                        </div>
                                    </div>
                                    {relatorio && (
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 600, fontSize: '14px' }}>
                                                {relatorio.totalRegistros} registros
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                Média: {Math.round(relatorio.mediaHgtDepois)} mg/dL
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Detalhes expandidos */}
                                {cuidadorSelecionado === cuidador.id && relatorio && (
                                    <div style={{
                                        marginTop: '16px',
                                        paddingTop: '16px',
                                        borderTop: '1px solid var(--bg-secondary)',
                                    }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
                                            <div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                                    Média HGT Antes
                                                </div>
                                                <div style={{ fontWeight: 600, fontSize: '18px' }}>
                                                    {Math.round(relatorio.mediaHgtAntes)} mg/dL
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                                    Média HGT Depois
                                                </div>
                                                <div style={{ fontWeight: 600, fontSize: '18px' }}>
                                                    {Math.round(relatorio.mediaHgtDepois)} mg/dL
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                                    Taxa Preenchimento
                                                </div>
                                                <div style={{ fontWeight: 600, fontSize: '18px' }}>
                                                    {relatorio.taxaPreenchimento}%
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                                    Tendência
                                                </div>
                                                <div style={{ fontWeight: 600, fontSize: '18px' }}>
                                                    {relatorio.tendenciaGlicemia}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Gráfico */}
                                        {relatorio.registros && relatorio.registros.length > 0 && (
                                            <div style={{ marginTop: '16px' }}>
                                                <LineChart
                                                    data={prepararDadosGraficoLinha(relatorio.registros.map(r => ({
                                                        data: r.data,
                                                        hgtAntes: r.hgtAntes,
                                                        hgtDepois: r.hgtDepois,
                                                    })), 30)}
                                                    width={300}
                                                    height={150}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Gráfico Geral */}
            {relatorioGeral && cuidadores.length > 0 && (
                <div style={{ padding: '0 16px', marginBottom: '24px' }}>
                    <Card>
                        <div style={{ padding: '16px' }}>
                            <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 700 }}>
                                Comparação entre Cuidadores
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {cuidadores.map((cuidador) => {
                                    const relatorio = relatoriosIndividuais[cuidador.id];
                                    if (!relatorio || relatorio.totalRegistros === 0) return null;
                                    return (
                                        <div key={cuidador.id} style={{
                                            padding: '12px',
                                            background: 'var(--bg-primary)',
                                            borderRadius: '8px',
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontWeight: 600 }}>{cuidador.nome}</span>
                                                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                                    {relatorio.totalRegistros} registros
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
                                                <div>
                                                    <span style={{ color: 'var(--text-secondary)' }}>Antes: </span>
                                                    <span style={{ fontWeight: 600 }}>{Math.round(relatorio.mediaHgtAntes)}</span>
                                                </div>
                                                <div>
                                                    <span style={{ color: 'var(--text-secondary)' }}>Depois: </span>
                                                    <span style={{ fontWeight: 600 }}>{Math.round(relatorio.mediaHgtDepois)}</span>
                                                </div>
                                                <div>
                                                    <span style={{ color: 'var(--text-secondary)' }}>Tendência: </span>
                                                    <span style={{ fontWeight: 600 }}>{relatorio.tendenciaGlicemia}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
