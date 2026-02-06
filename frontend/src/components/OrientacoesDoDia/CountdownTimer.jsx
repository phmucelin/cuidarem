import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';
import './OrientacoesDoDia.css';

const CountdownTimer = ({ proximaOrientacao, formatHorario }) => {
    const [tempoRestante, setTempoRestante] = useState('');
    const [minutos, setMinutos] = useState(0);

    useEffect(() => {
        const calcularTempoRestante = () => {
            const agora = new Date();
            const horarioStr = proximaOrientacao?.horarioPrevisto;

            if (!horarioStr) {
                setTempoRestante('--:--');
                return;
            }

            // Parse horário (formato "HH:MM:SS" ou "HH:MM")
            const parts = horarioStr.split(':');
            const horaProxima = parseInt(parts[0], 10);
            const minProxima = parseInt(parts[1], 10);

            const proximoHorario = new Date();
            proximoHorario.setHours(horaProxima, minProxima, 0, 0);

            // Se já passou, mostrar 0
            if (proximoHorario <= agora) {
                setTempoRestante('Agora!');
                setMinutos(0);
                return;
            }

            const diff = proximoHorario - agora;
            const horas = Math.floor(diff / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            setMinutos(mins + horas * 60);

            if (horas > 0) {
                setTempoRestante(`${horas}h ${mins}min`);
            } else {
                setTempoRestante(`${mins} min`);
            }
        };

        calcularTempoRestante();
        const interval = setInterval(calcularTempoRestante, 60000); // Atualizar a cada minuto

        return () => clearInterval(interval);
    }, [proximaOrientacao]);

    if (!proximaOrientacao) return null;

    const isUrgente = minutos <= 15;
    const isProximo = minutos <= 30;

    return (
        <div className={`countdown-container ${isUrgente ? 'urgente' : isProximo ? 'proximo' : ''}`}>
            <div className="countdown-icon">
                <Timer size={18} />
            </div>
            <div className="countdown-info">
                <span className="countdown-label">Próxima orientação</span>
                <span className="countdown-nome">{proximaOrientacao.nome}</span>
            </div>
            <div className="countdown-tempo">
                <span className="tempo-valor">{tempoRestante}</span>
                <span className="tempo-horario">
                    às {formatHorario(proximaOrientacao.horarioPrevisto)}
                </span>
            </div>
        </div>
    );
};

export default CountdownTimer;
