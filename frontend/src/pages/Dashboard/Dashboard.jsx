import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    HeartPulse,
    BarChart3,
    Droplet,
    Coffee,
    Apple,
    UtensilsCrossed,
    Soup,
    Moon,
    ClipboardList,
    User,
    Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { registrosApi, TIPOS_REFEICAO } from '../../services/api';
import { parseLocalDate } from '../../utils/date';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        hoje: 0,
        ultimaGlicemia: null,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await registrosApi.listar();
            setRegistros(data);

            // Calcular estatísticas (usar data local para bater com o dia civil)
            const hoje = new Date().toDateString();
            const registrosHoje = data.filter(r =>
                parseLocalDate(r.data).toDateString() === hoje
            );

            setStats({
                total: data.length,
                hoje: registrosHoje.length,
                ultimaGlicemia: data[0]?.hgtDepois || null,
            });
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    const formatDate = (dateString) => {
        const date = parseLocalDate(dateString);
        return date.toLocaleDateString('pt-BR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    const getMealIcon = (typeId) => {
        switch (parseInt(typeId)) {
            case 1: return <Coffee size={24} />;
            case 2: return <Apple size={24} />;
            case 3: return <UtensilsCrossed size={24} />;
            case 4: return <Soup size={24} />;
            case 5: return <Moon size={24} />;
            default: return <UtensilsCrossed size={24} />;
        }
    };

    if (loading) {
        return <Loading fullScreen text="Carregando..." />;
    }

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="greeting">
                        <p className="greeting-text">{getGreeting()},</p>
                        <h1 className="user-name">{user?.nome?.split(' ')[0] || 'Cuidador'}</h1>
                    </div>
                    <div className="header-avatar">
                        <User size={32} />
                    </div>
                </div>
            </header>

            {/* Stats Cards */}
            <section className="stats-section">
                <Card variant="gradient" className="stat-card main-stat">
                    <div className="stat-icon">
                        <HeartPulse size={32} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.hoje}</span>
                        <span className="stat-label">Registros hoje</span>
                    </div>
                </Card>

                <div className="stats-row">
                    <Card className="stat-card">
                        <div className="stat-icon blue">
                            <BarChart3 size={28} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.total}</span>
                            <span className="stat-label">Total</span>
                        </div>
                    </Card>

                    <Card className="stat-card">
                        <div className="stat-icon green">
                            <Droplet size={28} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">
                                {stats.ultimaGlicemia || '--'}
                            </span>
                            <span className="stat-label">Última HGT</span>
                        </div>
                    </Card>
                </div>
            </section>

            {/* Quick Action */}
            <section className="quick-action">
                <Link to="/novo-registro" className="quick-action-btn">
                    <span className="action-plus">
                        <Plus size={24} />
                    </span>
                    <span>Novo Registro</span>
                </Link>
            </section>

            {/* Últimos Registros */}
            <section className="recent-section">
                <div className="section-header">
                    <h2 className="section-title">Últimos Registros</h2>
                    <Link to="/registros" className="see-all">Ver todos →</Link>
                </div>

                {registros.length === 0 ? (
                    <Card className="empty-state">
                        <div className="empty-icon">
                            <ClipboardList size={48} />
                        </div>
                        <p className="empty-text">Nenhum registro ainda</p>
                        <p className="empty-subtext">Comece adicionando seu primeiro registro!</p>
                    </Card>
                ) : (
                    <div className="registros-list">
                        {registros.slice(0, 3).map((registro, index) => (
                            <Link
                                key={registro.id}
                                to={`/editar-registro/${registro.id}`}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <Card
                                    className="registro-card"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="registro-icon" style={{ color: TIPOS_REFEICAO[registro.refeicao]?.color }}>
                                        {getMealIcon(registro.refeicao)}
                                    </div>
                                    <div className="registro-info">
                                        <span className="registro-tipo">
                                            {TIPOS_REFEICAO[registro.refeicao]?.label || 'Refeição'}
                                        </span>
                                        <span className="registro-date">{formatDate(registro.data)}</span>
                                    </div>
                                    <div className="registro-hgt">
                                        <span className="hgt-value">{registro.hgtDepois}</span>
                                        <span className="hgt-label">mg/dL</span>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Dashboard;
