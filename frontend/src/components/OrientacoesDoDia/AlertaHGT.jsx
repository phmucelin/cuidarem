import { AlertTriangle, Phone, MessageCircle } from 'lucide-react';
import './OrientacoesDoDia.css';

const AlertaHGT = ({ alertas }) => {
    if (!alertas || alertas.length === 0) return null;

    const handleLigar = (telefone) => {
        if (telefone) {
            // Limpar telefone para formato de link
            const tel = telefone.replace(/[^\d+]/g, '');
            window.location.href = `tel:${tel}`;
        }
    };

    const handleWhatsApp = (telefone, alerta) => {
        if (telefone) {
            // Limpar telefone e adicionar código do país
            let tel = telefone.replace(/[^\d]/g, '');
            if (!tel.startsWith('55')) {
                tel = '55' + tel;
            }
            const alertaTitulo = (alerta.titulo || 'HGT Crítico').replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu, '').trim();
            const alertaDetalhes = (alerta.mensagem || 'Valor acima de 350 mg/dL').replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu, '').trim();

            const mensagem = encodeURIComponent(
                `Olá Dr. Fernando,\n\n` +
                `Estou entrando em contato sobre o Gastao Mucelin.\n\n` +
                `Alerta: ${alertaTitulo}\n` +
                `Detalhes: ${alertaDetalhes}\n` +
                `Data: ${hoje}\n\n` +
                `Preciso de orientação.`
            );
            window.open(`https://wa.me/${tel}?text=${mensagem}`, '_blank');
        }
    };

    return (
        <div className="alertas-container">
            {alertas.map((alerta, index) => (
                <div key={index} className="alerta-card critico">
                    <div className="alerta-header">
                        <AlertTriangle size={24} />
                        <span className="alerta-tipo">ALERTA CRÍTICO</span>
                    </div>
                    <p className="alerta-mensagem">{alerta.mensagem}</p>

                    {alerta.contatoEmergencia && (
                        <div className="alerta-contato">
                            <span className="contato-nome">{alerta.contatoEmergencia}</span>
                            <span className="contato-telefone">{alerta.telefone}</span>
                        </div>
                    )}

                    {alerta.telefone && (
                        <div className="alerta-acoes">
                            <button
                                className="acao-btn ligar"
                                onClick={() => handleLigar(alerta.telefone)}
                            >
                                <Phone size={18} />
                                Ligar
                            </button>
                            <button
                                className="acao-btn whatsapp"
                                onClick={() => handleWhatsApp(alerta.telefone, alerta)}
                            >
                                <MessageCircle size={18} />
                                WhatsApp
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default AlertaHGT;
