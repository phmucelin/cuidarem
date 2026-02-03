import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { relatorioApi } from '../../services/api';
import Card from '../../components/Card/Card';
import {
    Activity,
    Droplets,
    Pill,
    Users,
    TrendingUp,
    Calendar
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [datas, setDatas] = useState({
        inicio: new Date().toISOString().split('T')[0],
        fim: new Date().toISOString().split('T')[0]
    });

    const fetchRelatorio = async () => {
        try {
            setLoading(true);
            const inicio = new Date(datas.inicio);
            const fim = new Date(datas.fim);
            fim.setHours(23, 59, 59);

            const data = await relatorioApi.getGeral(inicio, fim);
            setStats(data);
        } catch (error) {
            console.error('Erro ao carregar relatório geral:', error);
            alert('Erro ao carregar dados.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRelatorio();
    }, [datas]);

    return (
        <div className="admin-container">
            <header className="admin-header">
                <div>
                    <h1>Painel da Família</h1>
                    <p>Visão geral de todos os cuidadores</p>
                </div>
                <button onClick={logout} className="logout-btn">Sair</button>
            </header>

            <Card className="filter-card">
                <div className="filter-content">
                    <div className="date-field">
                        <label>Início</label>
                        <input
                            type="date"
                            value={datas.inicio}
                            onChange={e => setDatas({ ...datas, inicio: e.target.value })}
                        />
                    </div>
                    <div className="date-field">
                        <label>Fim</label>
                        <input
                            type="date"
                            value={datas.fim}
                            onChange={e => setDatas({ ...datas, fim: e.target.value })}
                        />
                    </div>
                </div>
            </Card>

            {loading ? (
                <div className="loading-state">Carregando dados...</div>
            ) : stats ? (
                <div className="admin-content">
                    {/* Stats Grid */}
                    <div className="stats-grid">
                        <Card padding="md">
                            <div className="stat-item">
                                <div className="stat-icon-bg blue">
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <span className="stat-number">{stats.totalRegistros}</span>
                                    <span className="stat-desc">Total de Registros</span>
                                </div>
                            </div>
                        </Card>

                        <Card padding="md">
                            <div className="stat-item">
                                <div className="stat-icon-bg green">
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <span className="stat-number">{stats.tendenciaGlicemia}</span>
                                    <span className="stat-desc">Tendência Geral</span>
                                </div>
                            </div>
                        </Card>

                        <Card padding="md">
                            <div className="stat-item">
                                <div className="stat-icon-bg purple">
                                    <Pill size={24} />
                                </div>
                                <div>
                                    <span className="stat-number">{stats.totalMedicamentosTomados}</span>
                                    <span className="stat-desc">Medicamentos</span>
                                </div>
                            </div>
                        </Card>

                        <Card padding="md">
                            <div className="stat-item">
                                <div className="stat-icon-bg coral">
                                    <Droplets size={24} />
                                </div>
                                <div>
                                    <span className="stat-number">{stats.mediaHgtAntes} / {stats.mediaHgtDepois}</span>
                                    <span className="stat-desc">Média HGT (Antes/Depois)</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <h2 className="section-title">Produtividade dos Cuidadores</h2>
                    <div className="caregivers-grid">
                        {stats.cuidadores?.map((c, idx) => (
                            <Card key={idx} padding="md">
                                <div className="caregiver-item">
                                    <div className="caregiver-icon">
                                        <Users size={20} />
                                    </div>
                                    <div className="caregiver-info">
                                        <span className="caregiver-name">{c.nome}</span>
                                        <span className="caregiver-stats">{c.registrosCriados} registros no período</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default AdminDashboard;
