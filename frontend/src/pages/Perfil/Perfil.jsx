import { useNavigate } from 'react-router-dom';
import { LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { parseLocalDate } from '../../utils/date';
import Button from '../../components/Button';
import Card from '../../components/Card';
import './Perfil.css';

const Perfil = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const formatDate = (dateString) => {
        if (!dateString) {
            return new Date().toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }
        return parseLocalDate(dateString).toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="perfil-page">
            <header className="perfil-header">
                <button className="back-btn-header" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={24} />
                    <span>Voltar</span>
                </button>
                <h1 className="perfil-name">{user?.nome || 'Cuidador'}</h1>
                <p className="perfil-email">{user?.email}</p>
            </header>

            <div className="perfil-content">
                <Card className="info-card">
                    <h3 className="card-title">Informações da Conta</h3>

                    <div className="info-row">
                        <span className="info-label">Nome</span>
                        <span className="info-value">{user?.nome}</span>
                    </div>

                    <div className="info-row">
                        <span className="info-label">Email</span>
                        <span className="info-value">{user?.email}</span>
                    </div>

                    <div className="info-row">
                        <span className="info-label">Membro desde</span>
                        <span className="info-value">{formatDate(user?.criadoEm)}</span>
                    </div>
                </Card>

                <Card className="info-card">
                    <h3 className="card-title">Sobre o CuidaBem</h3>
                    <p className="about-text">
                        O CuidaBem foi criado com o intuito de auxiliar os cuidadores do meu avô
                        para registrarem alguns de seus dados médicos. É sempre importante cuidar
                        de quem queremos por perto.
                    </p>
                    <p className="version">Versão 1.0.0</p>
                </Card>

                <div className="perfil-actions">
                    <Button
                        variant="danger"
                        fullWidth
                        onClick={logout}
                        icon={<LogOut size={20} />}
                    >
                        Sair da Conta
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Perfil;
