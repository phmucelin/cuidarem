import { CheckCircle2 } from 'lucide-react';
import './OrientacoesDoDia.css';

const OrientacaoCard = ({
    orientacao,
    icon,
    color,
    formatHorario,
    onMarcarExecutada
}) => {
    const handleClick = () => {
        if (!orientacao.executado) {
            onMarcarExecutada(orientacao.tipo, orientacao.id);
        }
    };

    return (
        <div
            className={`orientacao-item ${orientacao.executado ? 'executado' : ''} prioridade-${orientacao.prioridade}`}
            onClick={handleClick}
        >
            <div className="orientacao-left">
                <span className="orientacao-icon" style={{ color }}>
                    {icon}
                </span>
                <div className="orientacao-info">
                    <span className="orientacao-nome">{orientacao.nome}</span>
                    <span className="orientacao-dosagem">{orientacao.dosagem}</span>
                    {orientacao.instrucoes && (
                        <span className="orientacao-instrucoes">{orientacao.instrucoes}</span>
                    )}
                </div>
            </div>
            <div className="orientacao-right">
                <span className="orientacao-horario">
                    {formatHorario(orientacao.horarioPrevisto)}
                </span>
                {orientacao.executado ? (
                    <span className="orientacao-check">
                        <CheckCircle2 size={20} />
                    </span>
                ) : (
                    <button
                        className="marcar-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClick();
                        }}
                    >
                        Feito
                    </button>
                )}
            </div>
        </div>
    );
};

export default OrientacaoCard;
