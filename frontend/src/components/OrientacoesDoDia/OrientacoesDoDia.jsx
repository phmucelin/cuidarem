import { useState, useEffect, useCallback } from 'react';
import {
    Pill,
    Syringe,
    Wind,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Phone,
    Calendar,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    RefreshCw
} from 'lucide-react';
import { orientacoesApi } from '../../services/api';
import Card from '../Card';
import Loading from '../Loading';
import AlertaHGT from './AlertaHGT';
import CountdownTimer from './CountdownTimer';
import OrientacaoCard from './OrientacaoCard';
import './OrientacoesDoDia.css';

const OrientacoesDoDia = ({ onHgtChange, hgtAtual = null }) => {
    const [orientacoes, setOrientacoes] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAll, setShowAll] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const loadOrientacoes = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await orientacoesApi.getDia(hgtAtual);
            setOrientacoes(data);
        } catch (err) {
            console.error('Erro ao carregar orientações:', err);
            setError('Erro ao carregar orientações');
        } finally {
            setLoading(false);
        }
    }, [hgtAtual]);

    useEffect(() => {
        loadOrientacoes();

        const interval = setInterval(loadOrientacoes, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [loadOrientacoes]);

    const handleMarcarExecutada = async (tipo, id) => {
        try {
            await orientacoesApi.marcarExecutada(tipo, id);
            loadOrientacoes();
        } catch (err) {
            console.error('Erro ao marcar orientação:', err);
        }
    };

    const getIconForType = (tipo) => {
        switch (tipo?.toUpperCase()) {
            case 'ORAL':
                return <Pill size={20} />;
            case 'INJETAVEL':
                return <Syringe size={20} />;
            case 'NEBULIZACAO':
            case 'INALACAO':
                return <Wind size={20} />;
            case 'PROCEDIMENTO':
                return <Calendar size={20} />;
            default:
                return <Pill size={20} />;
        }
    };

    const getColorForType = (tipo) => {
        switch (tipo?.toUpperCase()) {
            case 'ORAL':
                return 'var(--color-blue)';
            case 'INJETAVEL':
                return 'var(--color-coral)';
            case 'NEBULIZACAO':
            case 'INALACAO':
                return 'var(--color-green)';
            case 'PROCEDIMENTO':
                return 'var(--color-orange)';
            default:
                return 'var(--color-blue)';
        }
    };

    const formatHorario = (horarioStr) => {
        if (!horarioStr) return '';
        const parts = horarioStr.split(':');
        return `${parts[0]}:${parts[1]}`;
    };

    if (loading) {
        return (
            <Card className="orientacoes-card loading">
                <Loading text="Carregando orientações..." />
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="orientacoes-card error">
                <div className="error-content">
                    <AlertTriangle size={24} />
                    <p>{error}</p>
                    <button onClick={loadOrientacoes} className="retry-btn">
                        <RefreshCw size={16} />
                        Tentar novamente
                    </button>
                </div>
            </Card>
        );
    }

    if (!orientacoes) return null;

    const { orientacoesAgora, proximasOrientacoes, alertas, proximoProcedimentoCiclico, diaSemana } = orientacoes;
    const pendentes = orientacoesAgora?.filter(o => !o.executado) || [];
    const totalAgora = orientacoesAgora?.length || 0;
    const executados = totalAgora - pendentes.length;

    return (
        <div className="orientacoes-container">
            {alertas && alertas.length > 0 && (
                <AlertaHGT alertas={alertas} />
            )}

            <Card className={`orientacoes-card ${isExpanded ? 'expanded' : 'collapsed'}`}>
                <div
                    className="orientacoes-header clickable"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="header-left">
                        <h2 className="orientacoes-title">
                            <Clock size={22} />
                            Orientações do Dia
                        </h2>
                        <span className="dia-semana">{diaSemana}</span>
                    </div>
                    <div className="header-right">
                        {pendentes.length > 0 && (
                            <span className="pendentes-badge">{pendentes.length}</span>
                        )}
                        <span className="expand-icon">
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </span>
                    </div>

                    <div className="orientacoes-resumo">
                        <div className="resumo-item">
                            <span className="resumo-numero">{pendentes.length}</span>
                            <span className="resumo-label">Pendentes</span>
                        </div>
                        <div className="resumo-divider" />
                        <div className="resumo-item">
                            <span className="resumo-numero executado">{executados}</span>
                            <span className="resumo-label">Feitos</span>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); loadOrientacoes(); }}
                            className="refresh-btn"
                            title="Atualizar"
                        >
                            <RefreshCw size={16} />
                        </button>
                    </div>
                </div>

                {isExpanded && (
                    <div className="orientacoes-content">
                        {pendentes.length > 0 ? (
                            <div className="orientacoes-lista">
                                <h3 className="lista-titulo">Faça agora</h3>
                                {pendentes.slice(0, showAll ? undefined : 3).map((orientacao) => (
                                    <OrientacaoCard
                                        key={`${orientacao.tipo}-${orientacao.id}`}
                                        orientacao={orientacao}
                                        icon={getIconForType(orientacao.tipo)}
                                        color={getColorForType(orientacao.tipo)}
                                        formatHorario={formatHorario}
                                        onMarcarExecutada={handleMarcarExecutada}
                                    />
                                ))}

                                {pendentes.length > 3 && !showAll && (
                                    <button
                                        className="ver-mais-btn"
                                        onClick={() => setShowAll(true)}
                                    >
                                        Ver mais {pendentes.length - 3} orientações
                                        <ChevronRight size={16} />
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="orientacoes-vazio">
                                <CheckCircle2 size={32} className="icon-success" />
                                <p>Tudo em dia por agora!</p>
                            </div>
                        )}

                        {proximasOrientacoes && proximasOrientacoes.length > 0 && (
                            <div className="proximas-orientacoes">
                                <h3 className="lista-titulo">Próximas</h3>
                                <div className="proximas-lista">
                                    {proximasOrientacoes.slice(0, 3).map((orientacao) => (
                                        <div
                                            key={`prox-${orientacao.tipo}-${orientacao.id}`}
                                            className="proxima-item"
                                        >
                                            <span
                                                className="proxima-icon"
                                                style={{ color: getColorForType(orientacao.tipo) }}
                                            >
                                                {getIconForType(orientacao.tipo)}
                                            </span>
                                            <span className="proxima-nome">{orientacao.nome}</span>
                                            <span className="proxima-horario">
                                                {formatHorario(orientacao.horarioPrevisto)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}


                        {proximasOrientacoes && proximasOrientacoes[0] && (
                            <CountdownTimer
                                proximaOrientacao={proximasOrientacoes[0]}
                                formatHorario={formatHorario}
                            />
                        )}
                    </div>
                )}
            </Card>

            {proximoProcedimentoCiclico && (
                <Card className="procedimento-card">
                    <div className="procedimento-header">
                        <Calendar size={20} />
                        <span>Próximo Procedimento</span>
                    </div>
                    <div className="procedimento-content">
                        <h4>{proximoProcedimentoCiclico.nome}</h4>
                        <div className="procedimento-info">
                            <span className="dias-restantes">
                                {proximoProcedimentoCiclico.diasRestantes === 0
                                    ? 'Hoje!'
                                    : `Em ${proximoProcedimentoCiclico.diasRestantes} dia(s)`}
                            </span>
                            <span className="data-prevista">
                                {new Date(proximoProcedimentoCiclico.dataPrevista).toLocaleDateString('pt-BR')}
                            </span>
                        </div>
                        {proximoProcedimentoCiclico.instrucoes && (
                            <p className="procedimento-instrucoes">
                                {proximoProcedimentoCiclico.instrucoes}
                            </p>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default OrientacoesDoDia;
