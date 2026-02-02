import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ClipboardList,
    Trash2,
    Pencil,
    Syringe,
    Zap,
    FileText,
    Plus,
    Coffee,
    Apple,
    UtensilsCrossed,
    Soup,
    Moon,
    ArrowRight,
    ArrowLeft
} from 'lucide-react';
import { registrosApi, TIPOS_REFEICAO } from '../../services/api';
import { parseLocalDate } from '../../utils/date';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import Button from '../../components/Button';
import './Registros.css';

const Registros = () => {
    const navigate = useNavigate();
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [filter, setFilter] = useState('todos');

    useEffect(() => {
        loadRegistros();
    }, []);

    const loadRegistros = async () => {
        try {
            const data = await registrosApi.listar();
            setRegistros(data);
        } catch (error) {
            console.error('Erro ao carregar registros:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja excluir este registro?')) return;

        setDeletingId(id);
        try {
            await registrosApi.deletar(id);
            setRegistros(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            alert('Erro ao excluir registro');
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateString) => {
        const date = parseLocalDate(dateString);
        return date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return '--:--';
        const parts = timeString.split(':');
        return `${parts[0]}:${parts[1]}`;
    };

    const groupByDate = (registros) => {
        const groups = {};
        registros.forEach(r => {
            const date = parseLocalDate(r.data).toDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(r);
        });
        return groups;
    };

    const getMealIcon = (typeId) => {
        switch (parseInt(typeId)) {
            case 1: return <Coffee size={18} />;
            case 2: return <Apple size={18} />;
            case 3: return <UtensilsCrossed size={18} />;
            case 4: return <Soup size={18} />;
            case 5: return <Moon size={18} />;
            default: return <UtensilsCrossed size={18} />;
        }
    };

    const filteredRegistros = filter === 'todos'
        ? registros
        : registros.filter(r => r.refeicao === parseInt(filter));

    const groupedRegistros = groupByDate(filteredRegistros);

    if (loading) {
        return <Loading fullScreen text="Carregando registros..." />;
    }

    return (
        <div className="registros-page">
            {/* Header */}
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={24} style={{ marginRight: 5 }} /> Voltar
                </button>
                <div>
                    <h1 className="page-title">Registros</h1>
                    <p className="page-subtitle">{registros.length} registros no total</p>
                </div>
            </header>

            {/* Filtros */}
            <div className="filters">
                <button
                    className={`filter-btn ${filter === 'todos' ? 'active' : ''}`}
                    onClick={() => setFilter('todos')}
                >
                    Todos
                </button>
                {Object.entries(TIPOS_REFEICAO).map(([key, value]) => (
                    <button
                        key={key}
                        className={`filter-btn ${filter === key ? 'active' : ''}`}
                        onClick={() => setFilter(key)}
                    >
                        {getMealIcon(key)} <span style={{ marginLeft: 8 }}>{value.label}</span>
                    </button>
                ))}
            </div>

            {/* Lista */}
            <div className="registros-content">
                {Object.keys(groupedRegistros).length === 0 ? (
                    <Card className="empty-state">
                        <div className="empty-icon">
                            <ClipboardList size={48} />
                        </div>
                        <p className="empty-text">Nenhum registro encontrado</p>
                        <Link to="/novo-registro">
                            <Button variant="primary">Criar Primeiro Registro</Button>
                        </Link>
                    </Card>
                ) : (
                    Object.entries(groupedRegistros).map(([date, regs]) => (
                        <div key={date} className="date-group">
                            <h3 className="date-header">{formatDate(date)}</h3>
                            <div className="date-registros">
                                {regs.map((registro) => (
                                    <Card key={registro.id} className="registro-card-full">
                                        <div className="registro-header">
                                            <div className="registro-tipo-badge-clean" style={{
                                                color: TIPOS_REFEICAO[registro.refeicao]?.color
                                            }}>
                                                {getMealIcon(registro.refeicao)}
                                                <span className="badge-label">{TIPOS_REFEICAO[registro.refeicao]?.label}</span>
                                            </div>
                                            <div className="registro-time">
                                                {formatTime(registro.horaAntes)} - {formatTime(registro.horaDepois)}
                                            </div>
                                        </div>

                                        <div className="registro-body">
                                            <div className="registro-metrics">
                                                <div className="metric">
                                                    <span className="metric-label">HGT Antes</span>
                                                    <span className="metric-value">{registro.hgtAntes}</span>
                                                    <span className="metric-unit">mg/dL</span>
                                                </div>
                                                <div className="metric-arrow">
                                                    <ArrowRight size={16} />
                                                </div>
                                                <div className="metric">
                                                    <span className="metric-label">HGT Depois</span>
                                                    <span className="metric-value highlight">{registro.hgtDepois}</span>
                                                    <span className="metric-unit">mg/dL</span>
                                                </div>
                                            </div>

                                            <div className="registro-doses">
                                                <div className="dose">
                                                    <span className="dose-icon"><Syringe size={16} /></span>
                                                    <span>Lenta: {registro.doseLentaAnte}u</span>
                                                </div>
                                                <div className="dose">
                                                    <span className="dose-icon"><Zap size={16} /></span>
                                                    <span>Rápida: {registro.doseRapida}u</span>
                                                </div>
                                            </div>

                                            {registro.observacao && (
                                                <div className="registro-obs">
                                                    <span className="obs-icon"><FileText size={16} /></span>
                                                    <p>{registro.observacao}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="registro-actions">
                                            <Link to={`/editar-registro/${registro.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <Pencil size={16} style={{ marginRight: 8 }} /> Editar
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(registro.id)}
                                                loading={deletingId === registro.id}
                                            >
                                                <Trash2 size={16} style={{ marginRight: 8 }} /> Excluir
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* FAB */}
            <Link to="/novo-registro" className="fab">
                <Plus size={24} />
            </Link>
        </div>
    );
};

export default Registros;
